const { fetchJson } = require('../lib/functions')
const config = require('../config')
const { cmd } = require('../command')

// LOAD API BASE URL
let baseUrl = null;
(async () => {
    try {
        let baseUrlGet = await fetchJson(`https://raw.githubusercontent.com/prabathLK/PUBLIC-URL-HOST-DB/main/public/url.json`);
        baseUrl = baseUrlGet?.api || null;
        console.log("API Base Loaded:", baseUrl);
    } catch (e) {
        console.log("API URL Load Failed:", e);
        baseUrl = null;
    }
})();

const yourName = "> ᴘᴀᴡᴇʀᴇᴅ ʙʏ ʀᴀᴠɪʏᴀ ᴍᴅ";


// ========================= TWITTER (X) DOWNLOADER =========================

cmd({
    pattern: "twitter",
    alias: ["twdl"],
    desc: "Download Twitter (X) videos",
    category: "download",
    react: "🔎",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {

try {
    if (!baseUrl) return reply("⚠️ API not loaded, try again in a moment.");
    if (!q || !q.startsWith("https://")) return reply("⚠️ Send a valid Twitter URL.");

    reply("*Downloading...*");

    const data = await fetchJson(`${baseUrl}/api/twitterdl?url=${q}`);

    if (!data?.data?.data) return reply("❌ Failed to fetch Twitter data.");

    let vid = data.data.data;

    // HD Video
    if (vid.HD) {
        await conn.sendMessage(from, {
            video: { url: vid.HD },
            mimetype: "video/mp4",
            caption: `- HD QUALITY\n\n${yourName}`
        }, { quoted: mek });
    }

    // SD Video
    if (vid.SD) {
        await conn.sendMessage(from, {
            video: { url: vid.SD },
            mimetype: "video/mp4",
            caption: `- SD QUALITY\n\n${yourName}`
        }, { quoted: mek });
    }

    // Audio
    if (vid.audio) {
        await conn.sendMessage(from, {
            audio: { url: vid.audio },
            mimetype: "audio/mpeg"
        }, { quoted: mek });
    }

} catch (e) {
    console.log(e);
    reply("❌ Error: " + e);
}
});


// ========================= GOOGLE DRIVE DOWNLOADER =========================

cmd({
    pattern: "gdrive",
    alias: ["googledrive"],
    desc: "Download Google Drive files",
    category: "download",
    react: "🔎",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {

try {
    if (!baseUrl) return reply("⚠️ API not loaded, try again.");
    if (!q || !q.startsWith("https://")) return reply("⚠️ Send a valid Google Drive URL.");

    reply("*Downloading...*");

    let data = await fetchJson(`${baseUrl}/api/gdrivedl?url=${q}`);

    if (!data?.data?.download) return reply("❌ Failed to fetch GDrive data.");

    await conn.sendMessage(from, {
        document: { url: data.data.download },
        fileName: data.data.fileName || "gdrive-file",
        mimetype: data.data.mimeType || "application/octet-stream",
        caption: `${data.data.fileName}\n\n${yourName}`
    }, { quoted: mek });

} catch (e) {
    console.log(e);
    reply("❌ Error: " + e);
}
});


// ========================= MEDIAFIRE DOWNLOADER =========================

cmd({
    pattern: "mediafire",
    alias: ["mfire"],
    desc: "Download MediaFire files",
    category: "download",
    react: "🔎",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {

try {
    if (!baseUrl) return reply("⚠️ API not loaded, try later.");
    if (!q || !q.startsWith("https://")) return reply("⚠️ Send a valid MediaFire URL.");

    reply("*Downloading...*");

    let data = await fetchJson(`${baseUrl}/api/mediafiredl?url=${q}`);

    if (!data?.data?.link_1) return reply("❌ Failed to fetch MediaFire data.");

    await conn.sendMessage(from, {
        document: { url: data.data.link_1 },
        fileName: data.data.name || "mediafire-file",
        mimetype: data.data.file_type || "application/octet-stream",
        caption: `${data.data.name}\n\n${yourName}`
    }, { quoted: mek });

} catch (e) {
    console.log(e);
    reply("❌ Error: " + e);
}
});
