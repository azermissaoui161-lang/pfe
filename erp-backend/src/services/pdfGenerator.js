const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFGenerator {
  // Générer une facture PDF
  static async generateInvoice(invoice, customer, items) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const buffers = [];
        
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        // En-tête
        doc.fontSize(20).text('FACTURE', { align: 'center' });
        doc.moveDown();
        
        // Informations facture
        doc.fontSize(10);
        doc.text(`N° Facture: ${invoice.invoiceNumber}`);
        doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`);
        doc.text(`Échéance: ${new Date(invoice.dueDate).toLocaleDateString()}`);
        doc.moveDown();

        // Informations client
        doc.fontSize(12).text('Client:', { underline: true });
        doc.fontSize(10);
        doc.text(customer.name);
        if (customer.email) doc.text(`Email: ${customer.email}`);
        if (customer.phone) doc.text(`Tél: ${customer.phone}`);
        if (customer.address) doc.text(`Adresse: ${customer.address}`);
        doc.moveDown();

        // Tableau des articles
        const tableTop = doc.y;
        const itemX = 50;
        const descX = 150;
        const qtyX = 350;
        const priceX = 400;
        const totalX = 470;

        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('Article', itemX, tableTop);
        doc.text('Description', descX, tableTop);
        doc.text('Qté', qtyX, tableTop);
        doc.text('P.U.', priceX, tableTop);
        doc.text('Total', totalX, tableTop);
        doc.font('Helvetica');

        let y = tableTop + 20;
        items.forEach(item => {
          doc.text(item.product.name.substring(0, 20), itemX, y);
          doc.text(item.product.description?.substring(0, 30) || '-', descX, y);
          doc.text(item.quantity.toString(), qtyX, y);
          doc.text(`${item.unitPrice.toFixed(3)} DT`, priceX, y);
          doc.text(`${item.totalPrice.toFixed(3)} DT`, totalX, y);
          y += 20;
        });

        // Totaux
        y += 10;
        doc.font('Helvetica-Bold');
        doc.text(`Sous-total: ${invoice.subtotal.toFixed(3)} DT`, 400, y);
        y += 20;
        doc.text(`TVA (19%): ${invoice.tax.toFixed(3)} DT`, 400, y);
        y += 20;
        doc.fontSize(12).text(`TOTAL: ${invoice.total.toFixed(3)} DT`, 400, y);

        // Pied de page
        doc.fontSize(8).font('Helvetica');
        doc.text(
          'Document généré automatiquement - ERP System',
          50,
          doc.page.height - 50,
          { align: 'center' }
        );

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Générer un rapport financier PDF
  static async generateFinancialReport(data, period) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const buffers = [];
        
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        doc.fontSize(20).text('RAPPORT FINANCIER', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Période: ${period}`);
        doc.moveDown();

        // Trésorerie
        doc.fontSize(14).text('Trésorerie', { underline: true });
        doc.fontSize(12);
        doc.text(`Total: ${data.tresorerie.total.toFixed(3)} DT`);
        data.tresorerie.details.forEach(acc => {
          doc.text(`  ${acc.code} - ${acc.name}: ${acc.balance.toFixed(3)} DT`);
        });
        doc.moveDown();

        // Créances
        doc.fontSize(14).text('Créances Clients', { underline: true });
        doc.fontSize(12);
        doc.text(`Total: ${data.creances.total.toFixed(3)} DT`);
        doc.text(`Nombre de factures: ${data.creances.count}`);
        doc.moveDown();

        // Chiffre d'affaires
        doc.fontSize(14).text('Chiffre d\'affaires', { underline: true });
        doc.fontSize(12);
        doc.text(`CA mensuel: ${data.chiffreAffairesMois?.toFixed(3) || 0} DT`);
        
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = PDFGenerator;