const fs = require("fs");
const axios = require("axios").default;
const { WAClient, MessageType, getNotificationType, Mimetype } = require("@adiwajshing/baileys");

const { slack } = require("./slack");
const { csv } = require("./csv");

const WASingleton = (function () {
  function WAInstance() {
    this._client = {};
    this._authInfo = {};
    this._hostUser = {};
    this._clientUser = {};
  }

  WAInstance.prototype = {
    _init: function () {
      this._authInfo = JSON.parse(fs.readFileSync("auth_info.json"));
      this._client = new WAClient();
      this._client.autoReconnect = true;
    },
    _addWAEventListener: function () {
      this._client.setOnUnreadMessage(true, async (msg) => {
        const { remoteJid, id } = msg.key;
        this._clientUser = remoteJid;

        // make message as read status
        await this._client.sendReadReceipt(this._clientUser, id);

        const [_ignore, messageType] = getNotificationType(msg);

        if (messageType === MessageType.text) {
          const conversation = msg.message.conversation;
          const botMsg = csv.getBotDataByInput(conversation);

          if (!botMsg) return;

          const out = botMsg[1].replace(/\"/g, "");
          const img = botMsg[2];

          if (img) {
            this._sendMediaMsg(this._clientUser, img, out);
          } else {
            this._sendTxtMsg(this._clientUser, out);
          }
        }
      });

      this._client.setOnUnexpectedDisconnect((err) => {
        console.error("whatsapp disconnected: ", JSON.stringify(err, null, 2));
      });
    },
    _sendTxtMsg: function (to, msg) {
      this._client.sendMessage(to, msg, MessageType.text);
    },
    _sendMediaMsg: async function (to, media, msg) {
      const imgBuff = await axios.get(media, {
        responseType: "arraybuffer",
      });
      const opt = { mimetype: Mimetype.jpeg, caption: msg };

      this._client.sendMessage(to, imgBuff.data, MessageType.image, opt);
    },
    connect: async function () {
      try {
        this._init();
        const hostUser = await this._client.connectSlim(this._authInfo, 20 * 1000);
        this._hostUser = hostUser;

        this._sendTxtMsg(this._hostUser.id, "Welcome");

        this._addWAEventListener();
      } catch (err) {
        if (err && err[0] === 401) fs.unlinkSync("../auth_info.json");
        console.error("ERROR connecting: ", JSON.stringify(err, null, 2));
      }
    },
  };

  let instance;

  function createWAInstance() {
    instance = new WAInstance();
    return instance;
  }

  return {
    getWAInstance: () => {
      if (!instance) instance = createWAInstance();
      return instance;
    },
  };
})();

const whatsApp = WASingleton.getWAInstance();

module.exports = { whatsApp };
