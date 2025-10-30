const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFGenerator {
  generatePDF(transactions, userInfo) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument();
        const filename = `relatorio_financeiro_${Date.now()}.pdf`;
        const filePath = path.join(__dirname, 'temp', filename);
        
        // Criar diretório temp se não existir
        if (!fs.existsSync(path.join(__dirname, 'temp'))) {
          fs.mkdirSync(path.join(__dirname, 'temp'));
        }
        
        doc.pipe(fs.createWriteStream(filePath));
        
        // Cabeçalho
        doc.fontSize(20).text('📊 RELATÓRIO FINANCEIRO', 100, 100);
        doc.fontSize(12).text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 100, 130);
        doc.text(`Usuário: ${userInfo.first_name || 'Usuário'}`, 100, 150);
        
        // Saldo
        const saldo = transactions.reduce((acc, trans) => {
          return trans.tipo === 'Receita' ? acc + trans.valor : acc - trans.valor;
        }, 0);
        
        doc.fontSize(16).text(`💰 SALDO ATUAL: R$ ${saldo.toFixed(2)}`, 100, 180);
        
        // Transações
        doc.fontSize(14).text('📝 ÚLTIMAS TRANSAÇÕES:', 100, 220);
        
        let yPosition = 250;
        transactions.slice(-10).forEach(trans => {
          if (yPosition > 700) {
            doc.addPage();
            yPosition = 100;
          }
          
          const emoji = trans.tipo === 'Receita' ? '💰' : '💸';
          doc.text(`${emoji} ${trans.data} - ${trans.descricao}`, 120, yPosition);
          doc.text(`R$ ${trans.valor.toFixed(2)} - ${trans.categoria}`, 400, yPosition);
          yPosition += 20;
        });
        
        doc.end();
        
        doc.on('end', () => {
          resolve(filePath);
        });
        
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = PDFGenerator;
