var express = require("express");
var router = express.Router();
const fs = require("fs");

const { client } = require("../utils/whatsapp");
const { MessageType } = require("@adiwajshing/baileys");

router.get("/", function (req, res, next) {
  res.status(200).json({ status: "success" }).end();
});

router.get("/sendMessage/:token/:to/:message", async function (req, res, next) {
  try {
    const { token, to, message } = req.params;
    const keys = fs.readFileSync("keys.txt").toString().split("\n");

    if (
      token === keys[0] ||
      (token === "123" && keys.find((el) => el === to))
    ) {
      const isAlive = await client.isOnWhatsApp(
        to.replace(/\D/g, "") + "@c.us"
      );

      if (!isAlive) {
        res
          .status(404)
          .json({
            status: "failure",
            error: `${to || ""}` + " Not found",
            message: message.replace(/\+/g, " "),
          })
          .end();
        return;
      }

      client.sendMessage(
        to.replace(/\D/g, "") + "@s.whatsapp.net",
        message.replace(/\+/g, " "),
        MessageType.text
      );

      res.status(200).json({ status: "success" }).end();
    } else {
      res.status(203).json({ status: "unauthorized" }).end();
    }
  } catch (err) {
    res
      .status(500)
      .json({
        status: "failure",
        message: `${err || ""}, Please retry`,
        errorCode: "send-message-fail",
      })
      .end();
  }
});

router.post("/slack-message", async function (req, res, next) {
  console.log("on send message from slack: ", req.body);
});

module.exports = router;
