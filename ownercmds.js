const { cmd } = require('../command');
const axios = require('axios');
const config = require('../config');
const fs = require('fs');
const path = require('path');


// =================== 1. SHUTDOWN BOT ===================

cmd({
    pattern: "shutdown",
    desc: "Shutdown the bot.",
    category: "owner",
    react: "🛑",
    filename: __filename
},
async (conn, mek, m, { isOwner, reply }) => {
    if (!isOwner) return reply("❌ You are not the owner!");

    await reply("🛑 Shutting down bot...");
    setTimeout(() => process.exit(0), 1000);
});


// =================== 2. BROADCAST MESSAGE ===================

cmd({
    pattern: "broadcast",
    desc: "Broadcast a message to all groups.",
    category: "owner",
    react: "📢",
    filename: __filename
},
async (conn, mek, m, { isOwner, args, reply }) => {

    if (!isOwner) return reply("❌ You are not the owner!");
    if (!args || args.length === 0) return reply("📢 Provide a message to broadcast.");

    const message = args.join(" ");
    const groups = await conn.groupFetchAllParticipating();
    const groupIds = Object.keys(groups);

    reply(`📢 Broadcasting to *${groupIds.length}* groups...`);

    for (const id of groupIds) {
        await conn.sendMessage(id, { text: message });
        await new Promise(res => setTimeout(res, 500)); // Slow broadcast
    }

    reply("✅ Broadcast completed.");
});


// =================== 3. SET PROFILE PICTURE ===================

cmd({
    pattern: "setpp",
    desc: "Set the bot profile picture.",
    category: "owner",
    react: "🖼️",
    filename: __filename
},
async (conn, mek, m, { isOwner, quoted, reply }) => {

    if (!isOwner) return reply("❌ You are not the owner!");
    if (!quoted?.message?.imageMessage)
        return reply("❌ Reply to an image to set as profile.");

    try {
        const media = await conn.downloadMediaMessage(quoted);
        await conn.updateProfilePicture(conn.user.id, media);

        reply("🖼️ Bot profile picture updated successfully!");
    } catch (err) {
        reply("❌ Error: " + err.message);
    }
});


// =================== 4. BLOCK USER ===================

cmd({
    pattern: "block",
    desc: "Block a user.",
    category: "owner",
    react: "🚫",
    filename: __filename
},
async (conn, mek, m, { isOwner, quoted, reply }) => {

    if (!isOwner) return reply("❌ You are not the owner!");
    if (!quoted) return reply("❌ Reply to a user you want to block.");

    const user = quoted.sender || quoted.key.participant;

    try {
        await conn.updateBlockStatus(user, "block");
        reply(`🚫 User @${user.split("@")[0]} blocked.`, { mentions: [user] });
    } catch (e) {
        reply("❌ Failed: " + e.message);
    }
});


// =================== 5. UNBLOCK USER ===================

cmd({
    pattern: "unblock",
    desc: "Unblock a user.",
    category: "owner",
    react: "✅",
    filename: __filename
},
async (conn, mek, m, { isOwner, quoted, reply }) => {

    if (!isOwner) return reply("❌ You are not the owner!");
