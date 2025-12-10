const config = require('../config')
const { cmd, commands } = require('../command')
const { fetchJson } = require('../lib/functions')

cmd({
    pattern: "ai",
    react: "✨",
    desc: "AI chat",
    category: "main",
    filename: __filename
},
async(conn, mek, m, {
    from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber,
    botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName,
    participants, groupAdmins, isBotAdmins, isAdmins, reply
}) => {
    try {

        // Prevent empty prompt
        if (!q) return reply("❌ *Please type your question.*\nExample: .ai hello")

        const url = `https://chatgptforprabath-md.vercel.app/api/gptv1?q=${encodeURIComponent(q)}`

        const data = await fetchJson(url)

        // Validate response
        if (!data || !data.data) {
            return reply("⚠️ *AI response failed.* Please try again later.")
        }

        return reply(data.data)

    } catch (err) {
        console.error(err)
        reply("❌ *Error:* " + (err.message || err))
    }
})
