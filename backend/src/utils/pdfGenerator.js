import PDFDocument from 'pdfkit';

export const generateInvoicePDF = (order, stream) => {
  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(stream);

  // 1. Header Section
  doc.fillColor('#2D5016')
     .fontSize(22)
     .text('SENDRIYA KRUSHIBHUSHAN', { align: 'center', underline: true })
     .moveDown(0.2);

  doc.fillColor('#333333')
     .fontSize(10)
     .text('Organic Agriculture E-Commerce Platform', { align: 'center' })
     .text('Maharashtra, India | Sponsored by Sunil Bhosale (Krushibhushan Awardee)', { align: 'center' })
     .moveDown(1.5);

  // 2. Metadata Columns
  doc.fontSize(12).fillColor('#111111');
  const metadataTop = doc.y;
  
  doc.text(`Invoice No: INV-${order._id.toString().substring(0, 8).toUpperCase()}`, 50, metadataTop);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 50, metadataTop + 15);
  doc.text(`Order Status: ${order.orderStatus.toUpperCase()}`, 50, metadataTop + 30);

  doc.text('Bill To:', 320, metadataTop);
  doc.text(order.shippingAddress.fullName, 320, metadataTop + 15);
  doc.text(`${order.shippingAddress.addressLine1}, ${order.shippingAddress.addressLine2 || ''}`, 320, metadataTop + 30);
  doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.postalCode}`, 320, metadataTop + 45);
  doc.text(`Phone: ${order.shippingAddress.phone}`, 320, metadataTop + 60);

  doc.moveDown(3.5);

  // 3. Table Header
  const tableTop = doc.y;
  doc.fontSize(10).fillColor('#ffffff');
  // Draw green header block
  doc.rect(50, tableTop - 5, 500, 20).fill('#2D5016');
  
  doc.text('Product Description', 60, tableTop);
  doc.text('Qty', 320, tableTop);
  doc.text('Unit Price', 380, tableTop, { width: 70, align: 'right' });
  doc.text('Total', 470, tableTop, { width: 70, align: 'right' });

  doc.fillColor('#333333');
  let currentY = tableTop + 20;

  // 4. Table Items
  order.items.forEach(item => {
    // Check page boundaries
    if (currentY > 650) {
      doc.addPage();
      currentY = 50;
    }
    
    doc.text(item.name, 60, currentY, { width: 250 });
    doc.text(item.quantity.toString(), 320, currentY);
    doc.text(`₹${item.price.toFixed(2)}`, 380, currentY, { width: 70, align: 'right' });
    doc.text(`₹${(item.quantity * item.price).toFixed(2)}`, 470, currentY, { width: 70, align: 'right' });
    
    currentY += 25;
  });

  // Draw separator line
  doc.moveTo(50, currentY).lineTo(550, currentY).strokeColor('#dddddd').stroke();
  currentY += 15;

  // 5. Total calculations
  doc.fontSize(10).fillColor('#111111');
  doc.text('Subtotal:', 350, currentY, { width: 100, align: 'right' });
  doc.text(`₹${order.cartSummary.subtotal.toFixed(2)}`, 470, currentY, { width: 70, align: 'right' });
  currentY += 15;

  doc.text('Shipping:', 350, currentY, { width: 100, align: 'right' });
  doc.text(`₹${order.cartSummary.shipping.toFixed(2)}`, 470, currentY, { width: 70, align: 'right' });
  currentY += 15;

  doc.text('Tax (GST):', 350, currentY, { width: 100, align: 'right' });
  doc.text(`₹${order.cartSummary.tax.toFixed(2)}`, 470, currentY, { width: 70, align: 'right' });
  currentY += 20;

  // Total highlighting
  doc.fontSize(12).fillColor('#2D5016');
  doc.text('Grand Total:', 350, currentY, { width: 100, align: 'right' });
  doc.text(`₹${order.cartSummary.total.toFixed(2)}`, 470, currentY, { width: 70, align: 'right' });

  // 6. Footer Notes
  doc.moveDown(4);
  doc.fontSize(10).fillColor('#777777')
     .text('Thank you for supporting organic agriculture and sustainable farming!', { align: 'center', italic: true })
     .text('This is a computer generated invoice and does not require a physical signature.', { align: 'center', fontSize: 8 });

  doc.end();
};
