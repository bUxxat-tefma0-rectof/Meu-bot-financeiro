const Tesseract = require('tesseract.js');
const axios = require('axios');
const fs = require('fs');

class ImageProcessor {
  constructor() {
    this.worker = null;
  }

  async processImage(imageFileId) {
    try {
      // Baixar imagem
      const fileLink = await bot.getFileLink(imageFileId);
      
      // Fazer OCR na imagem
      const text = await this.extractTextFromImage(fileLink);
      return text;
    } catch (error) {
      console.error('Erro no processamento de imagem:', error);
      return null;
    }
  }

  async extractTextFromImage(imageUrl) {
    try {
      const { data: { text } } = await Tesseract.recognize(
        imageUrl,
        'por',
        { logger: m => console.log(m) }
      );
      
      return text;
    } catch (error) {
      console.error('Erro no OCR:', error);
      return "Não foi possível ler o texto da imagem";
    }
  }
}

module.exports = ImageProcessor;
