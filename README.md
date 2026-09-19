# 🚆 Railway Reservation System

A full-stack, enterprise-grade Railway Reservation System built with Node.js, Express, PostgreSQL, Prisma ORM, and a responsive frontend interface.

---

## 🌟 Key Features

- 🔍 **Train & Route Search**: Search trains between stations with real-time route calculations, intermediate stops, and distances.
- 💺 **Interactive Coach & Seat Map**: Real-time visual seat allocation and availability for Sleeper, 3-Tier AC, 2-Tier AC, and 1st Class AC coaches.
- 🎟️ **Booking & Ticket Management**: Instant confirmation, RAC (Reservation Against Cancellation), waitlisting (WL), and automated cancellation/refund processing.
- 🔒 **Authentication & Authorization**: Secure JWT-based authentication with Role-Based Access Control (Admin & Passenger).
- 📄 **E-Ticket Generation**: Downloadable ticket summaries with QR/PNR verification.
- ⚡ **Concurrency-Safe Seat Locking**: ACID-compliant transactions preventing double-booking during high-volume reservation spikes.

---

## 🏗️ Architecture & Tech Stack

- **Frontend**: HTML5, Vanilla JavaScript, Responsive CSS / Glassmorphism UI
- **Backend**: Node.js, Express.js REST API
- **Database**: PostgreSQL
- **ORM & Migrations**: Prisma ORM
- **Authentication**: JSON Web Tokens (JWT) & bcrypt.js password hashing
- **Testing**: Concurrency stress testing with Node.js test suites

---

## 📂 Project Structure

```text
DBMS/
├── client/                     # Frontend Web Application
│   ├── index.html              # Main interactive reservation dashboard
│   └── src/
│       └── components/         # Modular frontend components (SeatMap, etc.)
├── server/                     # Backend API & Database Layer
│   ├── migrations/             # SQL Migrations & triggers
│   ├── prisma/
│   │   ├── schema.prisma       # Prisma data model
│   │   └── seed.js             # Automated database seeder
│   ├── src/
│   │   ├── controllers/        # Request handlers (auth, booking, trains)
│   │   ├── middleware/         # Auth & validation middlewares
│   │   ├── routes/             # RESTful API routes
│   │   ├── utils/              # Helper utilities & fare calculators
│   │   └── index.js            # Express server entry point
│   ├── tests/                  # Concurrency & load testing scripts
│   ├── package.json            # Server dependencies & scripts
│   └── .env.example            # Environment variables template
├── init_db.sql                 # Pure SQL schema definition
├── seed_data.sql               # Pure SQL seed dataset
├── DATABASE_SETUP.md           # In-depth database documentation & setup guide
├── .gitignore                  # Git ignore rules
└── README.md                   # Project overview & quickstart
```

---

## 🚀 Quick Start Guide

### 1. Clone the Repository
```bash
git clone https://github.com/ksshreyas51/Railway-Reservation-System.git
cd Railway-Reservation-System
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory (or copy from `.env.example`):
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/railway_db?schema=public"
PORT=5000
JWT_SECRET="railway_reservation_jwt_super_secret_key_2026"
```

Push database schema and seed initial data:
```bash
npm run db:push
npm run db:seed
```

Start the development server:
```bash
npm run dev
```
> The backend API will be available at: **http://localhost:5000**

### 3. Frontend Setup
Open `client/index.html` in any modern web browser or serve it using Live Server (e.g., VS Code extension) / static file server.
> If using Live Server, the frontend will typically be available at: **http://127.0.0.1:5500/client/index.html**

---

## 📚 Database Documentation

For detailed database architecture, ER diagrams, schemas, and queries, refer to [DATABASE_SETUP.md](DATABASE_SETUP.md).

---

## 👥 Default Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@railway.com` | `Admin@123` |
| **User** | `shreyas@example.com` | `Password@123` |
| **User** | `alice@example.com` | `Password@123` |
| **User** | `bob@example.com` | `Password@123` |

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
