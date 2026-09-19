const fs = require('fs');
const path = require('path');
const { generateTicketPdf } = require('./src/services/ticketPdf');

const mockTicketData = {
    id: 1045,
    bookingId: 8821,
    bookingStatus: 'CONFIRMED',
    paymentStatus: 'COMPLETED',
    totalFare: '1500.00',
    bookingDate: '2026-05-26',
    passengerName: 'Shreyas K S',
    age: 25,
    gender: 'Male',
    status: 'CONFIRMED',
    trainName: 'Rajdhani Express',
    trainNumber: '12431',
    departureDate: '2026-06-15',
    seat: {
        coach: 'A1',
        seatNumber: '14',
        class: 'AC_1TIER'
    }
};

const outputPath = path.join(__dirname, '../client/sample_ticket.pdf');
console.log('Generating sample ticket at:', outputPath);

// Fake response object
const fakeRes = {
    setHeader: () => {},
    on: () => {},
    once: () => {},
    emit: () => {},
    write: () => {},
    end: () => {}
};

generateTicketPdf(mockTicketData, null, outputPath)
    .then(() => console.log('Sample ticket generated successfully!'))
    .catch(err => console.error('Error generating ticket:', err));
