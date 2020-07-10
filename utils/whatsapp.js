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

          // client.setOnUnreadMessage((m) => {
          //   const [notificationType, messageType] = client.getNotificationType(
          //     m
          //   ); // get what type of notification it is -- message, group add notification etc.
          //   if (notificationType !== "message") {
          //     return;
          //   }
          //   if (m.key.fromMe) {
          //     return;
          //   }

          //   let sender = m.key.remoteJid;
          //   if (m.key.participant) {
          //     // participant exists if the message is in a group
          //     sender += " (" + m.key.participant + ")";
          //   }
          //   var text = "";
          //   if (messageType === WhatsAppWeb.MessageType.text) {
          //     text = m.message.conversation;
          //   } else if (messageType === WhatsAppWeb.MessageType.extendedText) {
          //     text = m.message.extendedTextMessage.text;
          //   } else if (messageType === WhatsAppWeb.MessageType.contact) {
          //     const contact = m.message.contactMessage;
          //   } else {
          //   }

          //   // send a reply after 3 seconds
          //   if (text == "1222") {
          //     setTimeout(() => {
          //       client
          //         .sendReadReceipt(m.key.remoteJid, m.key.id) // send read receipt
          //         .then(() =>
          //           client.updatePresence(
          //             m.key.remoteJid,
          //             WhatsAppWeb.Presence.available
          //           )
          //         ) // tell them we're available
          //         .then(() =>
          //           client.updatePresence(
          //             m.key.remoteJid,
          //             WhatsAppWeb.Presence.composing
          //           )
          //         ) // tell them we're composing
          //         .then(() => {
          //           // send the message
          //           let options = { quoted: m };

          //           return client.sendTextMessage(
          //             m.key.remoteJid,
          //             "hello there!",
          //             options
          //           ); // send a "hello!" & quote the message recieved
          //           return client.sendLocationMessage(
          //             m.key.remoteJid,
          //             32.123123,
          //             12.12123123
          //           ); // send a random location lol
          //           const buffer = fs.readFileSync("ma_gif.mp4"); // load the gif
          //           options.gif = true; // the video is a gif
          //           options.caption = "hello!"; // the caption
          //           return client.sendMediaMessage(
          //             m.key.remoteJid,
          //             buffer,
          //             WhatsAppWeb.MessageType.video,
          //             options
          //           ); // send this gif!
          //         });
          //     }, 3 * 1000);
          //   }
          // }, true);

          resolve({ user });
        })
        .catch((err) => {
          console.log("Connect error: " + err);
          reject();
          //reload(app)
        });
    } catch (err) {
      console.log("Promise error: " + err);
      reject();
      //reload(app)
    }
  });
};

module.exports = { client, connectWhatsAppClient };
