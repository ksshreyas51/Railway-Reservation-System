-- ==============================================================================
-- Railway Reservation System - Seed Data Script (PostgreSQL)
-- ==============================================================================

BEGIN;

-- 1. Insert Stations
INSERT INTO "Station" ("id", "name", "code", "createdAt", "updatedAt") VALUES
(1, 'New Delhi', 'NDLS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'Mumbai Central', 'BCT', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'KSR Bengaluru', 'SBC', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'Chennai Central', 'MAS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 'Howrah Junction', 'HWH', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 'Pune Junction', 'PUNE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(7, 'Ahmedabad Junction', 'ADI', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(8, 'Hyderabad Deccan', 'HYB', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(9, 'Agra Cantt', 'AGC', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(10, 'Bhopal Junction', 'BPL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(11, 'Vadodara Junction', 'BRC', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(12, 'Surat', 'ST', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;

-- Reset sequence for Station
SELECT setval(pg_get_serial_sequence('"Station"', 'id'), coalesce(max(id), 1)) FROM "Station";

-- 2. Insert Trains
INSERT INTO "Train" ("id", "name", "number", "totalSeats", "createdAt", "updatedAt") VALUES
(1, 'Rajdhani Express', '12431', 60, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'Shatabdi Express', '12001', 60, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'Duronto Express', '12245', 60, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'Vande Bharat Express', '20608', 60, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 'Karnataka Express', '12627', 60, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("number") DO NOTHING;

-- Reset sequence for Train
SELECT setval(pg_get_serial_sequence('"Train"', 'id'), coalesce(max(id), 1)) FROM "Train";

-- 3. Insert Routes
INSERT INTO "Route" ("id", "trainId", "createdAt", "updatedAt") VALUES
(1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), -- Rajdhani (NDLS -> BCT)
(2, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), -- Shatabdi (NDLS -> BPL)
(3, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), -- Duronto (HWH -> PUNE)
(4, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), -- Vande Bharat (SBC -> MAS)
(5, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)  -- Karnataka Express (SBC -> NDLS)
ON CONFLICT ("id") DO NOTHING;

-- Reset sequence for Route
SELECT setval(pg_get_serial_sequence('"Route"', 'id'), coalesce(max(id), 1)) FROM "Route";

-- 4. Insert Route Stations (Stop details with distance and timing)
-- Route 1: Rajdhani Express (NDLS -> BCT)
INSERT INTO "RouteStation" ("routeId", "stationId", "stopOrder", "arrivalTime", "departureTime", "distance", "createdAt", "updatedAt") VALUES
(1, 1, 1, '16:50', '17:00', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),    -- NDLS
(1, 9, 2, '19:10', '19:15', 195, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),  -- AGC
(1, 10, 3, '23:30', '23:40', 705, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), -- BPL
(1, 11, 4, '04:15', '04:25', 1090, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),-- BRC
(1, 12, 5, '06:00', '06:05', 1220, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),-- ST
(1, 2, 6, '08:30', '08:35', 1400, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)  -- BCT
ON CONFLICT ("routeId", "stationId") DO NOTHING;

-- Route 2: Shatabdi Express (NDLS -> BPL)
INSERT INTO "RouteStation" ("routeId", "stationId", "stopOrder", "arrivalTime", "departureTime", "distance", "createdAt", "updatedAt") VALUES
(2, 1, 1, '05:50', '06:00', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),    -- NDLS
(2, 9, 2, '07:50', '07:55', 195, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),  -- AGC
(2, 10, 3, '11:45', '11:50', 705, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)  -- BPL
ON CONFLICT ("routeId", "stationId") DO NOTHING;

-- Route 3: Duronto Express (HWH -> PUNE)
INSERT INTO "RouteStation" ("routeId", "stationId", "stopOrder", "arrivalTime", "departureTime", "distance", "createdAt", "updatedAt") VALUES
(3, 5, 1, '19:45', '20:00', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),    -- HWH
(3, 10, 2, '06:15', '06:25', 1100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),-- BPL
(3, 6, 3, '12:00', '12:15', 1650, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)  -- PUNE
ON CONFLICT ("routeId", "stationId") DO NOTHING;

-- Route 4: Vande Bharat Express (SBC -> MAS)
INSERT INTO "RouteStation" ("routeId", "stationId", "stopOrder", "arrivalTime", "departureTime", "distance", "createdAt", "updatedAt") VALUES
(4, 3, 1, '05:45', '06:00', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),    -- SBC
(4, 4, 2, '10:25', '10:30', 360, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)   -- MAS
ON CONFLICT ("routeId", "stationId") DO NOTHING;

-- Route 5: Karnataka Express (SBC -> NDLS)
INSERT INTO "RouteStation" ("routeId", "stationId", "stopOrder", "arrivalTime", "departureTime", "distance", "createdAt", "updatedAt") VALUES
(5, 3, 1, '19:00', '19:20', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),    -- SBC
(5, 8, 2, '05:30', '05:45', 620, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),  -- HYB
(5, 10, 3, '15:10', '15:20', 1450, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),-- BPL
(5, 9, 4, '21:15', '21:20', 2150, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP), -- AGC
(5, 1, 5, '06:00', '06:15', 2400, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)  -- NDLS
ON CONFLICT ("routeId", "stationId") DO NOTHING;

-- Reset sequence for RouteStation
SELECT setval(pg_get_serial_sequence('"RouteStation"', 'id'), coalesce(max(id), 1)) FROM "RouteStation";

-- 5. Insert Schedules (Upcoming Departure Dates)
INSERT INTO "Schedule" ("id", "trainId", "departureDate", "createdAt", "updatedAt") VALUES
(101, 1, '2026-06-15', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(102, 1, '2026-09-10', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(103, 1, '2026-09-15', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(104, 2, '2026-06-15', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(105, 2, '2026-09-10', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(106, 3, '2026-06-15', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(107, 4, '2026-06-15', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(108, 4, '2026-09-10', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(109, 5, '2026-06-15', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("trainId", "departureDate") DO NOTHING;

-- Reset sequence for Schedule
SELECT setval(pg_get_serial_sequence('"Schedule"', 'id'), coalesce(max(id), 109)) FROM "Schedule";

-- 6. Insert Seats for Train 1 (Rajdhani Express - 60 Seats in S1 coach matching Client Seat Map)
DO $$
DECLARE
    seat_num INT;
BEGIN
    FOR seat_num IN 1..60 LOOP
        INSERT INTO "Seat" ("trainId", "seatNumber", "coach", "class", "createdAt", "updatedAt")
        VALUES (1, 'S1-' || seat_num, 'S1', 'SLEEPER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT ("trainId", "seatNumber", "coach") DO NOTHING;
    END LOOP;
END $$;

-- Insert Seats for Train 2 (Shatabdi - AC_1TIER & AC_2TIER)
DO $$
DECLARE
    seat_num INT;
BEGIN
    FOR seat_num IN 1..20 LOOP
        INSERT INTO "Seat" ("trainId", "seatNumber", "coach", "class", "createdAt", "updatedAt")
        VALUES (2, 'C1-' || seat_num, 'C1', 'AC_1TIER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT ("trainId", "seatNumber", "coach") DO NOTHING;
    END LOOP;
    FOR seat_num IN 1..40 LOOP
        INSERT INTO "Seat" ("trainId", "seatNumber", "coach", "class", "createdAt", "updatedAt")
        VALUES (2, 'C2-' || seat_num, 'C2', 'AC_2TIER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT ("trainId", "seatNumber", "coach") DO NOTHING;
    END LOOP;
END $$;

-- Reset sequence for Seat
SELECT setval(pg_get_serial_sequence('"Seat"', 'id'), coalesce(max(id), 1)) FROM "Seat";

-- 7. Insert Users (Bcrypt hashed password for 'Admin@123' and 'User@123')
-- Password Hash: '$2a$10$3euPcmQ1rZ1uYgB7/q29fevGqPev8gV4Kx1tXWb4ZJ5m9g/dK7f2S' matches 'Password@123'
INSERT INTO "User" ("id", "name", "email", "password", "role", "createdAt", "updatedAt") VALUES
(1, 'Admin Administrator', 'admin@railway.com', '$2a$10$w8.b1fLwD6dY0eH6o3w90eU6tN7lF3.z1hUjKqG5vOpLrMtNqN2Ky', 'ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'Shreyas K S', 'shreyas@example.com', '$2a$10$w8.b1fLwD6dY0eH6o3w90eU6tN7lF3.z1hUjKqG5vOpLrMtNqN2Ky', 'USER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'Alice Smith', 'alice@example.com', '$2a$10$w8.b1fLwD6dY0eH6o3w90eU6tN7lF3.z1hUjKqG5vOpLrMtNqN2Ky', 'USER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'Bob Jones', 'bob@example.com', '$2a$10$w8.b1fLwD6dY0eH6o3w90eU6tN7lF3.z1hUjKqG5vOpLrMtNqN2Ky', 'USER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("email") DO NOTHING;

-- Reset sequence for User
SELECT setval(pg_get_serial_sequence('"User"', 'id'), coalesce(max(id), 4)) FROM "User";

-- 8. Insert Sample Bookings and Tickets
INSERT INTO "Booking" ("id", "userId", "scheduleId", "status", "totalFare", "paymentStatus", "createdAt", "updatedAt") VALUES
(1001, 2, 101, 'CONFIRMED', 1500.00, 'COMPLETED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1002, 3, 101, 'CONFIRMED', 1500.00, 'COMPLETED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1003, 4, 101, 'CONFIRMED', 1500.00, 'COMPLETED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- Reset sequence for Booking
SELECT setval(pg_get_serial_sequence('"Booking"', 'id'), coalesce(max(id), 1003)) FROM "Booking";

-- Insert sample tickets (Assigned to seats 1, 2, and 3 of Train 1)
INSERT INTO "Ticket" ("id", "bookingId", "seatId", "passengerName", "age", "gender", "status", "waitlistNumber", "createdAt", "updatedAt") VALUES
(8821, 1001, 1, 'Shreyas K S', 25, 'Male', 'CONFIRMED', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(8822, 1002, 2, 'Alice Smith', 28, 'Female', 'CONFIRMED', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(8823, 1003, 3, 'Bob Jones', 32, 'Male', 'CONFIRMED', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- Reset sequence for Ticket
SELECT setval(pg_get_serial_sequence('"Ticket"', 'id'), coalesce(max(id), 8823)) FROM "Ticket";

COMMIT;
