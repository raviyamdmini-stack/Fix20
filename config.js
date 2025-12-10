const fs = require('fs');

// Load environment variables from config.env if it exists
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

// Convert string to boolean
function convertToBool(text, fault = 'true') {
    return text === fault;
}

module.exports = {
    SESSION_ID: process.env.SESSION_ID || "session id",
    ALIVE_IMG: process.env.ALIVE_IMG || "https://i.ibb.co/spvMX3vb/Supunmd.jpg",
    ALIVE_MSG: process.env.ALIVE_MSG || "*🤖𝐇𝐞𝐲 𝐈'𝐦 💃ʀᴀᴠɪʏᴀ ᴍᴅ 🤍 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩 𝐁𝐨𝐭⚡*\n\n*🔔𝐈'𝐦 𝐀𝐥𝐢𝐯𝐞 𝐍𝐨𝐰🎠*\n\n*⚖️𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 - : ᴘᴀᴍᴜᴅɪɴᴀ ʀᴀᴠɪʜᴀ",
    AUTO_READ_STATUS: convertToBool(process.env.AUTO_READ_STATUS || "true")
};
