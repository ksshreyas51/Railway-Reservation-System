const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function generateTicketPdf(ticketData, res, filePath) {
    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const doc = new PDFDocument({ margin: 50 });

    // Pipe to file
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);
    
    // Pipe to HTTP response if provided
    if (res) {
        doc.pipe(res);
    }

    // Header
    doc.fontSize(20).text('Railway Reservation Ticket', { align: 'center' });
    doc.moveDown();

    // Booking Details
    doc.fontSize(14).text('Booking Details', { underline: true });
    doc.fontSize(12).text(`Booking ID: ${ticketData.bookingId}`);
    doc.text(`Ticket ID: ${ticketData.id}`);
    doc.text(`Booking Status: ${ticketData.bookingStatus}`);
    doc.text(`Payment Status: ${ticketData.paymentStatus}`);
    doc.text(`Total Fare: INR ${ticketData.totalFare}`);
    doc.text(`Date of Booking: ${ticketData.bookingDate}`);
    doc.moveDown();

    // Passenger Info
    doc.fontSize(14).text('Passenger Details', { underline: true });
    doc.fontSize(12).text(`Name: ${ticketData.passengerName}`);
    doc.text(`Age: ${ticketData.age}`);
    doc.text(`Gender: ${ticketData.gender}`);
    doc.text(`Ticket Status: ${ticketData.status}`);
    doc.moveDown();

    // Train & Seat Info
    doc.fontSize(14).text('Journey Details', { underline: true });
    doc.fontSize(12).text(`Train: ${ticketData.trainName} (${ticketData.trainNumber})`);
    doc.text(`Date of Journey: ${ticketData.departureDate}`);
    
    if (ticketData.seat) {
        doc.text(`Coach: ${ticketData.seat.coach}`);
        doc.text(`Seat Number: ${ticketData.seat.seatNumber}`);
        doc.text(`Class: ${ticketData.seat.class}`);
    } else if (ticketData.waitlistNumber) {
        doc.text(`Waitlist/RAC Number: ${ticketData.waitlistNumber}`);
    }

    doc.moveDown();
    doc.fontSize(10).text('Thank you for traveling with us!', { align: 'center' });

    doc.end();

    return new Promise((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
    });
}

module.exports = { generateTicketPdf };
