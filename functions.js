const axios = require('axios');

/**
 * Get buffer from URL
 */
const getBuffer = async (url, options = {}) => {
    try {
        const res = await axios({
            method: 'get',
            url,
            headers: {
                'DNT': 1,
                'Upgrade-Insecure-Requests': 1
            },
            responseType: 'arraybuffer',
            ...options
        });
        return res.data;
    } catch (e) {
        console.error('getBuffer Error:', e.message);
        return null;
    }
};

/**
 * Get group admins from participants array
 */
const getGroupAdmins = (participants = []) => {
    const admins = [];
    for (let p of participants) {
        if (p.admin && p.id) admins.push(p.id); 
    }
    return admins;
};

/**
 * Generate random filename or string with extension
 */
const getRandom = (ext) => {
    return `${Math.floor(Math.random() * 10000)}${ext}`;
};

/**
 * Convert number to human readable (e.g., 1000 -> 1K)
 */
const h2k = (num) => {
    if (isNaN(num)) return num;

    const units = ['', 'K', 'M', 'B', 'T', 'P', 'E'];
    const tier = Math.floor(Math.log10(Math.abs(num)) / 3);

    if (tier < 1) return num.toString();

    const unit = units[tier];
    const scale = Math.pow(10, tier * 3);
    let scaled = (num / scale).toFixed(1);

    // Remove trailing .0
    scaled = scaled.replace(/\.0$/, '');

    return scaled + unit;
};

/**
 * Validate URL
 */
const isUrl = (url = '') => {
    return url.match(
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%.+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%+.~#?&/=]*)/gi
    );
};

/**
 * Pretty JSON stringify
 */
const Json = (data) => JSON.stringify(data, null, 2);

/**
 * Convert seconds to readable runtime format
 */
const runtime = (seconds) => {
    seconds = Number(seconds);
    if (isNaN(seconds)) return "Invalid number";

    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    return `${d ? `${d} day${d > 1 ? 's' : ''}, ` : ''}`
        + `${h ? `${h} hour${h > 1 ? 's' : ''}, ` : ''}`
        + `${m ? `${m} minute${m > 1 ? 's' : ''}, ` : ''}`
        + `${s} second${s !== 1 ? 's' : ''}`;
};

/**
 * Sleep utility
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch JSON from URL
 */
const fetchJson = async (url, options = {}) => {
    try {
        const res = await axios({
            method: 'GET',
            url,
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36'
            },
            ...options
        });
        return res.data;
    } catch (err) {
        console.error('fetchJson Error:', err.message);
        return null;
    }
};

module.exports = {
    getBuffer,
    getGroupAdmins,
    getRandom,
    h2k,
    isUrl,
    Json,
    runtime,
    sleep,
    fetchJson
};
