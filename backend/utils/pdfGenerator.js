import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateInvoicePDF = async (booking, user, hall, service) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const filename = `invoice-${booking.invoiceNumber}.pdf`;
    const filepath = path.join(__dirname, '../temp', filename);

    // Ensure temp directory exists
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    // Header with company name
    doc.fontSize(24).font('Helvetica-Bold').fillColor('#D4AF37').text('Lumière Events', { align: 'center' });
    doc.fontSize(12).font('Helvetica').fillColor('#000000').text('Premium Event Organizers', { align: 'center' });
    doc.moveDown(2);
    
    doc.fontSize(20).font('Helvetica-Bold').fillColor('#000000').text('INVOICE', { align: 'center' });
    doc.moveDown();
    
    // Invoice details
    doc.fontSize(10).font('Helvetica');
    doc.text(`Invoice #: ${booking.invoiceNumber}`, { align: 'right' });
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, { align: 'right' });
    doc.text(`Booking Date: ${new Date(booking.createdAt).toLocaleDateString('en-IN')}`, { align: 'right' });
    doc.moveDown(2);

    // Customer details
    doc.fontSize(14).font('Helvetica-Bold').text('Bill To:', { underline: true });
    doc.fontSize(12).font('Helvetica');
    doc.text(user.name || 'N/A');
    doc.text(user.email || 'N/A');
    doc.text(user.phone || 'N/A');
    doc.moveDown(2);

    // Booking details
    doc.fontSize(14).font('Helvetica-Bold').text('Event Details:', { underline: true });
    doc.fontSize(12).font('Helvetica');
    doc.text(`Event Name: ${booking.eventName || 'N/A'}`);
    doc.text(`Event Type: ${(booking.eventType || 'N/A').charAt(0).toUpperCase() + (booking.eventType || '').slice(1)}`);
    doc.text(`Venue: ${hall?.name || 'N/A'}`);
    doc.text(`Location: ${hall?.location || 'N/A'}`);
    doc.text(`Date: ${new Date(booking.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`);
    doc.text(`Time: ${booking.startTime || 'N/A'} - ${booking.endTime || 'N/A'}`);
    doc.text(`Number of Guests: ${booking.guestCount || 0}`);
    doc.moveDown(2);

    // Items table header
    doc.fontSize(14).font('Helvetica-Bold').text('Items:', { underline: true });
    doc.moveDown(0.5);
    
    let y = doc.y;
    const startX = 50;
    const descX = startX;
    const amountX = 450;
    
    // Table header
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Description', descX, y);
    doc.text('Amount', amountX, y, { align: 'right' });
    y += 5;
    doc.moveTo(descX, y).lineTo(550, y).stroke();
    y += 15;

    // Items
    doc.fontSize(10).font('Helvetica');
    doc.text('Base Price', descX, y);
    doc.text(`₹${(booking.basePrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, amountX, y, { align: 'right' });
    y += 20;

    if (booking.slotPrice > 0) {
      doc.text('Time Slot', descX, y);
      doc.text(`₹${booking.slotPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, amountX, y, { align: 'right' });
      y += 20;
    }

    if (booking.addons && booking.addons.length > 0) {
      booking.addons.forEach(addon => {
        doc.text(`${addon.name} x${addon.quantity || 1}`, descX, y);
        doc.text(`₹${((addon.price || 0) * (addon.quantity || 1)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, amountX, y, { align: 'right' });
        y += 20;
      });
    }

    // Subtotal
    const subtotal = (booking.basePrice || 0) + (booking.slotPrice || 0) + (booking.addonsTotal || 0);
    y += 10;
    doc.moveTo(descX, y).lineTo(550, y).stroke();
    y += 15;
    doc.fontSize(11).font('Helvetica-Bold');
    doc.text('Subtotal', descX, y);
    doc.text(`₹${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, amountX, y, { align: 'right' });
    y += 20;

    // Tax
    doc.fontSize(10).font('Helvetica');
    doc.text('Tax (18% GST)', descX, y);
    doc.text(`₹${(booking.tax || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, amountX, y, { align: 'right' });
    y += 30;

    // Total
    doc.moveTo(descX, y).lineTo(550, y).stroke();
    y += 15;
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#D4AF37');
    doc.text('Total Amount', descX, y);
    doc.text(`₹${(booking.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, amountX, y, { align: 'right' });
    doc.fillColor('#000000');
    doc.moveDown(3);

    // Payment status
    doc.fontSize(11).font('Helvetica');
    doc.text(`Payment Status: ${(booking.paymentStatus || 'pending').toUpperCase()}`, { align: 'left' });
    if (booking.paidAmount > 0) {
      doc.text(`Paid Amount: ₹${(booking.paidAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, { align: 'left' });
    }
    doc.moveDown(2);

    // Footer
    doc.fontSize(10).font('Helvetica').fillColor('#666666');
    doc.text('Thank you for choosing Lumière Events!', { align: 'center' });
    doc.moveDown(0.5);
    doc.text('For any queries, please contact us at support@lumiereevents.com', { align: 'center' });
    doc.moveDown(1);
    doc.text(`© ${new Date().getFullYear()} Lumière Events. All rights reserved.`, { align: 'center' });

    doc.end();

    stream.on('finish', () => {
      resolve(filepath);
    });

    stream.on('error', reject);
  });
};









