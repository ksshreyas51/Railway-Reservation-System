const { bookTicket, cancelTicket } = require('../services/reservation');
const { PrismaClient } = require('@prisma/client');
const { generateTicketPdf } = require('../services/ticketPdf');
const prisma = new PrismaClient();

async function handleBookTicket(req, res) {
    try {
        const { scheduleId, seatId, passengerName, age, gender } = req.body;
        const result = await bookTicket(req.user.id, scheduleId, seatId, passengerName, age, gender);
        res.status(201).json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

async function handleCancelTicket(req, res) {
    try {
        const ticketId = parseInt(req.params.ticketId);
        const result = await cancelTicket(ticketId);
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

async function handleDownloadTicket(req, res) {
    try {
        const ticketId = parseInt(req.params.ticketId);
        
        // Fetch detailed ticket info
        const ticket = await prisma.ticket.findUnique({
            where: { id: ticketId },
            include: {
                booking: {
                    include: {
                        schedule: {
                            include: { train: true }
                        }
                    }
                },
                seat: true
            }
        });

        if (!ticket) {
            return res.status(404).json({ error: "Ticket not found" });
        }

        // Verify the user owns the booking or is admin
        if (ticket.booking.userId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: "Unauthorized" });
        }

        // Prepare data for PDF
        const ticketData = {
            id: ticket.id,
            bookingId: ticket.bookingId,
            status: ticket.status,
            passengerName: ticket.passengerName,
            age: ticket.age,
            gender: ticket.gender,
            waitlistNumber: ticket.waitlistNumber,
            departureDate: ticket.booking.schedule.departureDate.toISOString().split('T')[0],
            trainName: ticket.booking.schedule.train.name,
            trainNumber: ticket.booking.schedule.train.number,
            seat: ticket.seat,
            // Additional booking details
            bookingStatus: ticket.booking.status,
            paymentStatus: ticket.booking.paymentStatus,
            totalFare: ticket.booking.totalFare,
            bookingDate: ticket.booking.createdAt.toISOString().split('T')[0]
        };

        // Set response headers to trigger inline viewing
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename=ticket-${ticket.id}.pdf`);

        // Generate PDF and save to filesystem while streaming to response
        const path = require('path');
        const filePath = path.join(__dirname, '../../tickets', `ticket-${ticket.id}.pdf`);
        
        await generateTicketPdf(ticketData, res, filePath);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = { handleBookTicket, handleCancelTicket, handleDownloadTicket };
