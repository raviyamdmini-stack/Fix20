const config = require('../config')
const { cmd, commands } = require('../command')
const os = require("os")
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('../lib/functions')

//================ ALIVE ================

cmd({
    pattern: "alive",
    desc: "Check bot online or no.",
    category: "main",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
try {
    return await conn.sendMessage(from, {
        image: { url: config.ALIVE_IMG },
        caption: config.ALIVE_MSG
    }, { quoted: mek })

} catch (e) {
    console.log(e)
    reply(`${e}`)
}
})


//================ PING ================

cmd({
    pattern: "ping",
    react: "⚡",
    alias: ["speed"],
    desc: "Check bot’s ping",
    category: "main",
    use: '.ping',
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
try {
    var initial = new Date().getTime();
    let pingMsg = await conn.sendMessage(from, { text: '```Pinging...```' }, { quoted: mek })
    var final = new Date().getTime();

    return await conn.edit(pingMsg, `*Pong!* 🏓\n*${final - initial} ms*`)

} catch (e) {
    reply(`${e}`)
    console.log(e)
}
})


//================ MENU ================

cmd({
    pattern: "menu",
    desc: "To get the menu.",
    react: "📜",
    category: "main",
    filename: __filename
},
async (conn, mek, m, { from, pushname, reply }) => {
try {

let menu = {
    main: '',
    download: '',
    group: '',
    owner: '',
    convert: '',
    ai: '',
    tools: '',
    search: '',
    fun: '',
    voice: '',
    other: ''
};

// Add commands to menu
for (let c of commands) {
    if (!c?.pattern || c?.dontAddCommandList) continue;
    if (!menu[c.category]) menu[c.category] = '';
    menu[c.category] += `.${c.pattern}\n`;
}

let madeMenu = `
👋 𝐇𝐄𝐋𝐋𝐎, ${pushname}!

✨ 𝗪𝗲𝗹𝗰𝗼𝗺𝗲 𝘁𝗼 𝙍𝘼𝙑𝙄𝙔𝘼 𝙈𝘿 ✨
╭─「 ᴄᴏᴍᴍᴀɴᴅꜱ ᴘᴀɴᴇʟ」
│◈ ʀᴜɴᴛɪᴍᴇ : ${runtime(process.uptime())}
│◈ ᴏᴡɴᴇʀ ɴᴀᴍᴇ : ${config.OWNER_NAME || "🎭PAMUDINA RAVIHARA🎭"}
│◈ ᴏᴡɴᴇʀ ɴᴜᴍʙᴇʀ : ${config.OWNER_NUMBER || "94785505762"}
╰──────────●●►

📥 *𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐌𝐞𝐧𝐮*
${menu.download}

👾 *𝐀𝐢 𝐌𝐞𝐧𝐮*
${menu.ai}

🔧 *𝐌𝐚𝐢𝐧 𝐌𝐞𝐧𝐮*
${menu.main}

🎉 *𝐅𝐮𝐧 𝐌𝐞𝐧𝐮*
${menu.fun}

🔄 *𝐂𝐨𝐧𝐯𝐞𝐫𝐭 𝐌𝐞𝐧𝐮*
${menu.convert}

🔍 *𝐒𝐞𝐚𝐫𝐜𝐡 𝐌𝐞𝐧𝐮*
${menu.search}

👥 *𝐆𝐫𝐨𝐮𝐩 𝐌𝐞𝐧𝐮*
${menu.group}

🔒 *𝐎𝐰𝐧𝐞𝐫 𝐌𝐞𝐧𝐮*
${menu.owner}

⚙️ *𝐎𝐭𝐡𝐞𝐫 𝐌𝐞𝐧𝐮*
${menu.other}

🛠️ *𝐓𝐨𝐨𝐥𝐬 𝐌𝐞𝐧𝐮*
${menu.tools}

> *© Powered By Pamudina Ravihara*
`

return await conn.sendMessage(
    from,
    {
        image: { url: `https://i.ibb.co/spvMX3vb/Supunmd.jpg` },
        caption: madeMenu
    },
    { quoted: mek }
)

} catch (e) {
    console.log(e)
    reply("❌ Menu Error!")
}
})
