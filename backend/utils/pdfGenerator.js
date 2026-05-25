const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

const generateTicketPDF = async (booking, show, movie, theatre) => {
    return new Promise(async (resolve, reject) => {
        try {
            const showDateStr = show.showDate 
                ? new Date(show.showDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
                : 'Upcoming';

            const qrText = [
                `🎟️ REV-BOOKMYSHOW TICKET`,
                `--------------------------`,
                `Booking ID: ${booking._id}`,
                `Movie: ${movie.title}`,
                `Theatre: ${theatre.name}`,
                `Screen: ${show.screenId?.screenName || 'Screen 1'}`,
                `Seats: ${booking.seats.join(', ')}`,
                `Date: ${showDateStr}`,
                `Time: ${show.showTime}`,
                `Total Amount: INR ${booking.totalAmount}`,
                `Status: Confirmed & Paid`
            ].join('\n');

            const qrBuffer = await QRCode.toBuffer(qrText, {
                errorCorrectionLevel: 'M',
                margin: 1,
                width: 120
            });

            const doc = new PDFDocument({ margin: 40, size: 'A6' });
            const chunks = [];

            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', err => reject(err));

            doc.rect(0, 0, doc.page.width, 10).fill('#dc3545');

            doc.moveDown(1.5);
            doc.fillColor('#dc3545')
               .fontSize(16)
               .text('Rev-BookMyShow', { align: 'center', bold: true });

            doc.fillColor('#7f8c8d')
               .fontSize(8)
               .text('OFFICIAL BOOKING RECEIPT', { align: 'center' });

            doc.moveDown(1);
            doc.strokeColor('#bdc3c7')
               .lineWidth(1)
               .moveTo(20, doc.y)
               .lineTo(doc.page.width - 20, doc.y)
               .stroke();

            doc.moveDown(1);

            doc.fillColor('#2c3e50')
               .fontSize(12)
               .text(movie.title.toUpperCase(), { bold: true });

            doc.moveDown(0.5);
            doc.fillColor('#34495e')
               .fontSize(9)
               .text(`Theatre: ${theatre.name}`)
               .text(`Screen: ${show.screenId?.screenName || 'Screen 1'}`)
               .text(`Seats: ${booking.seats.join(', ')}`, { bold: true })
               .text(`Date: ${showDateStr}`)
               .text(`Time: ${show.showTime}`);

            doc.moveDown(0.5);
            doc.text(`Total Amount: ₹${booking.totalAmount}`, { bold: true });

            doc.moveDown(1);
            doc.strokeColor('#bdc3c7')
               .lineWidth(1)
               .dash(4, { space: 4 })
               .moveTo(20, doc.y)
               .lineTo(doc.page.width - 20, doc.y)
               .stroke()
               .undash();

            doc.moveDown(1.5);
            const qrX = (doc.page.width - 100) / 2;
            doc.image(qrBuffer, qrX, doc.y, { width: 100 });

            doc.moveDown(11.5);
            doc.fillColor('#95a5a6')
               .fontSize(7)
               .text('Scan QR at screen gate entry.', { align: 'center' });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { generateTicketPDF };
