// module.exports = connection;
var cors = require("cors");
const bodyParser = require("body-parser");
const express = require("express");
const session = require("express-session");
const app = express();
const usersRouter = require("./router/users");
const projectsRouter = require("./router/projects");
const systemsRouter = require("./router/systems");
const screensRouter = require("./router/screens");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: true }));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Note: set this to 'true' if using HTTPS
  })
);

app.use("/users", usersRouter);
app.use("/projects", projectsRouter);
app.use("/systems", systemsRouter);
app.use("/screens", screensRouter);

app.get("/getAll", async (req, res) => {
  try {
    console.log("Hello");
  } catch (err) {
    console.log(err);
  }
});

// app.listen(8300, () => {
//   console.log("Server listening on port 8300");
// });

app.listen(7777, () => {
  console.log("Server listening on port 7777");
});
