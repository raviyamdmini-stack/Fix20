const { cmd } = require('../command');
const axios = require('axios');
const { Buffer } = require('buffer');

// Your Google API details
const GOOGLE_API_KEY = 'AIzaSyDebFT-uY_f82_An6bnE9WvVcgVbzwDKgU';
const GOOGLE_CX = '45b94c5cef39940d1';

cmd({
    pattern: "img",
    desc: "Search and send images from Google.",
    react: "🖼️",
    category: "download",
    filename: __filename
},
async (
    conn, mek, m,
    { from, q, reply }
) => {

try {

    if (!GOOGLE_API_KEY || !GOOGLE_CX)
        return reply("❌ Google API or CX is missing!");

    if (!q)
        return reply("⚠️ Please provide a search query.\nExample: *.img cat*");

    reply("🔍 Searching images...");

    // Request from Google Search API
    const googleURL =
        `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(q)}&cx=${GOOGLE_CX}&key=${GOOGLE_API_KEY}&searchType=image&num=10`;

    const response = await axios.get(googleURL);
    const result = response.data;

    if (!result.items || result.items.length === 0)
        return reply("❌ No images found.");

    let count = 0;

    for (const item of result.items) {
        if (!item.link) continue;

        try {
            // download each image safely
            const imgRes = await axios.get(item.link, { responseType: "arraybuffer" });

            const buffer = Buffer.from(imgRes.data);

            await conn.sendMessage(
                from,
                {
                    image: buffer,
                    caption: `🖼️ *Image Result - ${++count}*\n🔎 Query: *${q}*\n\n> ᴘᴀᴡᴇʀᴇᴅ ʙʏ ʀᴀᴠɪʏᴀ ᴍᴅ`
                },
                { quoted: mek }
            );

            // limit to 5 images max
            if (count >= 5) break;

        } catch (err) {
            console.log("Skipped image due to error:", err.message);
            continue; // skip broken URLs
        }
    }

    if (count === 0)
        reply("❌ All images failed to load. Try again.");

} catch (e) {
    console.error(e);
    reply("❌ Error: " + e.message);
}

});
