const {
  WAClient,
  MessageType,
  getNotificationType,
  Mimetype,
} = require("@adiwajshing/baileys");
const fs = require("fs");
const path = require("path");
const csvtojsonV2 = require("csvtojson/v2");
const axios = require("axios").default;

const { slack } = require("./slack");

const readCsv = () => {
  return new Promise((resolve, _ignore1) => {
    csvtojsonV2()
      .fromFile(path.join(__dirname, "../bot.csv"))
      .then((objArr) => {
        const result = objArr.map((obj) => {
          const [item] = Object.entries(obj).map(([_ignore2, value]) => {
            return value.split(";");
          });
          return item;
        });
        resolve(result);
      });
  });
};

const getBotMsg = (msgs, input) => {
  const result = msgs.find((msg) => msg[0] === input);
  return result;
};

const client = new WAClient();
client.autoReconnect = true;

const connectWhatsAppClient = async () => {
  const botMsgs = await readCsv();

  return new Promise((resolve, reject) => {
    try {
      // load a closed session back if it exists
      const file = fs.readFileSync("auth_info.json");
      authInfo = JSON.parse(file);

      client
        .connectSlim(authInfo, 20 * 1000) // connect or timeout in 20 seconds
        .then(async (user) => {
          client.sendMessage(user.id, "Welcome", MessageType.text);

          client.setOnUnreadMessage(true, async (msg) => {
            const [_ignore, messageType] = getNotificationType(msg);

            if (messageType === MessageType.text) {
              slack.onSendMsg(msg);

              const conversation = msg.message.conversation;
              const botMsg = getBotMsg(botMsgs, conversation);

              if (!botMsg) return;

              out = botMsg[1].replace(/\"/g, "");
              img = botMsg[2];

              if (img) {
                const imgBuff = await axios.get(img, {
                  responseType: "arraybuffer",
                });
                const opt = { mimetype: Mimetype.jpeg, caption: out };

                client.sendMessage(
                  msg.key.remoteJid,
                  imgBuff.data,
                  MessageType.image,
                  opt
                );
              } else {
                client.sendMessage(msg.key.remoteJid, out, MessageType.text);
              }
            }
          });

          client.setOnUnexpectedDisconnect((err) => {
            console.error(
              "disconnected unexpectedly: ",
              JSON.stringify(err, null, 2)
            );
          });
          resolve({ user });
        })
        .catch((err) => {
          console.log("Connect error: " + err);
          reject();
        });
    } catch (err) {
      console.log("Promise error: " + err);
      reject();
    }
  });
};

module.exports = { client, connectWhatsAppClient };
