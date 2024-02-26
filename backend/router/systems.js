const express = require('express');
const router = express.Router();
const connection = require('../db');
const path = require('path');
const { db, connectToDatabase } = require(path.join(__dirname, '../db'));
const moment = require('moment');

function generateId() {
  const maxId = 999999999;
  const minId = 100000000;
  const id = Math.floor(Math.random() * (maxId - minId + 1)) + minId;
  return id;
}

router.get('/getAll', async (req, res) => {
  try {
    const systemIdFilter = req.query.system_id;
    const projectFilter = req.query.project_id;
    let query = `
      SELECT Systems.id, 
             Systems.project_id,
             Systems.system_id,
             Systems.system_nameTH,
             Systems.system_nameEN,
             Systems.system_shortname,
             Systems.is_deleted, /* เพิ่มฟิลด์ is_deleted */
             COUNT(Screens.screen_id) AS screen_count, 
             AVG(screens.screen_progress) AS system_progress,
             DATE_FORMAT(MIN(Screens.screen_plan_start), '%Y-%m-%d') AS system_plan_start,
             DATE_FORMAT(MAX(Screens.screen_plan_end), '%Y-%m-%d') AS system_plan_end,
             DATEDIFF(MAX(Screens.screen_plan_end), MIN(Screens.screen_plan_start)) AS system_manday,
             Systems.is_deleted
      FROM Systems 
      LEFT JOIN Screens ON Systems.id = Screens.system_id 
    `;
    const queryParams = [];

    if (projectFilter) {
      query += ' WHERE Systems.project_id = ? AND Systems.is_deleted = false'; // เพิ่มเงื่อนไข is_deleted = false
      queryParams.push(projectFilter);
    } else if (systemIdFilter) {
      query += ' WHERE Systems.id = ? AND Systems.is_deleted = false'; // เพิ่มเงื่อนไข is_deleted = false
      queryParams.push(systemIdFilter);
    } else {
      query += ' WHERE Systems.is_deleted = false'; // เพิ่มเงื่อนไข is_deleted = false
    }

    query += ' GROUP BY Systems.id';

    connection.query(query, queryParams, async (err, results, fields) => {
      if (err) {
        console.error(err);
        return res.status(400).send();
      }
      // Format system_plan_start and system_plan_end to contain only date
      for (const system of results) {
        const updatedSystem = await updateSystem(system);
        Object.assign(system, updatedSystem);
      }
      res.status(200).json(results);
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send();
  }
});

router.get('/getAllHistorySystem', async (req, res) => {
  try {
    let query = `
      SELECT Systems.id, 
             Systems.project_id,
             Systems.system_id,
             Systems.system_nameTH,
             Systems.system_nameEN,
             Systems.system_shortname,
             Systems.is_deleted,
             COUNT(Screens.screen_id) AS screen_count, 
             AVG(screens.screen_progress) AS system_progress,
             DATE_FORMAT(MIN(Screens.screen_plan_start), '%Y-%m-%d') AS system_plan_start,
             DATE_FORMAT(MAX(Screens.screen_plan_end), '%Y-%m-%d') AS system_plan_end,
             DATEDIFF(MAX(Screens.screen_plan_end), MIN(Screens.screen_plan_start)) AS system_manday,
             Systems.is_deleted /* เพิ่มฟิลด์ is_deleted ในส่วน SELECT */
      FROM Systems 
      LEFT JOIN Screens ON Systems.id = Screens.system_id 
      WHERE Systems.is_deleted = 1 /* เพิ่มเงื่อนไขให้แสดงเฉพาะ is_deleted เป็น True */
      GROUP BY Systems.id
    `;

    connection.query(query, async (err, results, fields) => {
      if (err) {
        console.error(err);
        return res.status(400).send();
      }
      // Format system_plan_start and system_plan_end to contain only date
      for (const system of results) {
        const updatedSystem = await updateSystem(system);
        Object.assign(system, updatedSystem);
      }
      res.status(200).json(results);
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send();
  }
});

async function updateSystem(system) {
  try {
    const updateQuery = `
      UPDATE systems 
      SET 
        screen_count = ?,
        system_progress = ?,
        system_plan_start = ?, 
        system_plan_end = ?,
        system_manday = ?
      WHERE id = ?
    `;

    const updatedSystem = {
      screen_count: system.screen_count,
      system_progress: system.system_progress,
      system_plan_start: new Date(system.system_plan_start).toISOString().split('T')[0],
      system_plan_end: new Date(system.system_plan_end).toISOString().split('T')[0],
      system_manday: system.system_manday,
      id: system.id
    };

    await new Promise((resolve, reject) => {
      connection.query(updateQuery, [updatedSystem.screen_count, updatedSystem.system_progress, updatedSystem.system_plan_start, updatedSystem.system_plan_end, updatedSystem.system_manday, updatedSystem.id], (err, result) => {
        if (err) reject(err);
        resolve(updatedSystem);
      });
    });

    return updatedSystem;
  } catch (err) {
    throw err;
  }
}

// * GET one by id
router.get('/getOne/:id', async (req, res) => {
  const id = req.params.id;
  try {
    connection.query(
      'SELECT * FROM systems WHERE id = ?',
      [id],
      (err, results, fields) => {
        if (err) {
          console.error(err);
          return res.status(400).send();
        }
        if (results.length === 0) {
          return res.status(404).json({ message: 'System not found!' });
        }
        const system = results[0];
        if (system.is_deleted === 1) {
          return res.status(200).json({ message: 'This system has been deleted.' });
        }
        res.status(200).json(system);
      }
    );
  } catch (err) {
    console.error(err);
    return res.status(500).send();
  }
});

router.get('/searchByProjectId/:project_id', async (req, res) => {
  try {
    const { project_id } = req.params;

    let query = `
      SELECT Systems.id, 
             Systems.project_id,
             Systems.system_id,
             Systems.system_nameTH,
             Systems.system_nameEN,
             Systems.system_shortname,
             Systems.is_deleted,
             COUNT(Screens.screen_id) AS screen_count, 
             AVG(screens.screen_progress) AS system_progress,
             DATE_FORMAT(MIN(Screens.screen_plan_start), '%Y-%m-%d') AS system_plan_start,
             DATE_FORMAT(MAX(Screens.screen_plan_end), '%Y-%m-%d') AS system_plan_end,
             DATEDIFF(MAX(Screens.screen_plan_end), MIN(Screens.screen_plan_start)) AS system_manday
      FROM Systems 
      LEFT JOIN Screens ON Systems.id = Screens.system_id 
      WHERE Systems.project_id = ? AND Systems.is_deleted = false
      GROUP BY Systems.id
    `;

    connection.query(query, [project_id], async (err, results, fields) => {
      if (err) {
        console.error(err);
        return res.status(400).send();
      }
      // Format system_plan_start and system_plan_end to contain only date
      for (const system of results) {
        const updatedSystem = await updateSystem(system);
        Object.assign(system, updatedSystem);
      }
      res.status(200).json(results);
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send();
  }
});

// * GET systems by project_id with is_deleted = 1
router.get('/searchByProjectId_delete/:project_id', async (req, res) => {
  try {
    const { project_id } = req.params;

    let query = `
      SELECT Systems.id, 
             Systems.project_id,
             Systems.system_id,
             Systems.system_nameTH,
             Systems.system_nameEN,
             Systems.system_shortname,
             Systems.is_deleted,
             COUNT(Screens.screen_id) AS screen_count, 
             AVG(screens.screen_progress) AS system_progress,
             DATE_FORMAT(MIN(Screens.screen_plan_start), '%Y-%m-%d') AS system_plan_start,
             DATE_FORMAT(MAX(Screens.screen_plan_end), '%Y-%m-%d') AS system_plan_end,
             DATEDIFF(MAX(Screens.screen_plan_end), MIN(Screens.screen_plan_start)) AS system_manday
      FROM Systems 
      LEFT JOIN Screens ON Systems.id = Screens.system_id 
      WHERE Systems.project_id = ? AND Systems.is_deleted = 1
      GROUP BY Systems.id
    `;

    connection.query(query, [project_id], async (err, results, fields) => {
      if (err) {
        console.error(err);
        return res.status(400).send();
      }
      // Format system_plan_start and system_plan_end to contain only date
      for (const system of results) {
        const updatedSystem = await updateSystem(system);
        Object.assign(system, updatedSystem);
      }
      res.status(200).json(results);
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send();
  }
});


// * POST FROM systems
router.post('/createSystem', async (req, res) => {
  const {
    project_id,
    system_id,
    system_nameTH,
    system_nameEN,
    system_shortname,
    system_analyst,
    system_member,
  } = req.body;
  const id = generateId();
  try {
    connection.query(
      'INSERT INTO systems(id, project_id,system_id,system_nameTH,system_nameEN,system_shortname,system_analyst, system_member) VALUES(?, ?, ?, ?, ? ,? ,?,?)',
      [
        id,
        project_id,
        system_id,
        system_nameTH,
        system_nameEN,
        system_shortname,
        system_analyst,
        system_member,
      ],
      (err, results, fields) => {
        if (err) {
          console.error('Error while inserting a systems into the database', err);
          return res.status(400).send();
        }
        return res
          .status(201)
          .json({ message: 'New systems successfully created!' });
      }
    );
  } catch (err) {
    console.error(err);
    return res.status(500).send();
  }
});

router.put('/updateSystem/:id', async (req, res) => {
  const id = req.params.id;
  const {
    system_nameTH,
    system_nameEN,
    system_shortname,
    project_id
  } = req.body;

  const updatedSystemFields = {};

  if (system_nameTH !== undefined) {
    updatedSystemFields.system_nameTH = system_nameTH;
  }

  if (system_nameEN !== undefined) {
    updatedSystemFields.system_nameEN = system_nameEN;
  }

  if (system_shortname !== undefined) {
    updatedSystemFields.system_shortname = system_shortname;
  }

  if (project_id !== undefined) {
    updatedSystemFields.project_id = project_id;
  }

  if (Object.keys(updatedSystemFields).length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  try {
    connection.query(
      'UPDATE systems SET ? WHERE id = ?',
      [updatedSystemFields, id],
      (err, results, fields) => {
        if (err) {
          console.error(err);
          return res.status(400).send();
        }
        res.status(200).json({ message: 'System updated successfully!' });
      }
    );
  } catch (err) {
    console.error(err);
    return res.status(500).send();
  }
});

// DELETE delete/:id
router.delete("/delete/:id", async (req, res) => {
  const id = req.params.id;

  try {
    connection.query(
      "UPDATE systems SET is_deleted = true WHERE id = ?",
      [id],
      (err, results, fields) => {
        if (err) {
          console.log(err);
          return res.status(500).send();
        }
        if (results.affectedRows === 0) {
          return res.status(404).json({ message: "No system with that id!" });
        }
        return res.status(200).json({ message: "System deleted successfully!" });
      }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

router.delete("/deleteHistorySystems/:id", async (req, res) => {
  const id = req.params.id;

  try {
    connection.beginTransaction(async (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send();
      }

      // Delete tasks related to screens with the given system_id
      connection.query(
        `
        DELETE FROM tasks
        WHERE screen_id IN (SELECT id FROM screens WHERE system_id = ?)
        `,
        [id],
        async (err, results, fields) => {
          if (err) {
            console.error(err);
            connection.rollback(() => {
              return res.status(500).send();
            });
          }

          // Now, delete screens related to the system_id
          connection.query(
            `
            DELETE FROM screens
            WHERE system_id = ?
            `,
            [id],
            async (err, results, fields) => {
              if (err) {
                console.error(err);
                connection.rollback(() => {
                  return res.status(500).send();
                });
              }

              // Now, delete the system itself
              connection.query(
                `
                DELETE FROM systems
                WHERE id = ?
                `,
                [id],
                async (err, results, fields) => {
                  if (err) {
                    console.error(err);
                    connection.rollback(() => {
                      return res.status(500).send();
                    });
                  }

                  connection.commit((err) => {
                    if (err) {
                      console.error(err);
                      connection.rollback(() => {
                        return res.status(500).send();
                      });
                    }
                    return res.status(200).json({ message: "System and related data deleted successfully!" });
                  });
                }
              );
            }
          );
        }
      );
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send();
  }
});


router.post('/addUserSystem', async (req, res) => {
  const { user_id, system_ids } = req.body;
  try {
    const createUserSystemMappings = async (user_id, system_ids) => {
      // Check that system_ids is an array
      if (!Array.isArray(system_ids)) {
        console.error('Error: system_ids is not an array');
        return res.status(400).send('system_ids must be an array');
      }

      // Map over the system IDs and insert a new row into the user_systems table for each one
      for (const system_id of system_ids) {
        try {
          await connection.query(
            'INSERT INTO user_systems (user_id, system_id) VALUES (?, ?)',
            [user_id, system_id]
          );
        } catch (error) {
          console.error(
            `Error while creating user-system mapping for user ${user_id} and system ${system_id}`,
            error
          );
          return res
            .status(500)
            .send(
              `Error while creating user-system mapping for user ${user_id} and system ${system_id}`
            );
        }
      }

      return res.status(200).send('User-system mappings created successfully');
    };
    await createUserSystemMappings(user_id, system_ids);
  } catch (err) {
    console.error('Error while creating user-system mappings', err);
    return res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
