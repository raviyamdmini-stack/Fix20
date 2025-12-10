const { fetchJson } = require('../lib/functions')
const config = require('../config')
const { cmd } = require('../command')

// LOAD API URL
let baseUrl = null;
(async () => {
    try {
        const baseUrlGet = await fetchJson(`https://raw.githubusercontent.com/prabathLK/PUBLIC-URL-HOST-DB/main/public/url.json`);
        baseUrl = baseUrlGet.api;
    } catch (e) {
        console.log("API URL LOAD ERROR:", e);
    }
})();


// ============================ FB DOWNLOADER ===============================

cmd({
    pattern: "fb",
    desc: "Download Facebook videos",
    category: "download",
    react: "🔎",
    filename: __filename
},
async (conn, mek, m, { from, q, sender, reply }) => {

try {
    if (!baseUrl) return reply("⚠️ API is loading... try again in a few seconds.");
    if (!q || !q.startsWith("https://")) return reply("⚠️ Send a valid Facebook video URL!");

    // Fetch API data
    const data = await fetchJson(`${baseUrl}/api/fdown?url=${q}`);

    if (!data?.data?.hd && !data?.data?.sd)
        return reply("❌ Unable to extract FB video! Try another link.");

    const menuMsg = `
*RAVIYA MD FB DOWNLOADER ⚙️*

*Reply with an option:*

1️⃣ Download FB Video in *HD*  
2️⃣ Download FB Video in *SD*

> ᴘᴀᴡᴇʀᴇᴅ ʙʏ ʀᴀᴠɪʏᴀ ᴍᴅ
`;

    // Send menu
    const askMsg = await conn.sendMessage(from, {
        image: { url: "https://i.ibb.co/mmnhv8B/Supunmd.jpg" },
        caption: menuMsg
    }, { quoted: mek });

    // Wait for reply
    const response = await conn.awaitForMessage({
        sender: sender,
        chatJid: from,
        timeout: 30000 // 30 seconds
    });

    if (!response) return reply("⏳ Timeout! No response received.");

    const selected = response.message?.conversation?.trim();

    switch (selected) {
        case "1":
            if (!data.data.hd) return reply("❌ HD video not available.");
            await conn.sendMessage(from, {
                video: { url: data.data.hd },
                mimetype: "video/mp4",
                caption: "> ᴘᴀᴡᴇʀᴇᴅ ʙʏ ʀᴀᴠɪʏᴀ ᴍᴅ"
            }, { quoted: askMsg });
            break;

        case "2":
            if (!data.data.sd) return reply("❌ SD video not available.");
            await conn.sendMessage(from, {
                video: { url: data.data.sd },
                mimetype: "video/mp4",
                caption: "> ᴘᴀᴡᴇʀᴇᴅ ʙʏ ʀᴀᴠɪʏᴀ ᴍᴅ"
            }, { quoted: askMsg });
            break;

        default:
            reply("❌ Invalid option. Please reply 1 or 2.");
    }

} catch (e) {
    console.log(e);
    await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
    reply("❌ An unexpected error occurred!");
}

});
