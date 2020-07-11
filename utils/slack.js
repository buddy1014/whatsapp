const axios = require("axios").default;

const { slack: slackConfig } = require("../config/config.json");

const SlackSingleton = (function () {
  function SlackInstance() {
    this._channel = {};
    this._thread = "";
  }

  SlackInstance.prototype = {
    getChannel: async function () {
      try {
        const { data } = await axios.get(`${slackConfig.base}/conversations.list`, {
          headers: { Authorization: `Bearer ${slackConfig["oAuth-token"]}` },
        });

        if (!data.channels) return;

        this._channel = data.channels.find((channel) => channel.name === slackConfig.chanel);
      } catch (err) {
        console.error("get slack channel error: ", JSON.stringify(err, null, 2));
      }
    },
    onReceiveMsg: function () {},
    onSendMsg: function (msg) {
      if (!this._channel.id) {
        console.error("no channel exist");
        return;
      }

      this.sendMsgToSlack(this._channel.id, msg.message.conversation);
    },
    sendMsgToSlack: async function (channel, text) {
      const msgData = { channel, text };
      try {
        const sendMsgRes = await axios.post(`${slackConfig.base}/chat.postMessage`, msgData, {
          headers: {
            "Content-type": "application/json;charset=UTF-8",
            Authorization: `Bearer ${slackConfig["oAuth-token"]}`,
          },
        });

        this._thread = sendMsgRes.data.ts;
      } catch (err) {
        console.error("send message to slack error: ", JSON.stringify(err, null, 2));
      }
    },
    sendMsgToThread: async function (channel, text) {
      try {
        const msgData = {
          channel,
          text: "Let's continue conversation in thread",
          thread_ts: this._thread,
        };
        const sendMsgRes = await axios.post(`${slackConfig.base}/chat.postMessage`, msgData, {
          headers: {
            "Content-type": "application/json;charset=UTF-8",
            Authorization: `Bearer ${slackConfig["oAuth-token"]}`,
          },
        });
      } catch (err) {
        console.error("send msg to slack thread: ", JSON.stringify(err, null, 2));
      }
    },
    forwardMsgToWhatsApp: function () {},
  };

  let instance;

  function createInstance() {
    instance = new SlackInstance();
    return instance;
  }

  return {
    getSlackInstance: () => {
      if (!instance) instance = createInstance();
      return instance;
    },
  };
})();

const slack = SlackSingleton.getSlackInstance();

module.exports = { slack };
