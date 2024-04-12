const express = require("express");
const router = express.Router();
const connection = require("../db");

function generateId() {
    const maxId = 999999999;
    const minId = 100000000;
    const id = Math.floor(Math.random() * (maxId - minId + 1)) + minId;
    return id;
}

router.get("/getAll", async (req, res) => {
    try {
        connection.query("SELECT * FROM user_systems", (err, results, fields) => {
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

//* GET one by user_id
router.get("/getOneUserID/:user_id", async (req, res) => {
    const user_id = req.params.user_id;
    try {
        connection.query(
            "SELECT * FROM user_systems WHERE user_id = ?",
            [user_id],
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

//* GET one by system_id
router.get("/getOneScreenID/:system_id", async (req, res) => {
    const system_id = req.params.system_id;
    try {
        connection.query(
            "SELECT users.id, users.user_firstname, users.user_lastname, users.user_position FROM user_systems INNER JOIN users ON user_systems.user_id = users.id INNER JOIN systems ON user_systems.system_id = systems.id WHERE user_systems.system_id = ?",
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

// * POST FROM user_systems
router.post("/createUser_system", async (req, res) => {
    const { user_id, system_id, project_id } = req.body;

    try {
        for (let i = 0; i < user_id.length; i++) {
            const id = generateId();
            // screen_id exists in the screens table, insert new record into user_screens table
            connection.query(
                "INSERT INTO user_systems(id, user_id, system_id,project_id) VALUES(?, ?, ?, ?)",
                [id, user_id[i], system_id, project_id],
                (err, results, fields) => {
                    if (err) {
                        console.log("Error while inserting a screen into the database", err);
                        return;
                    }
                }
            );
        }
        return res
            .status(201)
            .json({ message: "New user_systems successfully created!" });
    } catch (err) {
        console.log("Error while inserting user_systems(s) into the database", err);
        return res.status(400).send();
    }
});

// * Put FROM user_system by user_id
router.put("/updateUserID/:user_id", async (req, res) => {
    const user_id = req.params.user_id;
    const {
        screen_id,
    } = req.body;
    try {
        connection.query(
            "UPDATE user_systems SET system_id = ? WHERE user_id = ?",
            [
                system_id,
                user_id,
            ],
            (err, results, fields) => {
                if (err) {
                    console.log("Error update user_screen into the database", err);
                    return res.status(400).send();
                }
                return res
                    .status(201)
                    .json({ message: "Update user_screen successfully" });
            }
        );
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
});


//* DELETE user by user_id
router.delete("/deleteUserID/:user_id", async (req, res) => {
    const user_id = req.params.user_id;

    try {
        connection.query(
            "DELETE FROM user_systems WHERE user_id = ?",
            [user_id],
            (err, results, fields) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send();
                }
                if (results.affectedRows === 0) {
                    return res.status(404).json({ message: "No user_id with that" });
                }
                return res
                    .status(200)
                    .json({ message: "user_id deleted successfully!" });
            }
        );
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
});

//* DELETE user by system_id
router.delete("/deleteScreenID/:system_id", async (req, res) => {
    const system_id = req.params.system_id;

    try {
        connection.query(
            "DELETE FROM user_systems WHERE system_id = ?",
            [system_id],
            (err, results, fields) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send();
                }
                if (results.affectedRows === 0) {
                    return res.status(404).json({ message: "No system_id with that" });
                }
                return res
                    .status(200)
                    .json({ message: "system_id deleted successfully!" });
            }
        );
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
});

//* DELETE user by project_id
router.delete("/deleteProjectID/:project_id", async (req, res) => {
    const project_id = req.params.project_id;

    try {
        connection.query(
            "DELETE FROM user_systems WHERE project_id = ?",
            [project_id],
            (err, results, fields) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send();
                }
                if (results.affectedRows === 0) {
                    return res.status(404).json({ message: "No system_id with that" });
                }
                return res
                    .status(200)
                    .json({ message: "project_id deleted successfully!" });
            }
        );
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
});


//* GET user by system_id and project_id
router.get("/getUserBySystemAndProject/:system_id/:project_id", async (req, res) => {
    const { system_id, project_id } = req.params;
    try {
        connection.query(
            "SELECT users.id, users.user_firstname, users.user_lastname, users.user_position, users.user_department, users.user_pic FROM user_systems INNER JOIN users ON user_systems.user_id = users.id WHERE user_systems.system_id = ? AND user_systems.project_id = ?",
            [system_id, project_id],
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


// Get users not in system by system_id
router.get("/checkUsersNotInSystem/:project_id/:system_id", async (req, res) => {
    const { project_id, system_id } = req.params;

    try {
        // Query to find users who are not in the specified project and system
        const query = `
            SELECT u.id, u.user_firstname, u.user_lastname, u.user_position
            FROM users u
            WHERE u.id IN (
                SELECT up.user_id
                FROM user_projects up
                WHERE up.project_id = ?
            )
            AND u.id NOT IN (
                SELECT us.user_id
                FROM user_systems us
                WHERE us.project_id = ? AND us.system_id = ?
            )
        `;

        connection.query(query, [project_id, project_id, system_id], (err, results, fields) => {
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


//* DELETE user_system by system_id, project_id, and user_id
router.delete("/deleteUserSystem/:system_id/:project_id/:user_id", async (req, res) => {
    const { system_id, project_id, user_id } = req.params;

    try {
        connection.query(
            "DELETE FROM user_systems WHERE system_id = ? AND project_id = ? AND user_id = ?",
            [system_id, project_id, user_id],
            (err, results, fields) => {
                if (err) {
                    console.log(err);
                    return res.status(400).send();
                }
                if (results.affectedRows === 0) {
                    return res.status(404).json({ message: "No matching user_system found" });
                }
                return res.status(200).json({ message: "User system deleted successfully" });
            }
        );
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
});

// GET systems by user_id and project_id
router.get("/getSystemsByUser_id/:project_id/:user_id", async (req, res) => {
    const { project_id, user_id } = req.params;

    try {
        connection.query(
            "SELECT systems.* FROM user_systems INNER JOIN systems ON user_systems.system_id = systems.id WHERE user_systems.project_id = ? AND user_systems.user_id = ?",
            [project_id, user_id],
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