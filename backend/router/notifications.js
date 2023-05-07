const express = require("express");
const router = express.Router();
const connection = require("../db");

function generateId() {
  const maxId = 999999999;
  const minId = 100000000;
  const id = Math.floor(Math.random() * (maxId - minId + 1)) + minId;
  return id;
}

// * GET All FROM notifications
router.get("/getAll", async (req, res) => {
  try {
    connection.query("SELECT * FROM notifications", (err, results, fields) => {
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
      "SELECT * FROM notifications WHERE id = ?",
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

// * POST FROM Noti
router.post("/createNoti", async (req, res) => {
    const {
      user_id,
      issue_id,
      notification_message,
      notification_type,
      notification_read,
  } = req.body;
  const id = generateId();
    try {
      connection.query(
        "INSERT INTO notifications (id,user_id, issue_id, notification_message, notification_type, notification_read) VALUES (?,?, ?, ?, ?, ?)",
        [id,user_id, issue_id, notification_message, notification_type, notification_read],
        (err, results, fields) => {
          if (err) {
            console.log("Error while inserting a notification into the database", err);
            return res.status(400).send();
          }
          return res
            .status(201)
            .json({ message: "New notification successfully created!" });
        }
      );
    } catch (err) {
      console.log(err);
      return res.status(500).send();
    }
  });
  

//* DELETE notifications by ID
router.delete("/delete/:id", async (req, res) => {
  const id = req.params.id;

  try {
    connection.query(
      "DELETE FROM notifications WHERE id = ?",
      [id],
      (err, results, fields) => {
        if (err) {
          console.log(err);
          return res.status(400).send();
        }
        if (results.affectedRows === 0) {
          return res.status(404).json({ message: "No notifications with that id!" });
        }
        return res
          .status(200)
          .json({ message: "System notifications successfully!" });
      }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});


module.exports = router;
