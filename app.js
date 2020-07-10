var createError = require("http-errors");
const fs = require("fs");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
//var reload = require("reload");

var indexRouter = require("./routes/index");
var authInfo = null;

const whatsApp = require("./utils/whatsapp");

while (!fs.existsSync("auth_info.json")) {
  console.log("No auth_info.json, retry in 10 seconds");
  var waitTill = new Date(new Date().getTime() + 10 * 1000);
  while (waitTill > new Date()) {}
}

whatsApp
  .connectWhatsAppClient()
  .then(() => {})
  .catch((err) => {
    console.error("ERROR connecting: ", JSON.stringify(err, null, 2));
    if (err[0] == 401) fs.unlinkSync("auth_info.json");
    //    reload(app)
  });

var app = express();

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
