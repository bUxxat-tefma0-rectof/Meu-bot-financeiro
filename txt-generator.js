const fs = require('fs');
const path = require('path');

class TXTGenerator {
  generateTXT(transactions, userInfo) {
    return new Promise((resolve, reject) => {
      try {
        const filename = `relatorio_${Date.now()}.txt`;
        const filePath = path.join(__dirname, 'temp', filename);
        
        let content = '📊 RELATÓRIO FINANCEIRO\n';
        content += '='.repeat(50) + '\n';
        content += `Data: ${new Date().toLocaleString('pt-BR')}\n`;
        content += `Usuário: ${userInfo.first_name || 'Usuário'}\n\n`;
        
        // Calcular saldo
        const saldo = transactions.reduce((acc, trans) => {
          return trans.tipo === 'Receita' ? acc + trans.valor : acc - trans.valor;
        }, 0);
        
        content += `💰 SALDO ATUAL: R$ ${saldo.toFixed(2)}\n\n`;
        content += '📝 ÚLTIMAS TRANSAÇÕES:\n';
        content += '-'.repeat(50) + '\n';
        
        transactions.slice(-20).forEach(trans => {
          const tipo = trans.tipo === 'Receita' ? '[RECEITA]' : '[DESPESA]';
          content += `${trans.data} ${tipo} ${trans.descricao}\n`;
          content += `    Valor: R$ ${trans.valor.toFixed(2)} | Categoria: ${trans.categoria}\n\n`;
        });
        
        fs.writeFileSync(filePath, content, 'utf8');
        resolve(filePath);
        
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = TXTGenerator;
