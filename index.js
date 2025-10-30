const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const PDFDocument = require('pdfkit');
require('dotenv').config();

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(TOKEN, { polling: true });

// Banco de dados simples
const DB_FILE = 'database.json';

// Carregar dados
function loadData() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE));
  } catch {
    return { users: {} };
