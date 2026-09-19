-- ==============================================================================
-- Railway Reservation System - Database Initialization Script (PostgreSQL)
-- ==============================================================================

-- Create Database (Run this separately if connected to default 'postgres' database):
-- CREATE DATABASE railway_db;
-- \c railway_db;

BEGIN;

-- 1. Drop existing tables if re-initializing (Order respects foreign key dependencies)
DROP TABLE IF EXISTS "Ticket" CASCADE;
DROP TABLE IF EXISTS "Booking" CASCADE;
DROP TABLE IF EXISTS "Seat" CASCADE;
DROP TABLE IF EXISTS "Schedule" CASCADE;
DROP TABLE IF EXISTS "RouteStation" CASCADE;
DROP TABLE IF EXISTS "Route" CASCADE;
DROP TABLE IF EXISTS "Station" CASCADE;
DROP TABLE IF EXISTS "Train" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- Drop Enums if they exist
DROP TYPE IF EXISTS "SeatClass" CASCADE;
DROP TYPE IF EXISTS "PaymentStatus" CASCADE;
DROP TYPE IF EXISTS "BookingStatus" CASCADE;
DROP TYPE IF EXISTS "TicketStatus" CASCADE;
DROP TYPE IF EXISTS "Role" CASCADE;

-- 2. Create Enums
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "TicketStatus" AS ENUM ('CONFIRMED', 'RAC', 'WL', 'CANCELLED');
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');
CREATE TYPE "SeatClass" AS ENUM ('SLEEPER', 'AC_3TIER', 'AC_2TIER', 'AC_1TIER');

-- 3. Create Tables

-- Table: User
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Table: Train
CREATE TABLE "Train" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "totalSeats" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Train_pkey" PRIMARY KEY ("id")
);

-- Table: Station
CREATE TABLE "Station" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Station_pkey" PRIMARY KEY ("id")
);

-- Table: Route
CREATE TABLE "Route" (
    "id" SERIAL NOT NULL,
    "trainId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);

-- Table: RouteStation
CREATE TABLE "RouteStation" (
    "id" SERIAL NOT NULL,
    "routeId" INTEGER NOT NULL,
    "stationId" INTEGER NOT NULL,
    "stopOrder" INTEGER NOT NULL,
    "arrivalTime" TEXT NOT NULL,
    "departureTime" TEXT NOT NULL,
    "distance" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RouteStation_pkey" PRIMARY KEY ("id")
);

-- Table: Schedule
CREATE TABLE "Schedule" (
    "id" SERIAL NOT NULL,
    "trainId" INTEGER NOT NULL,
    "departureDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);

-- Table: Seat
CREATE TABLE "Seat" (
    "id" SERIAL NOT NULL,
    "trainId" INTEGER NOT NULL,
    "seatNumber" TEXT NOT NULL,
    "coach" TEXT NOT NULL,
    "class" "SeatClass" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Seat_pkey" PRIMARY KEY ("id")
);

-- Table: Booking
CREATE TABLE "Booking" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "scheduleId" INTEGER NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "totalFare" DECIMAL(10,2) NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- Table: Ticket
CREATE TABLE "Ticket" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "seatId" INTEGER,
    "passengerName" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL,
    "waitlistNumber" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- 4. Create Unique Constraints & Indexes
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Train_number_key" ON "Train"("number");
CREATE UNIQUE INDEX "Station_code_key" ON "Station"("code");
CREATE UNIQUE INDEX "RouteStation_routeId_stationId_key" ON "RouteStation"("routeId", "stationId");
CREATE UNIQUE INDEX "RouteStation_routeId_stopOrder_key" ON "RouteStation"("routeId", "stopOrder");
CREATE UNIQUE INDEX "Schedule_trainId_departureDate_key" ON "Schedule"("trainId", "departureDate");
CREATE UNIQUE INDEX "Seat_trainId_seatNumber_coach_key" ON "Seat"("trainId", "seatNumber", "coach");

-- Index for searching route stations quickly
CREATE INDEX "RouteStation_stationId_idx" ON "RouteStation"("stationId");
CREATE INDEX "Schedule_departureDate_idx" ON "Schedule"("departureDate");
CREATE INDEX "Booking_userId_idx" ON "Booking"("userId");
CREATE INDEX "Booking_scheduleId_idx" ON "Booking"("scheduleId");
CREATE INDEX "Ticket_bookingId_idx" ON "Ticket"("bookingId");
CREATE INDEX "Ticket_seatId_idx" ON "Ticket"("seatId");

-- 5. Foreign Key Constraints
ALTER TABLE "Route" 
    ADD CONSTRAINT "Route_trainId_fkey" 
    FOREIGN KEY ("trainId") REFERENCES "Train"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "RouteStation" 
    ADD CONSTRAINT "RouteStation_routeId_fkey" 
    FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RouteStation" 
    ADD CONSTRAINT "RouteStation_stationId_fkey" 
    FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Schedule" 
    ADD CONSTRAINT "Schedule_trainId_fkey" 
    FOREIGN KEY ("trainId") REFERENCES "Train"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Seat" 
    ADD CONSTRAINT "Seat_trainId_fkey" 
    FOREIGN KEY ("trainId") REFERENCES "Train"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Booking" 
    ADD CONSTRAINT "Booking_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Booking" 
    ADD CONSTRAINT "Booking_scheduleId_fkey" 
    FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Ticket" 
    ADD CONSTRAINT "Ticket_bookingId_fkey" 
    FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Ticket" 
    ADD CONSTRAINT "Ticket_seatId_fkey" 
    FOREIGN KEY ("seatId") REFERENCES "Seat"("id") ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT;
