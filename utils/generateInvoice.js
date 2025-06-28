// utils/generateInvoice.js
const PDFDocument = require('pdfkit');
const stream = require('stream');

exports.generateInvoiceBuffer = (order) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const bufferStream = new stream.PassThrough();
    const chunks = [];

    doc.pipe(bufferStream);

    doc.fontSize(20).text("INVOICE", { align: 'center' });
    doc.moveDown();
    doc.text(`Order ID: ${order._id}`);
    doc.text(`Customer: ${order.shippingAddress.name}`);
    doc.text(`Total Amount: ₦${order.totalAmount}`);
    doc.text(`Payment Status: ${order.paymentStatus}`);
    doc.text(`Order Status: ${order.status}`);
    doc.moveDown();
    doc.text("Items:");

    order.items.forEach(item => {
      doc.text(`- ${item.product.name} x${item.quantity}`);
    });

    doc.end();

    bufferStream.on('data', chunk => chunks.push(chunk));
    bufferStream.on('end', () => {
      const buffer = Buffer.concat(chunks);
      resolve({ buffer, fileName: `invoice-${order._id}.pdf` });
    });
    bufferStream.on('error', reject);
  });
};
