const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting Database Seeding...');

    // 1. Seed Stations
    const stationsData = [
        { id: 1, name: 'New Delhi', code: 'NDLS' },
        { id: 2, name: 'Mumbai Central', code: 'BCT' },
        { id: 3, name: 'KSR Bengaluru', code: 'SBC' },
        { id: 4, name: 'Chennai Central', code: 'MAS' },
        { id: 5, name: 'Howrah Junction', code: 'HWH' },
        { id: 6, name: 'Pune Junction', code: 'PUNE' },
        { id: 7, name: 'Ahmedabad Junction', code: 'ADI' },
        { id: 8, name: 'Hyderabad Deccan', code: 'HYB' },
        { id: 9, name: 'Agra Cantt', code: 'AGC' },
        { id: 10, name: 'Bhopal Junction', code: 'BPL' },
        { id: 11, name: 'Vadodara Junction', code: 'BRC' },
        { id: 12, name: 'Surat', code: 'ST' },
    ];

    for (const st of stationsData) {
        await prisma.station.upsert({
            where: { code: st.code },
            update: { name: st.name },
            create: st,
        });
    }
    console.log(`✅ Seeded ${stationsData.length} Stations`);

    // 2. Seed Trains
    const trainsData = [
        { id: 1, name: 'Rajdhani Express', number: '12431', totalSeats: 60 },
        { id: 2, name: 'Shatabdi Express', number: '12001', totalSeats: 60 },
        { id: 3, name: 'Duronto Express', number: '12245', totalSeats: 60 },
        { id: 4, name: 'Vande Bharat Express', number: '20608', totalSeats: 60 },
        { id: 5, name: 'Karnataka Express', number: '12627', totalSeats: 60 },
    ];

    for (const tr of trainsData) {
        await prisma.train.upsert({
            where: { number: tr.number },
            update: { name: tr.name, totalSeats: tr.totalSeats },
            create: tr,
        });
    }
    console.log(`✅ Seeded ${trainsData.length} Trains`);

    // 3. Seed Routes
    for (const tr of trainsData) {
        const existingRoute = await prisma.route.findFirst({
            where: { trainId: tr.id },
        });

        let routeId;
        if (!existingRoute) {
            const createdRoute = await prisma.route.create({
                data: { trainId: tr.id },
            });
            routeId = createdRoute.id;
        } else {
            routeId = existingRoute.id;
        }

        // Add RouteStations
        let routeStops = [];
        if (tr.id === 1) {
            // Rajdhani: NDLS -> AGC -> BPL -> BRC -> ST -> BCT
            routeStops = [
                { stationId: 1, stopOrder: 1, arrivalTime: '16:50', departureTime: '17:00', distance: 0 },
                { stationId: 9, stopOrder: 2, arrivalTime: '19:10', departureTime: '19:15', distance: 195 },
                { stationId: 10, stopOrder: 3, arrivalTime: '23:30', departureTime: '23:40', distance: 705 },
                { stationId: 11, stopOrder: 4, arrivalTime: '04:15', departureTime: '04:25', distance: 1090 },
                { stationId: 12, stopOrder: 5, arrivalTime: '06:00', departureTime: '06:05', distance: 1220 },
                { stationId: 2, stopOrder: 6, arrivalTime: '08:30', departureTime: '08:35', distance: 1400 },
            ];
        } else if (tr.id === 2) {
            // Shatabdi: NDLS -> AGC -> BPL
            routeStops = [
                { stationId: 1, stopOrder: 1, arrivalTime: '05:50', departureTime: '06:00', distance: 0 },
                { stationId: 9, stopOrder: 2, arrivalTime: '07:50', departureTime: '07:55', distance: 195 },
                { stationId: 10, stopOrder: 3, arrivalTime: '11:45', departureTime: '11:50', distance: 705 },
            ];
        } else if (tr.id === 3) {
            // Duronto: HWH -> BPL -> PUNE
            routeStops = [
                { stationId: 5, stopOrder: 1, arrivalTime: '19:45', departureTime: '20:00', distance: 0 },
                { stationId: 10, stopOrder: 2, arrivalTime: '06:15', departureTime: '06:25', distance: 1100 },
                { stationId: 6, stopOrder: 3, arrivalTime: '12:00', departureTime: '12:15', distance: 1650 },
            ];
        } else if (tr.id === 4) {
            // Vande Bharat: SBC -> MAS
            routeStops = [
                { stationId: 3, stopOrder: 1, arrivalTime: '05:45', departureTime: '06:00', distance: 0 },
                { stationId: 4, stopOrder: 2, arrivalTime: '10:25', departureTime: '10:30', distance: 360 },
            ];
        } else if (tr.id === 5) {
            // Karnataka Express: SBC -> HYB -> BPL -> AGC -> NDLS
            routeStops = [
                { stationId: 3, stopOrder: 1, arrivalTime: '19:00', departureTime: '19:20', distance: 0 },
                { stationId: 8, stopOrder: 2, arrivalTime: '05:30', departureTime: '05:45', distance: 620 },
                { stationId: 10, stopOrder: 3, arrivalTime: '15:10', departureTime: '15:20', distance: 1450 },
                { stationId: 9, stopOrder: 4, arrivalTime: '21:15', departureTime: '21:20', distance: 2150 },
                { stationId: 1, stopOrder: 5, arrivalTime: '06:00', departureTime: '06:15', distance: 2400 },
            ];
        }

        for (const stop of routeStops) {
            await prisma.routeStation.upsert({
                where: {
                    routeId_stationId: {
                        routeId: routeId,
                        stationId: stop.stationId,
                    },
                },
                update: stop,
                create: {
                    routeId: routeId,
                    ...stop,
                },
            });
        }
    }
    console.log(`✅ Seeded Routes & RouteStations`);

    // 4. Seed Seats for Train 1 (60 Seats in S1 Coach)
    const train1Seats = [];
    for (let i = 1; i <= 60; i++) {
        train1Seats.push({
            trainId: 1,
            seatNumber: `S1-${i}`,
            coach: 'S1',
            class: 'SLEEPER',
        });
    }

    for (const seat of train1Seats) {
        await prisma.seat.upsert({
            where: {
                trainId_seatNumber_coach: {
                    trainId: seat.trainId,
                    seatNumber: seat.seatNumber,
                    coach: seat.coach,
                },
            },
            update: {},
            create: seat,
        });
    }
    console.log(`✅ Seeded ${train1Seats.length} Seats for Rajdhani Express (Coach S1)`);

    // 5. Seed Schedules
    const sampleDates = [
        new Date('2026-06-15'),
        new Date('2026-09-10'),
        new Date('2026-09-15'),
        new Date('2026-09-20'),
        new Date('2026-10-01'),
    ];

    for (const tr of trainsData) {
        for (const d of sampleDates) {
            await prisma.schedule.upsert({
                where: {
                    trainId_departureDate: {
                        trainId: tr.id,
                        departureDate: d,
                    },
                },
                update: {},
                create: {
                    trainId: tr.id,
                    departureDate: d,
                },
            });
        }
    }
    console.log(`✅ Seeded Schedules across multiple dates`);

    // 6. Seed Users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Password@123', salt);
    const adminHashedPassword = await bcrypt.hash('Admin@123', salt);

    const usersData = [
        { name: 'Admin Administrator', email: 'admin@railway.com', password: adminHashedPassword, role: 'ADMIN' },
        { name: 'Shreyas K S', email: 'shreyas@example.com', password: hashedPassword, role: 'USER' },
        { name: 'Alice Smith', email: 'alice@example.com', password: hashedPassword, role: 'USER' },
        { name: 'Bob Jones', email: 'bob@example.com', password: hashedPassword, role: 'USER' },
    ];

    for (const u of usersData) {
        await prisma.user.upsert({
            where: { email: u.email },
            update: { name: u.name, role: u.role },
            create: u,
        });
    }
    console.log(`✅ Seeded Users (Admin & Passenger accounts)`);

    // 7. Seed Sample Bookings & Tickets for Demo
    const demoUser = await prisma.user.findUnique({ where: { email: 'shreyas@example.com' } });
    const demoSchedule = await prisma.schedule.findFirst({
        where: { trainId: 1, departureDate: new Date('2026-06-15') },
    });
    const seat1 = await prisma.seat.findFirst({
        where: { trainId: 1, seatNumber: 'S1-1' },
    });

    if (demoUser && demoSchedule && seat1) {
        const existingBooking = await prisma.booking.findFirst({
            where: { userId: demoUser.id, scheduleId: demoSchedule.id },
        });

        if (!existingBooking) {
            const booking = await prisma.booking.create({
                data: {
                    userId: demoUser.id,
                    scheduleId: demoSchedule.id,
                    status: 'CONFIRMED',
                    totalFare: 1500.00,
                    paymentStatus: 'COMPLETED',
                    tickets: {
                        create: {
                            seatId: seat1.id,
                            passengerName: 'Shreyas K S',
                            age: 25,
                            gender: 'Male',
                            status: 'CONFIRMED',
                        },
                    },
                },
            });
            console.log(`✅ Created Demo Confirmed Booking (ID: ${booking.id})`);
        }
    }

    console.log('🎉 Database Seeding Completed Successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
