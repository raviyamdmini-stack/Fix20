const { proto, downloadContentFromMessage, getContentType } = require('@whiskeysockets/baileys')
const fs = require('fs')

/* ===========================
        DOWNLOAD MEDIA
=============================*/
const downloadMediaMessage = async (m, filename) => {
    try {
        if (!m || !m.msg) return null
        
        let type = m.type
        if (type === 'viewOnceMessage') {
            type = m.msg.type
        }

        const mimeTypeMap = {
            imageMessage: { folder: 'image', ext: 'jpg' },
            videoMessage: { folder: 'video', ext: 'mp4' },
            audioMessage: { folder: 'audio', ext: 'mp3' },
            stickerMessage: { folder: 'sticker', ext: 'webp' },
            documentMessage: { folder: 'document', ext: null },
        }

        if (!mimeTypeMap[type]) return null

        let ext = mimeTypeMap[type].ext
        if (type === 'documentMessage') {
            const raw = m.msg.fileName?.split('.').pop() || 'bin'
            ext = raw.toLowerCase()
                .replace('jpeg', 'jpg')
                .replace('png', 'jpg')
                .replace('m4a', 'mp3')
        }

        const name = filename ? `${filename}.${ext}` : `undefined.${ext}`

        const stream = await downloadContentFromMessage(m.msg, mimeTypeMap[type].folder)
        let buffer = Buffer.from([])

        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }

        fs.writeFileSync(name, buffer)
        return buffer
        
    } catch (e) {
        console.error("Download Error:", e)
        return null
    }
}

/* ===========================
       MESSAGE PARSER
=============================*/
const sms = (conn, m) => {
    // KEY
    if (m.key) {
        m.id = m.key.id
        m.chat = m.key.remoteJid
        m.fromMe = m.key.fromMe
        m.isGroup = m.chat.endsWith('@g.us')
        m.sender = m.fromMe
            ? conn.user.id.split(':')[0] + '@s.whatsapp.net'
            : m.isGroup
                ? m.key.participant
                : m.key.remoteJid
    }

    // MESSAGE
    if (m.message) {
        m.type = getContentType(m.message)

        // VIEW ONCE FIX
        if (m.type === 'viewOnceMessage') {
            const inner = m.message[m.type].message
            m.msg = inner[getContentType(inner)]
            m.msg.type = getContentType(inner)
        } else {
            m.msg = m.message[m.type]
        }

        // MENTION FIX
        const quotedMention = m.msg?.contextInfo?.participant || ''
        let tagMention = m.msg?.contextInfo?.mentionedJid || []
        tagMention = Array.isArray(tagMention) ? tagMention : [tagMention]

        m.mentionUser = [...tagMention, quotedMention].filter(Boolean)

        // BODY
        m.body =
            m.type === 'conversation' ? m.msg :
            m.type === 'extendedTextMessage' ? m.msg.text :
            m.type === 'imageMessage' && m.msg.caption ? m.msg.caption :
            m.type === 'videoMessage' && m.msg.caption ? m.msg.caption :
            m.type === 'templateButtonReplyMessage' ? m.msg.selectedId :
            m.type === 'buttonsResponseMessage' ? m.msg.selectedButtonId : ''

        // QUOTED
        m.quoted = m.msg?.contextInfo?.quotedMessage || null

        if (m.quoted) {
            m.quoted.type = getContentType(m.quoted)
            m.quoted.id = m.msg.contextInfo.stanzaId
            m.quoted.sender = m.msg.contextInfo.participant
            m.quoted.fromMe = m.quoted.sender?.includes(conn.user.id.split(':')[0])

            // INNER FIX
            if (m.quoted.type === 'viewOnceMessage') {
                const inner = m.quoted[m.quoted.type].message
                m.quoted.msg = inner[getContentType(inner)]
                m.quoted.msg.type = getContentType(inner)
            } else {
                m.quoted.msg = m.quoted[m.quoted.type]
            }

            // MENTION FIX
            let qMention = m.quoted.msg?.contextInfo?.mentionedJid || []
            qMention = Array.isArray(qMention) ? qMention : [qMention]
            const qSender = m.quoted.msg?.contextInfo?.participant || ''
            m.quoted.mentionUser = [...qMention, qSender].filter(Boolean)

            // FAKE OBJ FOR DELETE/REACT
            m.quoted.fakeObj = proto.WebMessageInfo.fromObject({
                key: {
                    remoteJid: m.chat,
                    fromMe: m.quoted.fromMe,
                    id: m.quoted.id,
                    participant: m.quoted.sender
                },
                message: m.quoted
            })

            m.quoted.download = (filename) => downloadMediaMessage(m.quoted, filename)
            m.quoted.delete = () =>
                conn.sendMessage(m.chat, { delete: m.quoted.fakeObj.key })
            m.quoted.react = (emoji) =>
                conn.sendMessage(m.chat, { react: { text: emoji, key: m.quoted.fakeObj.key } })
        }

        // NORMAL DOWNLOAD
        m.download = (filename) => downloadMediaMessage(m, filename)
    }

    /* ===========================
         REPLY FUNCTIONS
    =============================*/
    m.reply = (text, id = m.chat, opt = { mentions: [m.sender] }) =>
        conn.sendMessage(id, { text, contextInfo: { mentionedJid: opt.mentions } }, { quoted: m })

    m.replyS = (sticker, id = m.chat, opt = { mentions: [m.sender] }) =>
        conn.sendMessage(id, { sticker, contextInfo: { mentionedJid: opt.mentions } }, { quoted: m })

    m.replyImg = (img, text, id = m.chat, opt = { mentions: [m.sender] }) =>
        conn.sendMessage(id, { image: img, caption: text, contextInfo: { mentionedJid: opt.mentions } }, { quoted: m })

    m.replyVid = (vid, text, id = m.chat, opt = { mentions: [m.sender], gif: false }) =>
        conn.sendMessage(id, { video: vid, caption: text, gifPlayback: opt.gif, contextInfo: { mentionedJid: opt.mentions } }, { quoted: m })

    m.replyAud = (aud, id = m.chat, opt = { mentions: [m.sender], ptt: false }) =>
        conn.sendMessage(id, { audio: aud, ptt: opt.ptt, mimetype: 'audio/mpeg', contextInfo: { mentionedJid: opt.mentions } }, { quoted: m })

    m.replyDoc = (doc, id = m.chat, opt = { mentions: [m.sender], filename: 'undefined.pdf', mimetype: 'application/pdf' }) =>
        conn.sendMessage(id, { document: doc, fileName: opt.filename, mimetype: opt.mimetype, contextInfo: { m
