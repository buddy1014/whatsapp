const createError = require("http-errors");
const fs = require("fs");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");

const indexRouter = require("./routes/index");

const { whatsApp } = require("./utils/whatsapp");
const { slack } = require("./utils/slack");
const { csv } = require("./utils/csv");

while (!fs.existsSync("auth_info.json")) {
  console.log("No auth_info.json, retry in 10 seconds");
  const waitTill = new Date(new Date().getTime() + 10 * 1000);
  while (waitTill > new Date()) {}
}

// get initial data
csv.getBotData();
slack.getChannel();

// init whatsapp host
whatsApp.connect();

const app = express();

// allow all cors
app.use(cors());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
