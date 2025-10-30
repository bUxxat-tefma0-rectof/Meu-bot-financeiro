const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const AudioProcessor = require('./audio-processor');
const ImageProcessor = require('./image-processor');
const PDFGenerator = require('./pdf-generator');
const TXTGenerator = require('./txt-generator');
require('dotenv').config();

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(TOKEN, { polling: true });

// Inicializar processadores
const audioProcessor = new AudioProcessor();
const imageProcessor = new ImageProcessor();
const pdfGenerator = new PDFGenerator();
const txtGenerator = new TXTGenerator();

// Banco de dados
const DB_FILE = 'database.json';

function loadData() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE));
  } catch {
    return { users: {} };
  }
}

function saveData(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Menu principal com botões
const mainKeyboard = {
  reply_markup: {
    keyboard: [
      ['💸 Registrar Despesa', '💰 Registrar Receita'],
      ['📊 Ver Saldo', '📝 Ver Extrato'],
      ['📄 Gerar Relatório PDF', '📋 Gerar Relatório TXT']
    ],
    resize_keyboard: true
  }
};

// Categorias com botões
const categoriesKeyboard = {
  reply_markup: {
    keyboard: [
      ['🍕 Alimentação', '🚗 Transporte', '💊 Saúde'],
      ['🏠 Moradia', '🎉 Lazer', '📚 Educação'],
      ['👕 Vestuário', '⚡ Outros', '🔙 Voltar']
    ],
    resize_keyboard: true
  }
};

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  
  bot.sendMessage(chatId, `🤖 BOT FINANCEIRO COMPLETO

💡 *O que posso fazer:*
🎤 Processar áudios com gastos
📷 Ler imagens de comprovantes  
💰 Calcular seu saldo automaticamente
📄 Gerar relatórios em PDF/TXT

*Comandos:*
/start - Iniciar bot
/relatorio - Gerar relatório completo
/saldo - Ver saldo atual

*Ou use os botões abaixo 👇*`, 
  { 
    parse_mode: 'Markdown',
    ...mainKeyboard 
  });
});

// Processar mensagens de texto
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const data = loadData();
  
  if (!data.users[chatId]) {
    data.users[chatId] = { transactions: [], saldo: 0 };
  }

  // Processar áudio
  if (msg.voice) {
    bot.sendMessage(chatId, "🎤 Processando seu áudio...");
    const audioText = await audioProcessor.processAudio(msg.voice.file_id);
    
    if (audioText) {
      bot.sendMessage(chatId, `📝 Áudio convertido: "${audioText}"`);
      // Aqui você processaria o texto do áudio como uma transação
    }
    return;
  }

  // Processar imagem
  if (msg.photo) {
    bot.sendMessage(chatId, "📷 Processando imagem...");
    const imageText = await imageProcessor.processImage(msg.photo[msg.photo.length - 1].file_id);
    
    if (imageText) {
      bot.sendMessage(chatId, `📝 Texto da imagem: "${imageText}"`);
      // Processar texto da imagem como transação
    }
    return;
  }

  // Botões
  switch(text) {
    case '💸 Registrar Despesa':
      bot.sendMessage(chatId, "💸 Digite o valor e descrição da despesa:\nEx: 150,00 farmácia", categoriesKeyboard);
      break;
      
    case '💰 Registrar Receita':
      bot.sendMessage(chatId, "💰 Digite o valor e descrição da receita:\nEx: 2000,00 salário", categoriesKeyboard);
      break;
      
    case '📊 Ver Saldo':
      const saldo = data.users[chatId].saldo;
      bot.sendMessage(chatId, `💰 SEU SALDO: R$ ${saldo.toFixed(2)}`, mainKeyboard);
      break;
      
    case '📝 Ver Extrato':
      const extrato = data.users[chatId].transactions.slice(-5).map(t => 
        `${t.data} - ${t.descricao} - R$ ${t.valor.toFixed(2)}`
      ).join('\n');
      bot.sendMessage(chatId, `📝 ÚLTIMAS TRANSAÇÕES:\n\n${extrato || 'Nenhuma transação'}`, mainKeyboard);
      break;
      
    case '📄 Gerar Relatório PDF':
      bot.sendMessage(chatId, "📄 Gerando seu relatório PDF...");
      try {
        const pdfPath = await pdfGenerator.generatePDF(data.users[chatId].transactions, msg.from);
        await bot.sendDocument(chatId, pdfPath);
        // Limpar arquivo temporário
        fs.unlinkSync(pdfPath);
      } catch (error) {
        bot.sendMessage(chatId, "❌ Erro ao gerar PDF");
      }
      break;
      
    case '📋 Gerar Relatório TXT':
      bot.sendMessage(chatId, "📋 Gerando seu relatório TXT...");
      try {
        const txtPath = await txtGenerator.generateTXT(data.users[chatId].transactions, msg.from);
        await bot.sendDocument(chatId, txtPath);
        fs.unlinkSync(txtPath);
      } catch (error) {
        bot.sendMessage(chatId, "❌ Erro ao gerar TXT");
      }
      break;
      
    case '🔙 Voltar':
      bot.sendMessage(chatId, "Menu principal:", mainKeyboard);
      break;
  }
});

console.log('🤖 Bot Financeiro COMPLETO rodando!');
