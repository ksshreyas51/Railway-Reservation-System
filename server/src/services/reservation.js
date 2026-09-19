const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * PHASE 2: Route Mapping
 * Find all available trains between Station A and Station B.
 * This function uses a raw PostgreSQL query to join RouteStation and Route
 * ensuring that the departure station's stopOrder is less than the arrival station's stopOrder.
 */
async function findTrainsBetweenStations(originStationCode, destinationStationCode, departureDate) {
    // We use Prisma's $queryRaw to perform complex joins
    const query = `
        SELECT 
            t.id AS "trainId",
            t.name AS "trainName",
            t.number AS "trainNumber",
            rs_origin."departureTime" AS "departureTime",
            rs_dest."arrivalTime" AS "arrivalTime",
            (rs_dest.distance - rs_origin.distance) AS "distanceKm",
            s.id AS "scheduleId"
        FROM "Train" t
        JOIN "Route" r ON t.id = r."trainId"
        JOIN "RouteStation" rs_origin ON r.id = rs_origin."routeId"
        JOIN "Station" st_origin ON rs_origin."stationId" = st_origin.id
        JOIN "RouteStation" rs_dest ON r.id = rs_dest."routeId"
        JOIN "Station" st_dest ON rs_dest."stationId" = st_dest.id
        JOIN "Schedule" s ON t.id = s."trainId"
        WHERE 
            st_origin.code = $1 
            AND st_dest.code = $2
            AND rs_origin."stopOrder" < rs_dest."stopOrder"
            AND s."departureDate" = $3::DATE;
    `;

    return await prisma.$queryRawUnsafe(query, originStationCode, destinationStationCode, departureDate);
}

/**
 * PHASE 2: Transactional Booking (Concurrency Control)
 * Books a ticket and handles Concurrency (preventing double-booking).
 * If the selected seat is already booked or the status changes mid-transaction,
 * the transaction rolls back.
 */
async function bookTicket(userId, scheduleId, seatId, passengerName, age, gender) {
    return await prisma.$transaction(async (tx) => {
        // 1. Lock the seat for this schedule to prevent double-booking
        // We use raw SQL for row-level locking (SELECT ... FOR UPDATE)
        const lockedSeat = await tx.$queryRaw`
            SELECT id, class 
            FROM "Seat" 
            WHERE id = ${seatId} 
            FOR UPDATE;
        `;

        if (!lockedSeat || lockedSeat.length === 0) {
            throw new Error("Seat not found");
        }

        // 2. Check if the seat is already booked for this schedule in a Confirmed state
        const existingTicket = await tx.ticket.findFirst({
            where: {
                seatId: seatId,
                booking: { scheduleId: scheduleId },
                status: 'CONFIRMED'
            }
        });

        if (existingTicket) {
            throw new Error("Seat No Longer Available"); // Concurrency collision caught
        }

        // 3. Create the Booking record (deduct fare logic could go here)
        const totalFare = 1500.00; // Hardcoded for demo
        const booking = await tx.booking.create({
            data: {
                userId,
                scheduleId,
                status: 'CONFIRMED',
                paymentStatus: 'COMPLETED',
                totalFare
            }
        });

        // 4. Create the Ticket record
        const ticket = await tx.ticket.create({
            data: {
                bookingId: booking.id,
                seatId: seatId,
                passengerName,
                age,
                gender,
                status: 'CONFIRMED'
            }
        });

        return { booking, ticket };
    });
}

/**
 * PHASE 2: Cancellation Logic
 * Cancels a confirmed ticket and automatically upgrades the highest priority RAC/WL passenger.
 */
async function cancelTicket(ticketId) {
    return await prisma.$transaction(async (tx) => {
        // 1. Find the ticket to cancel
        const ticketToCancel = await tx.ticket.findUnique({
            where: { id: ticketId },
            include: { booking: true }
        });

        if (!ticketToCancel || ticketToCancel.status !== 'CONFIRMED') {
            throw new Error("Ticket is not Confirmed or does not exist");
        }

        // 2. Cancel the ticket
        await tx.ticket.update({
            where: { id: ticketId },
            data: { status: 'CANCELLED' }
        });

        // 3. Find highest priority RAC ticket for this schedule
        const topRAC = await tx.ticket.findFirst({
            where: {
                booking: { scheduleId: ticketToCancel.booking.scheduleId },
                status: 'RAC'
            },
            orderBy: { waitlistNumber: 'asc' }
        });

        if (topRAC) {
            // Upgrade RAC to CONFIRMED
            await tx.ticket.update({
                where: { id: topRAC.id },
                data: {
                    status: 'CONFIRMED',
                    seatId: ticketToCancel.seatId, // Give them the newly freed seat
                    waitlistNumber: null
                }
            });

            // Find highest priority WL and upgrade to RAC
            const topWL = await tx.ticket.findFirst({
                where: {
                    booking: { scheduleId: ticketToCancel.booking.scheduleId },
                    status: 'WL'
                },
                orderBy: { waitlistNumber: 'asc' }
            });

            if (topWL) {
                await tx.ticket.update({
                    where: { id: topWL.id },
                    data: {
                        status: 'RAC',
                        // waitlistNumber could be re-calculated or kept as is
                    }
                });
            }
        }

        return { success: true, message: "Ticket cancelled and seat reallocated if applicable" };
    });
}

module.exports = {
    findTrainsBetweenStations,
    bookTicket,
    cancelTicket
};
