const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const financeRouter = require("./routes/financeRouter");

const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

process.on("uncaughtException", function (err) {
  console.log(err.name + "- " + err.message);

  console.log("Uncaught Exception occured!! Shutting Down...");
});

// Middleware for handling or mounting routes
app.use("/api", financeRouter);

const port = process.env.PORT || 3000;
const server = app.listen(port, function () {
  console.log("PORT:", port);
  console.log("Server has started");
});

/**Below error handler's are backup for the unknown event */
process.on("unhandledRejection", function (err) {
  console.log(err);
  console.log(err.name + "- " + err.message);

  console.log("Unhandled Rejection occured!! Shutting Down...");
});

module.exports = { app };
