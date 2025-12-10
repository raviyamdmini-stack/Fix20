const { cmd, commands } = require('../command');
const yts = require('yt-search');
const fg = require('api-dylux');

// ======================= SONG DOWNLOADER ========================= //

cmd({
    pattern: 'song',
    desc: 'download songs',
    react: "🎶",
    category: 'download',
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply('*Please enter a query or URL!*');

        const search = await yts(q);
        if (!search.videos || search.videos.length === 0) return reply('*No results found!*');

        const data = search.videos[0];
        const url = data.url;

        let caption = `*🎼 RAVIYA MD SONG DOWNLOADER ⚙️*

🎼⚙️ TITLE - ${data.title}
🎼⚙️ VIEWS - ${data.views}
🎼⚙️ DESCRIPTION - ${data.description}
🎼⚙️ TIME - ${data.timestamp}
🎼⚙️ AGO - ${data.ago}

*Reply This Message With Option*

*1 → Audio Normal*
*2 → Audio Document*

> ᴘᴀᴡᴇʀᴇᴅ ʙʏ ꜱᴜᴘᴜɴ ᴍᴅ`;

        const sent = await conn.sendMessage(
            from,
            { image: { url: data.thumbnail }, caption },
            { quoted: mek }
        );

        // LISTENER FOR REPLY
        const listener = async (msg) => {
            try {
                const ms = msg.messages[0];
                if (!ms.message?.extendedTextMessage) return;

                const ctx = ms.message.extendedTextMessage.contextInfo;
                const selected = ms.message.extendedTextMessage.text.trim();

                if (!ctx || ctx.stanzaId !== sent.key.id) return;

                switch (selected) {
                    case '1': {
                        let down = await fg.yta(url);
                        await conn.sendMessage(
                            from,
                            {
                                audio: { url: down.dl_url },
                                mimetype: 'audio/mpeg',
                                caption: '> ᴘᴀᴡᴇʀᴇᴅ ʙʏ ʀᴀᴠɪʏᴀ ᴍᴅ'
                            },
                            { quoted: sent }
                        );
                        break;
                    }
                    case '2': {
                        let down = await fg.yta(url);
                        await conn.sendMessage(
                            from,
                            {
                                document: { url: down.dl_url },
                                fileName: `${data.title}.mp3`,
                                mimetype: 'audio/mpeg',
                                caption: '> ᴘᴀᴡᴇʀᴇᴅ ʙʏ ʀᴀᴠɪʏᴀ ᴍᴅ'
                            },
                            { quoted: sent }
                        );
                        break;
                    }
                    default:
                        reply("Invalid option. Please select 1 or 2 🔴");
                }

                conn.ev.off('messages.upsert', listener);
            } catch (e) { console.error(e); }
        };

        conn.ev.on('messages.upsert', listener);

    } catch (e) {
        console.error(e);
        reply('❌ Error while processing your request.');
    }
});



// ======================= VIDEO DOWNLOADER ========================= //

cmd({
    pattern: 'video',
    desc: 'download videos',
    react: "📽️",
    category: 'download',
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply('*Please enter a query or URL!*');

        const search = await yts(q);
        if (!search.videos || search.videos.length === 0) return reply('*No results found!*');

        const data = search.videos[0];
        const url = data.url;

        let caption = `*📽️ RAVIYA MD VIDEO DOWNLOADER ⚙️*

📽️⚙️ TITLE - ${data.title}
📽️⚙️ VIEWS - ${data.views}
📽️⚙️ DESCRIPTION - ${data.description}
📽️⚙️ TIME - ${data.timestamp}
📽️⚙️ AGO - ${data.ago}

*Reply This Message With Option*

*1 → Video Normal*
*2 → Video Document*

> ᴘᴀᴡᴇʀᴇᴅ ʙʏ ʀᴀᴠɪʏᴀ ᴍᴅ`;

        const sent = await conn.sendMessage(
            from,
            { image: { url: data.thumbnail }, caption },
            { quoted: mek }
        );

        // LISTENER
        const listener = async (msg) => {
            try {
                const ms = msg.messages[0];
                if (!ms.message?.extendedTextMessage) return;

                const ctx = ms.message.extendedTextMessage.contextInfo;
                const selected = ms.message.extendedTextMessage.text.trim();

                if (!ctx || ctx.stanzaId !== sent.key.id) return;

                switch (selected) {
                    case '1': {
                        let down = await fg.ytv(url);
                        await conn.sendMessage(
                            from,
                            {
                                video: { url: down.dl_url },
                                mimetype: 'video/mp4',
                                caption: '> ᴘᴀᴡᴇʀᴇᴅ ʙʏ ʀᴀᴠɪʏᴀ ᴍᴅ'
                            },
                            { quoted: sent }
                        );
                        break;
                    }
                    case '2': {
                        let down = await fg.ytv(url);
                        await conn.sendMessage(
                            from,
                            {
                                document: { url: down.dl_url },
                                fileName: `${data.title}.mp4`,
                                mimetype: 'video/mp4',
                                caption: '> ᴘᴀᴡᴇʀᴇᴅ ʙʏ ʀᴀᴠɪʏᴀ ᴍᴅ'
                            },
                            { quoted: sent }
                        );
                        break;
                    }
                    default:
                        reply("Invalid option. Please select 1 or 2 🔴");
                }

                conn.ev.off('messages.upsert', listener);
            } catch (e) { console.error(e); }
        };

        conn.ev.on('messages.upsert', listener);

    } catch (e) {
        console.error(e);
        reply('❌ Error while processing your request.');
    }
});
