const { WAClient } = require("@adiwajshing/baileys");
const fs = require("fs");
const { exit } = require("process");
const { exec } = require("child_process");

const client = new WAClient(); // instantiate
var authInfo = null;

client
  .connectSlim(authInfo, 20 * 1000) // connect or timeout in 20 seconds
  .then((user) => {
    console.log("oh hello " + user.name + " (" + user.id + ")");

    const authInfo = client.base64EncodedAuthInfo(); // get all the auth info we need to restore this session
    fs.writeFileSync("auth_info.json", JSON.stringify(authInfo, null, "\t")); // save this info to a file
    /*  Note: one can take this auth_info.json file and login again from any computer without having to scan the QR code, 
            and get full access to one's WhatsApp. Despite the convenience, be careful with this file */

    exec("pm2 reload server.config.js");
    process.exit();
  })
  .catch((err) => {
    console.dir(err);
  });
