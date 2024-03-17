const express = require("express");
const router = express.Router();
const connection = require("../db");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

function generateId() {
  const maxId = 999999999;
  const minId = 100000000;
  const id = Math.floor(Math.random() * (maxId - minId + 1)) + minId;
  return id;
}

// router.get("/", async (req, res) => {
//   try {
//       return res.send("Hello");
//   } catch (err) {
//       console.log(err);
//       return res.status(500).send();
//   }
// });


//history_issues
router.get("/getAll", async (req, res) => {
  try {
    const issuesFilter = req.query.issues_id;
    let query = "SELECT * FROM history_issues";
    const queryParams = [];
    if (issuesFilter) {
      query += " WHERE issues_id = ?";
      queryParams.push(issuesFilter);
    }
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

router.get("/getOne/:id", async (req, res) => {
  const id = req.params.id;
  try {
    connection.query(
      "SELECT * FROM history_issues WHERE id = ?",
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

router.post("/createIssueHistory", async (req, res) => {
  const {
    screen_id,
    system_id,
    project_id,
    issues_id,
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
    user_updated,
    user_position_updated,
    user_id_updated,
  } = req.body;

  try {
    connection.query(
      "INSERT INTO history_issues (screen_id, system_id, project_id, issues_id, user_assign_id, user_qc_id, issue_name, issue_id, issue_type, issue_informer, issue_priority, issue_end, issue_assign, issue_qc, issue_des, issue_des_sa, issue_type_sa, issue_doc_id, issue_customer, issue_filename, issue_des_dev, issue_des_implementer, issue_start, issue_expected, issue_status, issue_accepting, issue_manday, issue_complete ,issue_status_developer,issue_status_implement,issue_round,user_updated,user_position_updated,user_id_updated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        screen_id,
        system_id,
        project_id,
        issues_id,
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
        user_updated,
        user_position_updated,
        user_id_updated,
      ],
      (err, results, fields) => {
        if (err) {
          console.log(
            "Error while inserting an history issue into the database",
            err
          );
          return res.status(400).send();
        }
        return res
          .status(201)
          .json({ message: "New history issue successfully created!" });
      }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

//* DELETE default_settings by ID
router.delete("/delete/:id", async (req, res) => {
  const id = req.params.id;

  try {
    connection.query(
      "DELETE FROM history_issues WHERE id = ?",
      [id],
      (err, results, fields) => {
        if (err) {
          console.log(err);
          return res.status(400).send();
        }
        if (results.affectedRows === 0) {
          return res
            .status(404)
            .json({ message: "No history_issuess with that id!" });
        }
        return res
          .status(200)
          .json({ message: "delete history_issues successfully!" });
      }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

module.exports = router;
