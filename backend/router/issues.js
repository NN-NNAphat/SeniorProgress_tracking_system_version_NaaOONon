const express = require("express");
const router = express.Router();
const connection = require("../db");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit"); // เพิ่มโมดูล pdfkit

function generateId() {
  const maxId = 999999999;
  const minId = 100000000;
  const id = Math.floor(Math.random() * (maxId - minId + 1)) + minId;
  return id;
}

// configure Multer to handle file uploads
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "../frontend/static/uploadfiles/");
  },
  filename(req, file, cb) {
    const originalname = file.originalname;
    const filename = originalname.substring(originalname.lastIndexOf("/") + 1);
    cb(null, filename);
  },
});

const upload = multer({ storage });

// * GET All FROM issues
router.get("/getAll", async (req, res) => {
  const projectFilter = req.query.project_id;
  const systemFilter = req.query.system_id;
  const assignIdFilter = req.query.user_assign_id;
  const qcIdFilter = req.query.user_qc_id;
  let query = "SELECT * FROM issues";
  const queryParams = [];
  if (projectFilter) {
    query += " WHERE project_id = ?";
    queryParams.push(projectFilter);
  } else if (systemFilter) {
    query += " WHERE system_id = ?";
    queryParams.push(systemFilter);
    //check จาก id
  } else if (assignIdFilter) {
    query += " WHERE user_assign_id = ?";
    queryParams.push(assignIdFilter);
  } else if (qcIdFilter) {
    query += " WHERE user_qc_id = ?";
    queryParams.push(qcIdFilter);
  }

  try {
    connection.query(query, queryParams, (err, results, fields) => {
      if (err) {
        console.log(err);
        return res.status(400).send();
      }
      res.status(200).json(results);
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

//* GET one by id
router.get("/getOne/:id", async (req, res) => {
  const id = req.params.id;
  try {
    connection.query(
      "SELECT * FROM issues WHERE id = ?",
      [id],
      (err, results, fields) => {
        if (err) {
          console.log(err);
          return res.status(400).send();
        }
        res.status(200).json(results);
      }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

//* GET one dev by user_assign_id
router.get("/getOneName/:user_assign_id", async (req, res) => {
  const user_assign_id = req.params.user_assign_id;
  try {
    connection.query(
      "SELECT * FROM issues WHERE user_assign_id = ?",
      [user_assign_id],
      (err, results, fields) => {
        if (err) {
          console.log(err);
          return res.status(400).send();
        }
        res.status(200).json(results);
      }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

//* GET one qc by user_qc_id
router.get("/getOneNameQc/:user_qc_id", async (req, res) => {
  const user_qc_id = req.params.user_qc_id;
  try {
    connection.query(
      "SELECT * FROM issues WHERE user_qc_id = ?",
      [user_qc_id],
      (err, results, fields) => {
        if (err) {
          console.log(err);
          return res.status(400).send();
        }
        res.status(200).json(results);
      }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

// * POST FROM issues
router.post("/createIssue", upload.single("file"), (req, res) => {
  const {
    screen_id,
    system_id,
    project_id,
    user_assign_id,
    user_qc_id,
    issue_name,
    issue_id,
    issue_type,
    issue_informer,
    issue_priority,
    issue_end,
    issue_assign,
    issue_qc,
    issue_des,
    issue_des_sa,
    issue_type_sa,
    issue_doc_id,
    issue_customer,
    issue_des_dev,
    issue_des_implementer,
    issue_start,
    issue_expected,
    issue_status,
    issue_accepting,
    issue_manday,
    issue_complete,
    issue_status_developer,
    issue_status_implement,
    issue_round,
    issue_filename,
  } = req.body;

  // const issue_filename = req.file ? req.file.filename : null;

  try {
    connection.query(
      "INSERT INTO issues (screen_id, system_id, project_id, user_assign_id , user_qc_id, issue_name, issue_id, issue_type, issue_informer, issue_priority, issue_end, issue_assign, issue_qc, issue_des, issue_des_sa, issue_type_sa, issue_doc_id, issue_customer, issue_filename, issue_des_dev, issue_des_implementer, issue_start, issue_expected, issue_status, issue_accepting, issue_manday, issue_complete ,issue_status_developer,issue_status_implement,issue_round) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        screen_id,
        system_id,
        project_id,
        user_assign_id,
        user_qc_id,
        issue_name,
        issue_id,
        issue_type,
        issue_informer,
        issue_priority,
        issue_end,
        issue_assign,
        issue_qc,
        issue_des,
        issue_des_sa,
        issue_type_sa,
        issue_doc_id,
        issue_customer,
        issue_filename,
        issue_des_dev,
        issue_des_implementer,
        issue_start,
        issue_expected,
        issue_status,
        issue_accepting,
        issue_manday,
        issue_complete,
        issue_status_developer,
        issue_status_implement,
        issue_round,
      ],
      (err, results, fields) => {
        if (err) {
          console.log("Error while inserting an issue into the database", err);
          return res.status(400).send();
        }
        return res
          .status(201)
          .json({ message: "New issue successfully created!" });
      }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

// getpdf
router.get("/getpdf/:id", (req, res) => {
  const id = req.params.id;
  const query = "SELECT issue_filename FROM issues WHERE id = ?";

  connection.query(query, id, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Error retrieving data" });
      return;
    }

    if (results.length > 0) {
      let pdfData = results[0].issue_filename;

      if (pdfData && pdfData.startsWith("data:application/pdf;base64,")) {
        // Remove the data URI prefix if it exists
        pdfData = pdfData.replace(/^data:application\/pdf;base64,/, "");
      }

      const pdfBuffer = Buffer.from(pdfData, "base64");

      console.log("Length of retrieved PDF data:", pdfData.length);
      console.log("Length of PDF buffer:", pdfBuffer.length);

      if (pdfBuffer.length > 0) {
        res.setHeader("Content-Type", "application/pdf");
        res.end(pdfBuffer);
      } else {
        res.status(404).json({ error: "Invalid PDF data" });
      }
    } else {
      res.status(404).json({ error: "Data not found" });
    }
  });
});

//* Update issue by dev แก้ตรงนี้ File
router.put("/updateIssueDev/:id", upload.single("file"), (req, res) => {
  const id = req.params.id;
  const {
    issue_accepting,
    issue_manday,
    issue_start,
    issue_expected,
    issue_status,
    issue_complete,
    issue_des_dev,
  } = req.body;
  connection.query(
    "SELECT issues FROM issue_filename WHERE id = ?",
    [id],
    (err, results) => {
      if (err) {
        console.log("Error database", err);
        return res.status(400).send();
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "File not found" });
      }

      const issue_filename = results[0].issue_filename;

      // Update the text1 field in the database
      try {
        connection.query(
          "UPDATE issues SET issue_accepting = ?, issue_manday = ?, issue_start = ?, issue_expected = ?, issue_status = ?, issue_complete = ?, issue_des_dev = ? WHERE id = ?",
          [
            issue_accepting,
            issue_manday,
            issue_start,
            issue_expected,
            issue_status,
            issue_complete,
            issue_des_dev,
            id,
          ],
          (err, results, fields) => {
            if (err) {
              console.log(err);
              return res.status(400).send();
            }
            res.status(200).json({ message: "Issue updated successfully!" });
          }
        );
      } catch (err) {
        console.log(err);
        return res.status(500).send();
      }
    }
  );
});

//* Update issue by Admin
router.put("/updateIssueAdmin/:id", upload.single("file"), (req, res) => {
  const id = req.params.id;
  const {
    screen_id,
    user_assign_id,
    user_qc_id,
    issue_name,
    issue_id,
    issue_type,
    issue_informer,
    issue_priority,
    issue_end,
    issue_assign,
    issue_qc,
    issue_des,
    issue_des_sa,
    issue_doc_id,
    issue_customer,
    issue_des_implementer,
    issue_accepting,
    issue_manday,
    issue_start,
    issue_expected,
    issue_status,
    issue_complete,
    issue_des_dev,
    issue_status_developer,
    issue_status_implement,
    issue_round,
  } = req.body;
  connection.query(
    "SELECT issue_filename FROM issues WHERE id = ?",
    [id],
    (err, results) => {
      if (err) {
        console.log("Error database", err);
        return res.status(400).send();
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "File not found" });
      }

      const issue_filename = results[0].issue_filename;
      // Update the text1 field in the database
      try {
        connection.query(
          "UPDATE issues SET screen_id = ?, user_assign_id = ?,user_qc_id = ?,issue_name = ?, issue_id = ?, issue_type = ?, issue_informer = ?, issue_priority = ?, issue_end = ?, issue_assign = ?, issue_qc = ?, issue_des = ?, issue_des_sa = ?, issue_doc_id = ?, issue_customer = ?, issue_des_implementer = ?, issue_accepting = ?, issue_manday = ?, issue_start = ?, issue_expected = ?, issue_status = ?, issue_complete = ?, issue_des_dev = ?, issue_status_developer = ?, issue_status_implement = ?, issue_round = ? WHERE id = ?",
          [
            screen_id,
            user_assign_id,
            user_qc_id,
            issue_name,
            issue_id,
            issue_type,
            issue_informer,
            issue_priority,
            issue_end,
            issue_assign,
            issue_qc,
            issue_des,
            issue_des_sa,
            issue_doc_id,
            issue_customer,
            issue_des_implementer,
            issue_accepting,
            issue_manday,
            issue_start,
            issue_expected,
            issue_status,
            issue_complete,
            issue_des_dev,
            issue_status_developer,
            issue_status_implement,
            issue_round,
            id,
          ],
          (err, results, fields) => {
            if (err) {
              console.log(err);
              return res.status(400).send();
            }
            res.status(200).json({ message: "Issue updated successfully!" });
          }
        );
      } catch (err) {
        console.log(err);
        return res.status(500).send();
      }
    }
  );
});

//* Update issue by implementer
router.put("/updateIssueImplementer/:id", async (req, res) => {
  const id = req.params.id;
  const {
    screen_id,
    issue_name,
    issue_id,
    issue_type,
    issue_informer,
    issue_priority,
    issue_end,
    issue_assign,
    issue_qc,
    issue_des,
    issue_des_sa,
    issue_doc_id,
    issue_customer,
    issue_filename,
    issue_des_implementer,
  } = req.body;

  connection.query(
    "SELECT issues FROM issue_filename WHERE id = ?",
    [id],
    (err, results) => {
      if (err) {
        console.log("Error database", err);
        return res.status(400).send();
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "File not found" });
      }

      const issue_filename = results[0].issue_filename;
      // Update the text1 field in the database
      try {
        connection.query(
          "UPDATE issues SET screen_id = ?, issue_name = ?, issue_id = ?, issue_type = ?, issue_informer = ?, issue_priority = ?, issue_end = ?, issue_assign = ?, issue_qc = ?, issue_des = ?, issue_des_sa = ?, issue_doc_id = ?, issue_customer = ?, issue_filename = ?, issue_des_implementer = ? WHERE id = ?",
          [
            screen_id,
            issue_name,
            issue_id,
            issue_type,
            issue_informer,
            issue_priority,
            issue_end,
            issue_assign,
            issue_qc,
            issue_des,
            issue_des_sa,
            issue_doc_id,
            issue_customer,
            issue_filename,
            issue_des_implementer,
            id,
          ],
          (err, results, fields) => {
            if (err) {
              console.log(err);
              return res.status(400).send();
            }
            res.status(200).json({ message: "Issue updated successfully!" });
          }
        );
      } catch (err) {
        console.log(err);
        return res.status(500).send();
      }
    }
  );
});

router.put("/updateIssueAssignName/:id", async (req, res) => {
  const id = req.params.id;
  const { issue_assign } = req.body;

  try {
    connection.query(
      "UPDATE issues SET issue_assign = ? WHERE id = ?",
      [issue_assign, id],
      (err, results, fields) => {
        if (err) {
          console.log(err);
          return res.status(400).send();
        }
        res.status(200).json({ message: "User assign updated successfully!" });
      }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});
router.put("/updateIssueQcName/:id", async (req, res) => {
  const id = req.params.id;
  const { issue_qc } = req.body;

  try {
    connection.query(
      "UPDATE issues SET issue_qc = ? WHERE id = ?",
      [issue_qc, id],
      (err, results, fields) => {
        if (err) {
          console.log(err);
          return res.status(400).send();
        }
        res.status(200).json({ message: "User assign updated successfully!" });
      }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

// //* DELETE issue by ID
// router.delete("/delete/:id", async (req, res) => {
//   const id = req.params.id;
//   connection.query(
//     "SELECT issues FROM issue_filename WHERE id = ?",
//     [id],
//     (err, results, fields) => {
//       if (err) {
//         console.log("Error database", err);
//         return res.status(400).send();
//       }
//       if (results.length === 0) {
//         return res.status(404).json({ message: "File not found" });
//       }
//       const issue_filename = results[0].issue_filename;
//       if (!issue_filename) {
//         return connection.query(
//           "DELETE FROM issues WHERE id = ?",
//           [id],
//           (err, results, fields) => {
//             if (err) {
//               console.log("Error database", err);
//               return res.status(400).send();
//             }
//             return res.status(200).json({ message: "successfully deleted!" });
//           }
//         );
//       }
//       const filePath = path.join("../frontend/static/uploadfiles/", pdf);
//       try {
//         fs.unlinkSync(filePath);
//         connection.query(
//           "DELETE FROM issues WHERE issue_filename = ?",
//           [id],
//           (err, results, fields) => {
//             if (err) {
//               console.log("Error database", err);
//               return res.status(400).send();
//             }
//             return res.status(200).json({ message: "successfully deleted!" });
//           }
//         );
//       } catch (err) {
//         console.log(err);
//         return res.status(500).send();
//       }
//     }
//   );
// });

//* DELETE issue by ID
router.delete("/delete/:id", async (req, res) => {
  const id = req.params.id;

  try {
    connection.query(
      "DELETE FROM issues WHERE id = ?",
      [id],
      (err, results, fields) => {
        if (err) {
          console.log(err);
          return res.status(400).send();
        }
        if (results.affectedRows === 0) {
          return res.status(404).json({ message: "No issue with that id!" });
        }
        return res.status(200).json({ message: "issue successfully!" });
      }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

router.post("/addUserIssue", async (req, res) => {
  const { user_id, issue_ids } = req.body;
  try {
    const createUserIssues = (user_id, issue_ids) => {
      // Check that issue_ids is an array
      if (!Array.isArray(issue_ids)) {
        console.log("Error: issue_ids is not an array");
        return;
      }

      // {
      //     "user_id": 15,
      //     "issue_ids": [1]
      //   }

      // Map over the issue IDs and insert a new row into the user_issues table for each one
      issue_ids.map((issue_id) => {
        connection.query(
          "INSERT INTO user_issues (user_id, issue_id) VALUES (?, ?)",
          [user_id, issue_id],
          (error, results, fields) => {
            if (error) {
              console.log(
                `Error while creating user-issue mapping for user ${user_id} and issue ${issue_id}`,
                error
              );
            }
          }
        );
      });
    };
    createUserIssues(user_id, issue_ids);
    return res.status(200).send("User-issues mappings created successfully");
  } catch (err) {
    console.log("Error while creating user-issues mappings", err);
    return res.status(500).send();
  }
});

// GET endpoint to download a file
router.get("/downloadfile/:issue_filename", (req, res) => {
  const issue_filename = req.params.issue_filename;
  connection.query(
    "SELECT issues FROM issue_filename WHERE issue_filename = ?",
    [issue_filename],
    (err, results, fields) => {
      if (err) {
        console.log("Error database", err);
        return res.status(400).send();
      }
      const file = results[0].issue_filename;
      const filePath = path.join("../frontend/static/uploadfiles/", file);
      const fileStream = fs.createReadStream(filePath);

      // Set the Content-Disposition header to force a download
      res.setHeader("Content-Disposition", `attachment; filename="${file}"`);

      // Set the content type header to match the file type
      res.setHeader("Content-Type", "application/pdf");

      // Send the file to the client for download
      fileStream.pipe(res);
    }
  );
});

//length issue
router.get("/getLength/:system_id", async (req, res) => {
  const system_id = req.params.system_id;
  try {
    connection.query(
      "SELECT COUNT(*) AS length FROM issues WHERE system_id = ?",
      [system_id],
      (err, results, fields) => {
        if (err) {
          console.log(err);
          return res.status(400).send();
        }
        res.status(200).json(results);
      }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

router.get("/getOwnIssue/:user_assign_id", async (req, res) => {
  const user_assign_id = req.params.user_assign_id;
  try {
    connection.query(
      `SELECT issue_name, issue_type, issue_priority, issue_status_developer,issue_status_implement,issue_end
    FROM issues
    WHERE user_assign_id = ?
      AND issue_status_developer != 'แก้ไขเรียบร้อย'`,
      [user_assign_id],
      (err, results, fields) => {
        if (err) {
          console.log(err);
          return res.status(400).send();
        }
        res.status(200).json(results);
      }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

router.get("/getOwnIssueQC/:user_qc_id", async (req, res) => {
  const user_qc_id = req.params.user_qc_id;
  try {
    connection.query(
      `SELECT issue_name, issue_type, issue_priority, issue_status_developer, issue_status_implement, issue_end 
      FROM issues WHERE user_qc_id = ? AND issue_status_developer = 'แก้ไขเรียบร้อย' 
      AND (issue_status_implement IS NULL OR issue_status_implement != 'ตรวจสอบผ่าน');`,
      [user_qc_id],
      (err, results, fields) => {
        if (err) {
          console.log(err);
          return res.status(400).send();
        }
        res.status(200).json(results);
      }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

router.get("/getSum/:system_id", async (req, res) => {
  const system_id = req.params.system_id;
  try {
    connection.query(
      `SELECT system_id, issue_type, COUNT(*) AS issue_count
      FROM issues
      WHERE system_id = ? AND (issue_type = 'PNI' OR issue_type = 'PNC')
      GROUP BY system_id, issue_type;`,
      [system_id],
      (err, results, fields) => {
        if (err) {
          console.log(err);
          return res.status(400).send();
        }
        res.status(200).json(results);
      }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

router.get("/getIssueSum/:system_id", async (req, res) => {
  const system_id = req.params.system_id;
  try {
    connection.query(
      `SELECT issue_type,issue_status, COUNT(*) AS issue_count
      FROM issues
      WHERE system_id = ? AND (issue_type = 'PNI' OR issue_type = 'PNC') AND (issue_status = 'รอแก้ไข' OR issue_status = 'กำลังแก้ไข' OR issue_status = 'แก้ไขเรียบร้อย' OR issue_status = 'ตรวจสอบผ่าน' OR issue_status = 'ตรวจสอบไม่ผ่าน')
      GROUP BY system_id, issue_type, issue_status;`,
      [system_id],
      (err, results, fields) => {
        if (err) {
          console.log(err);
          return res.status(400).send();
        }
        res.status(200).json(results);
      }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

module.exports = router;
