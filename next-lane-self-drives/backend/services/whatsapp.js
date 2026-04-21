const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-accelerated-2d-canvas', '--no-first-run', '--no-zygote', '--single-process', '--disable-gpu']
  }
});

let isReady = false;
let lastQR = null;

client.on('qr', (qr) => {
  console.log('\n[WhatsApp] QR Code received. SCAN THIS WITH YOUR WHATSAPP APP:\n');
  qrcode.generate(qr, { small: true });
  lastQR = qr;
});

client.on('ready', () => {
  console.log('[WhatsApp] Client is ready. WhatsApp Automation is ACTIVE!');
  isReady = true;
  lastQR = null;
});

client.on('auth_failure', (msg) => {
  console.error('[WhatsApp] Authentication failure', msg);
});

client.on('disconnected', (reason) => {
  console.log('[WhatsApp] Client was logged out or disconnected', reason);
  isReady = false;
});

// Start the client connection
const initializeWhatsApp = () => {
  console.log('[WhatsApp] Initializing...');
  client.initialize().catch(err => {
    console.error('[WhatsApp] Initialization error:', err);
  });
};

/**
 * Send a WhatsApp Message
 * @param {string} to - The phone number (e.g., 919342179459)
 * @param {string} text - The message to send
 */
const sendWhatsAppMessage = async (to, text) => {
  if (!isReady) {
    console.warn('[WhatsApp] Client is not ready yet. Cannot send message to', to);
    return false;
  }
  try {
    // Format number to WhatsApp format (e.g., "919342179459@c.us")
    let chatId = to;
    if (chatId.includes('+')) chatId = chatId.replace('+', '');
    if (!chatId.includes('@c.us')) chatId = `${chatId}@c.us`;

    await client.sendMessage(chatId, text);
    console.log(`[WhatsApp] Message successfully sent to ${to}`);
    return true;
  } catch (err) {
    console.error(`[WhatsApp] Failed to send message to ${to}:`, err);
    return false;
  }
};

const getWhatsAppStatus = () => ({ isReady, lastQR });

module.exports = { initializeWhatsApp, sendWhatsAppMessage, getWhatsAppStatus };
