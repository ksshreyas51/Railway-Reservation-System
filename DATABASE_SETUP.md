# 🚆 Railway Reservation System - Database Documentation & Setup Guide

This document provides complete instructions on how to create, configure, initialize, and seed the relational database for the **Railway Reservation System**.

---

## 📑 Table of Contents
1. [Database Architecture & ER Overview](#1-database-architecture--er-overview)
2. [Database Schema Definition](#2-database-schema-definition)
3. [Setup & Initialization Methods](#3-setup--initialization-methods)
   - [Method 1: Direct SQL Execution (`psql` / pgAdmin / DBeaver)](#method-1-direct-sql-execution)
   - [Method 2: Prisma ORM CLI (Node.js)](#method-2-prisma-orm-cli)
   - [Method 3: Quick Docker Setup](#method-3-quick-docker-setup)
4. [Sample Seed Data & Test Accounts](#4-sample-seed-data--test-accounts)
5. [Useful Database Queries & Verifications](#5-useful-database-queries--verifications)

---

## 1. Database Architecture & ER Overview

The database is built on **PostgreSQL** and modeled with relational integrity (Foreign Keys, Cascade Rules, Unique Constraints, and Custom ENUMs).

```mermaid
erDiagram
    User ||--o{ Booking : places
    Train ||--o{ Route : has
    Train ||--o{ Schedule : runs_on
    Train ||--o{ Seat : contains
    Route ||--|{ RouteStation : includes
    Station ||--|{ RouteStation : located_at
    Schedule ||--o{ Booking : reserves
    Booking ||--|{ Ticket : issues
    Seat ||--o{ Ticket : assigned_to

    User {
        int id PK
        string name
        string email UK
        string password
        Role role
        datetime createdAt
    }

    Train {
        int id PK
        string name
        string number UK
        int totalSeats
    }

    Station {
        int id PK
        string name
        string code UK
    }

    RouteStation {
        int id PK
        int routeId FK
        int stationId FK
        int stopOrder
        string arrivalTime
        string departureTime
        int distance
    }

    Schedule {
        int id PK
        int trainId FK
        date departureDate
    }

    Seat {
        int id PK
        int trainId FK
        string seatNumber
        string coach
        SeatClass class
    }

    Booking {
        int id PK
        int userId FK
        int scheduleId FK
        BookingStatus status
        decimal totalFare
        PaymentStatus paymentStatus
    }

    Ticket {
        int id PK
        int bookingId FK
        int seatId FK
        string passengerName
        int age
        string gender
        TicketStatus status
        int waitlistNumber
    }
```

---

## 2. Database Schema Definition

### Enumerated Types (ENUMs)
- **`Role`**: `'USER'`, `'ADMIN'`
- **`TicketStatus`**: `'CONFIRMED'`, `'RAC'`, `'WL'`, `'CANCELLED'`
- **`BookingStatus`**: `'PENDING'`, `'CONFIRMED'`, `'CANCELLED'`
- **`PaymentStatus`**: `'PENDING'`, `'COMPLETED'`, `'FAILED'`
- **`SeatClass`**: `'SLEEPER'`, `'AC_3TIER'`, `'AC_2TIER'`, `'AC_1TIER'`

### Tables & Key Attributes

| Table Name | Description | Key Constraints |
| :--- | :--- | :--- |
| **`User`** | System users (passengers and administrators) | `email` (UNIQUE) |
| **`Train`** | Registered trains in the system | `number` (UNIQUE) |
| **`Station`** | Railway stations with Indian Railway station codes | `code` (UNIQUE) |
| **`Route`** | Links a train to its series of stops | `trainId` (FK) |
| **`RouteStation`**| Specific stop details (arrival, departure, distance, stop order) | UNIQUE(`routeId`, `stationId`), UNIQUE(`routeId`, `stopOrder`) |
| **`Schedule`** | Train departures mapped to specific dates | UNIQUE(`trainId`, `departureDate`) |
| **`Seat`** | Individual seat inventory per coach | UNIQUE(`trainId`, `seatNumber`, `coach`) |
| **`Booking`** | Reservation orders placed by users | `userId` (FK), `scheduleId` (FK) |
| **`Ticket`** | Individual passenger tickets within a booking | `bookingId` (FK), `seatId` (FK) |

---

## 3. Setup & Initialization Methods

### Method 1: Direct SQL Execution

If you have PostgreSQL installed or accessible through **pgAdmin**, **DBeaver**, or the **`psql`** command line:

1. **Create the Database**:
   ```sql
   CREATE DATABASE railway_db;
   ```
2. **Execute Schema**:
   Connect to `railway_db` and run [init_db.sql](file:///c:/Users/SHREYAS%20K%20S/OneDrive/Desktop/DBMS/init_db.sql):
   ```bash
   psql -U postgres -d railway_db -f init_db.sql
   ```
3. **Execute Seed Data**:
   Populate all trains, routes, stations, seats, schedules, and demo users by running [seed_data.sql](file:///c:/Users/SHREYAS%20K%20S/OneDrive/Desktop/DBMS/seed_data.sql):
   ```bash
   psql -U postgres -d railway_db -f seed_data.sql
   ```

---

### Method 2: Prisma ORM CLI (Node.js)

When Node.js is configured on your system:

1. **Configure Environment Variables**:
   In `server/.env`, verify your connection string:
   ```env
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/railway_db?schema=public"
   PORT=5000
   JWT_SECRET="railway_reservation_jwt_super_secret_key_2026"
   ```

2. **Push Schema and Generate Prisma Client**:
   ```bash
   cd server
   npm install
   npm run db:push
   ```

3. **Run the Automated Seeder**:
   ```bash
   npm run db:seed
   ```

4. **Launch Prisma Visual Studio (GUI Database Viewer)**:
   ```bash
   npm run db:studio
   ```
   *Opens an interactive browser-based database management GUI at `http://localhost:5555`.*

---

### Method 3: Quick Docker Setup

If you prefer running a zero-install PostgreSQL container in Docker:

```bash
docker run --name railway-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=railway_db \
  -p 5432:5432 \
  -d postgres:15
```

Once running, run `npm run db:push && npm run db:seed` in the `server` directory.

---

## 4. Sample Seed Data & Test Accounts

### Default User Accounts

| Account | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@railway.com` | `Admin@123` | `ADMIN` |
| **Passenger 1** | `shreyas@example.com` | `Password@123` | `USER` |
| **Passenger 2** | `alice@example.com` | `Password@123` | `USER` |
| **Passenger 3** | `bob@example.com` | `Password@123` | `USER` |

### Seeded Trains & Routes

1. **Rajdhani Express (`12431`)**: New Delhi (`NDLS`) $\rightarrow$ Agra (`AGC`) $\rightarrow$ Bhopal (`BPL`) $\rightarrow$ Vadodara (`BRC`) $\rightarrow$ Surat (`ST`) $\rightarrow$ Mumbai Central (`BCT`)
2. **Shatabdi Express (`12001`)**: New Delhi (`NDLS`) $\rightarrow$ Agra (`AGC`) $\rightarrow$ Bhopal (`BPL`)
3. **Duronto Express (`12245`)**: Howrah (`HWH`) $\rightarrow$ Bhopal (`BPL`) $\rightarrow$ Pune (`PUNE`)
4. **Vande Bharat Express (`20608`)**: KSR Bengaluru (`SBC`) $\rightarrow$ Chennai Central (`MAS`)
5. **Karnataka Express (`12627`)**: KSR Bengaluru (`SBC`) $\rightarrow$ Hyderabad (`HYB`) $\rightarrow$ Bhopal (`BPL`) $\rightarrow$ Agra (`AGC`) $\rightarrow$ New Delhi (`NDLS`)

---

## 5. Useful Database Queries & Verifications

### 1. Search Trains Between Two Stations (with Route Order check)
```sql
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
    st_origin.code = 'NDLS' 
    AND st_dest.code = 'BCT'
    AND rs_origin."stopOrder" < rs_dest."stopOrder"
    AND s."departureDate" = '2026-06-15'::DATE;
```

### 2. Check Available Seats for a Schedule
```sql
SELECT s.id, s."seatNumber", s.coach, s.class
FROM "Seat" s
WHERE s."trainId" = 1
AND s.id NOT IN (
    SELECT tk."seatId" 
    FROM "Ticket" tk
    JOIN "Booking" b ON tk."bookingId" = b.id
    WHERE b."scheduleId" = 101 
    AND tk.status = 'CONFIRMED'
    AND tk."seatId" IS NOT NULL
)
ORDER BY s.id ASC;
```

### 3. List All Bookings with Passenger & Train Details
```sql
SELECT 
    b.id AS "bookingId",
    u.name AS "userName",
    t.name AS "trainName",
    t.number AS "trainNumber",
    tk."passengerName",
    st."seatNumber",
    st.coach,
    tk.status AS "ticketStatus",
    b."totalFare",
    b."paymentStatus"
FROM "Booking" b
JOIN "User" u ON b."userId" = u.id
JOIN "Schedule" sc ON b."scheduleId" = sc.id
JOIN "Train" t ON sc."trainId" = t.id
JOIN "Ticket" tk ON b.id = tk."bookingId"
LEFT JOIN "Seat" st ON tk."seatId" = st.id;
```
