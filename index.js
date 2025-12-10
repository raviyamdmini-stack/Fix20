const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  jidNormalizedUser,
  getContentType,
  fetchLatestBaileysVersion,
  Browsers
} = require('@whiskeysockets/baileys');

const { getBuffer, getGroupAdmins } = require('./lib/functions');
const fs = require('fs');
const P = require('pino');
const config = require('./config');
const { sms } = require('./lib/msg');
const { File } = require('megajs');
const express = require("express");
const prefix = '.';

const ownerNumber = ['94718461889'];

// =================== SESSION AUTH =========================
if (!fs.existsSync(__dirname + '/auth_info_baileys/creds.json')) {
  if (!config.SESSION_ID) {
    console.log('Please add your session to SESSION_ID env !!');
    process.exit(1);
  }
  const sessdata = config.SESSION_ID;
  const filer = File.fromURL(`https://mega.nz/file/${sessdata}`);
  filer.download((err, data) => {
    if (err) throw err;
    fs.writeFileSync(__dirname + '/auth_info_baileys/creds.json', data);
    console.log("Session downloaded ✅");
  });
}

// ================= EXPRESS SERVER ========================
const app = express();
const port = process.env.PORT || 8000;

app.get("/", (req, res) => res.send("Hey, bot started ✅"));

app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));

// ================= CONNECT TO WA ========================
async function connectToWA() {
  try {
    console.log("Connecting WhatsApp bot 🧬...");
    const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/auth_info_baileys/');
    const { version } = await fetchLatestBaileysVersion();

    const conn = makeWASocket({
      logger: P({ level: 'silent' }),
      printQRInTerminal: true, // enable to scan QR if no session
      browser: Browsers.macOS("Firefox"),
      syncFullHistory: true,
      auth: state,
      version
    });

    // =============== CONNECTION UPDATE =================
    conn.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect } = update;
      if (connection === 'close') {
        if (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut) {
          console.log("Reconnecting...");
          connectToWA();
        } else {
          console.log("Logged out, delete auth_info_baileys and restart bot.");
        }
      } else if (connection === 'open') {
        console.log('😼 Installing plugins...');
        const path = require('path');
        try {
          if (fs.existsSync("./plugins/")) {
            fs.readdirSync("./plugins/").forEach((plugin) => {
              if (path.extname(plugin).toLowerCase() === ".js") {
                require("./plugins/" + plugin);
              }
            });
            console.log('Plugins installed ✅');
          } else {
            console.log("Plugins folder missing");
          }
        } catch (err) {
          console.error("Plugin loading error:", err);
        }

        console.log('Bot connected to WhatsApp ✅');

        const up = `Bot Name connected successfully ✅\n\nPREFIX: ${prefix}`;
        for (const number of ownerNumber) {
          await conn.sendMessage(number + "@s.whatsapp.net", {
            image: { url: 'https://i.ibb.co/bHXBV08/9242c844b83f7bf9.jpg' },
            caption: up
          });
        }
      }
    });

    conn.ev.on('creds.update', saveCreds);

    // =============== MESSAGE UPDATES ===================
    conn.ev.on('messages.upsert', async (mek) => {
      try {
        mek = mek.messages[0];
        if (!mek.message) return;

        mek.message = (getContentType(mek.message) === 'ephemeralMessage')
          ? mek.message.ephemeralMessage.message
          : mek.message;

        if (mek.key?.remoteJid === 'status@broadcast' && config.AUTO_READ_STATUS === "true") {
          await conn.readMessages([mek.key]);
        }

        const m = sms(conn, mek);
        const type = getContentType(mek.message);
        const from = mek.key.remoteJid;
        const quoted = type === 'extendedTextMessage' && mek.message.extendedTextMessage?.contextInfo
          ? mek.message.extendedTextMessage.contextInfo.quotedMessage || []
          : [];
        const body = (type === 'conversation') ? mek.message.conversation
          : (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text
          : (type === 'imageMessage' && mek.message.imageMessage?.caption) ? mek.message.imageMessage.caption
          : (type === 'videoMessage' && mek.message.videoMessage?.caption) ? mek.message.videoMessage.caption
          : '';

        const isCmd = body.startsWith(prefix);
        const command = isCmd ? body.slice(prefix.length).trim().split(' ')[0].toLowerCase() : '';
        const args = body.trim().split(/ +/).slice(1);
        const q = args.join(' ');
        const isGroup = from.endsWith('@g.us');
        const sender = mek.key.fromMe ? conn.user.id.split(':')[0] + '@s.whatsapp.net' : (mek.key.participant || mek.key.remoteJid);
        const senderNumber = sender.split('@')[0];
        const botNumber2 = await jidNormalizedUser(conn.user.id);
        const pushname = mek.pushName || 'Sin Nombre';
        const isMe = conn.user.id.includes(senderNumber);
        const isOwner = ownerNumber.includes(senderNumber) || isMe;

        const groupMetadata = isGroup ? await conn.groupMetadata(from).catch(() => ({})) : {};
        const groupAdmins = isGroup ? await getGroupAdmins(groupMetadata.participants || []) : [];
        const isBotAdmins = isGroup ? groupAdmins.includes(botNumber2) : false;
        const isAdmins = isGroup ? groupAdmins.includes(sender) : false;
        const isReact =
