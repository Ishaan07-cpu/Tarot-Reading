# 🔮 Mystic Tarot — Tarot Reading Booking Platform

A complete full-stack tarot reading consultation booking platform with client and admin experiences, real-time updates, email notifications, and secure JWT authentication.

---

## ✨ Features

### Client
- Account signup with email OTP verification
- JWT-based login / logout
- Forgot password + OTP reset flow
- Browse available reading types
- Browse and book available slots (atomic double-booking prevention)
- Real-time booking status updates via Socket.IO
- Booking history and cancellation
- Profile management

### Admin
- Secure admin login
- Dashboard with live statistics
- Pending booking approval / rejection / cancellation / completion
- Slot calendar management (create, delete, manage availability)
- Reading type CRUD (name, description, price in ₹, duration)
- Client management
- Real-time new-booking notifications
- Full audit trail

---

## 🛠 Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| State / Routing | React Router v6, React Context API |
| HTTP Client | Axios |
| Realtime | Socket.IO client |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB + Mongoose |
| Auth | JWT (HTTP-only cookies + Bearer token) |
| Email | Nodemailer (Gmail SMTP / App Password) |
| Realtime Server | Socket.IO |
| Security | Helmet, express-rate-limit, bcrypt, Zod validation |
| Testing | Jest, Supertest |
| Deployment | Vercel (frontend and backend services) · MongoDB Atlas (database) |

---

## 🏗 Architecture

```
Browser (React/Vite)
       │ HTTPS REST API
       │ HTTPS WebSocket
       ▼
Vercel Services
  - Frontend: Vite static site
  - Backend: Express API (/api/*) + Socket.IO (/socket.io)
       │
       ▼
MongoDB Atlas
  (tarot_reading database)
       │
       ▼
Gmail SMTP → Client email notifications
```

---

## 📁 Project Structure

```
tarot-reading/
├── .env.example          ← Copy to .env (never commit .env)
├── .gitignore
├── package.json          ← Monorepo scripts
├── README.md
│
├── backend/
│   ├── src/
│   │   ├── config/       ← env.ts, db.ts
│   │   ├── controllers/  ← auth, admin, booking, slot, readingType
│   │   ├── middleware/   ← auth, errorHandler, rateLimiter, validate
│   │   ├── models/       ← User, Booking, Slot, ReadingType, OtpVerification, OutboxEvent, AuditLog, EmailLog
│   │   ├── routes/       ← auth, booking, slot, readingType, admin
│   │   ├── scripts/      ← seedAdmin, seedReadingTypes, clearDatabase
│   │   ├── services/     ← booking, bookingState, email, outbox, realtime
│   │   ├── utils/        ← apiResponse, crypto, jwt, validation
│   │   ├── app.ts
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── components/   ← auth, common, layout
    │   ├── context/      ← AuthContext, SocketContext
    │   ├── pages/        ← admin/, client/, public/
    │   ├── services/     ← api.ts
    │   ├── types/        ← index.ts
    │   └── App.tsx
    ├── vercel.json       ← SPA routing rewrite
    ├── vite.config.ts
    └── package.json
```

---

## 💻 Local Development Setup

### Prerequisites
- Node.js 20+
- MongoDB running locally (`mongod`)
- A Gmail account with [App Password](https://support.google.com/accounts/answer/185833) enabled

### 1. Clone the repository

```bash
git clone https://github.com/Ishaan07-cpu/Tarot-Reading.git
cd Tarot-Reading
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your local values
```

### 3. Install dependencies

```bash
npm install --prefix backend
npm install --prefix frontend
```

### 4. Seed the database

```bash
# Create the admin user
npm run seed:admin

# Create the reading types
npm run seed:reading-types
```

### 5. Start development servers

```bash
# Terminal 1 – Backend (port 5000)
npm run dev:backend

# Terminal 2 – Frontend (port 5173)
npm run dev:frontend
```

Frontend: http://localhost:5173  
Backend API: http://localhost:5000/api  
Admin login: use `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`

---

## ⚙️ Environment Variables

All variables are defined in `.env` (local) or set in your hosting provider (production).

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Backend port (default: 5000; hosting platform may set this automatically) |
| `NODE_ENV` | Yes | `development` or `production` |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Long random secret for signing JWTs |
| `JWT_EXPIRES_IN` | No | JWT lifetime (default: `7d`) |
| `SMTP_HOST` | Yes | SMTP server host (e.g. `smtp.gmail.com`) |
| `SMTP_PORT` | Yes | SMTP port (e.g. `587`) |
| `SMTP_SECURE` | No | `true` for port 465, `false` for 587 |
| `SMTP_USER` | Yes | SMTP username (your Gmail address) |
| `SMTP_PASSWORD` | Yes | Gmail App Password |
| `SMTP_FROM` | Yes | From address shown in emails |
| `CLIENT_URL` | Yes | Frontend URL for CORS & email links |
| `ADMIN_NAME` | Seed only | Admin display name (used once during seed) |
| `ADMIN_EMAIL` | Seed only | Admin login email (used once during seed) |
| `ADMIN_PASSWORD` | Seed only | Admin login password (used once during seed) |

### Frontend variables (set in Vercel)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Optional backend origin when frontend and API use separate hosts; leave unset for the same-origin Vercel service rewrite |
| `VITE_SOCKET_URL` | Optional Socket.IO origin; leave unset for the same-origin Vercel deployment |

---

## 🍃 MongoDB Setup

### Local Development
MongoDB runs locally at `mongodb://127.0.0.1:27017/tarot_reading`.  
No configuration needed if MongoDB is installed.

### MongoDB Atlas (Production)

1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a database user (username + password)
3. Whitelist `0.0.0.0/0` in Network Access (or restrict access according to your hosting platform)
4. Get the connection string: `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/tarot_reading?retryWrites=true&w=majority`
5. Set `MONGODB_URI` in the Vercel backend service environment variables

---

## 🗃 Database Migration (Local → Atlas)

If `mongodump` is not in your PATH, find it in your MongoDB installation:

```
# Windows example
"C:\Program Files\MongoDB\Tools\<version>\bin\mongodump.exe" --db=tarot_reading --out="tarot_backup"
```

**Backup local database:**
```bash
mongodump --db=tarot_reading --out="tarot_backup"
```

**Restore to Atlas:**
```bash
mongorestore --uri="mongodb+srv://<user>:<password>@<cluster>.mongodb.net" --db=tarot_reading "tarot_backup/tarot_reading"
```

> ⚠️ `tarot_backup/` is in `.gitignore` — it will never be committed.

---

## 🧪 Testing

```bash
# Run all backend tests
npm run test:backend

# TypeScript check (backend)
cd backend && npx tsc --noEmit

# TypeScript check (frontend)
cd frontend && npx tsc --noEmit

# Frontend production build
cd frontend && npm run build
```

---

## 🚀 Production Deployment

### Architecture Summary

```
GitHub → Vercel (frontend and backend services) + MongoDB Atlas
```

---

### Vercel (Frontend and Backend)

1. Import `Ishaan07-cpu/Tarot-Reading` as a Vercel project and keep the project root at the repository root.
2. Keep the project framework set to **Services**. The root `vercel.json` declares the `frontend` Vite service and `backend` Express service and rewrites `/api/*` and `/socket.io/*` requests to the backend service.
3. Configure the backend service environment variables (`NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET`, SMTP settings, and admin seed values as needed). Set `CLIENT_URL` to the deployed frontend origin.
4. Leave `VITE_API_URL` and `VITE_SOCKET_URL` unset when using the same-origin service routing; API and Socket.IO requests use the Vercel rewrites.
5. Deploy the project. Do not set the Vercel project root to only `frontend` or change its framework preset from **Services**, as that prevents Vercel from discovering both services.

> Vercel Functions are serverless. Confirm the deployed backend supports the app's required long-running outbox worker and Socket.IO behavior; if the platform does not support those workloads, deploy the backend on a persistent Node.js host and set the optional frontend URL variables to that backend origin.

---

### Seed the Production Database

After the Vercel backend is deployed and Atlas is connected, run the seed scripts **once** from a trusted local environment configured with the production database URI and seed credentials:

```bash
npm run seed:admin
npm run seed:reading-types
```

---

## 🔒 Security Notes

- `.env` is in `.gitignore` and must never be committed
- JWT secrets, SMTP passwords, MongoDB credentials are environment variables only
- Passwords are hashed with bcrypt (10 rounds)
- OTPs are hashed with SHA-256 and expire in 10 minutes
- Rate limiting: 200 req/15min (general), 20 req/15min (auth)
- Helmet sets secure HTTP headers
- CORS is restricted to `CLIENT_URL` origins only
- Admin role is enforced server-side on every admin route
- Resource ownership is enforced on all client booking routes

---

## 📡 API Overview

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | Public | Register new client |
| POST | `/api/auth/verify-email` | Public | Verify OTP |
| POST | `/api/auth/login` | Public | Login |
| POST | `/api/auth/logout` | Auth | Logout |
| GET | `/api/auth/me` | Auth | Get current user |
| POST | `/api/auth/forgot-password` | Public | Request OTP reset |
| POST | `/api/auth/reset-password` | Public | Reset with OTP |
| GET | `/api/reading-types` | Public | List reading types |
| GET | `/api/slots` | Auth | Available slots |
| POST | `/api/bookings` | Auth | Create booking |
| GET | `/api/bookings/my-bookings` | Auth | Client's bookings |
| PATCH | `/api/bookings/:id/cancel` | Auth | Cancel booking |
| GET | `/api/admin/dashboard` | Admin | Stats |
| GET | `/api/admin/bookings` | Admin | All bookings |
| PATCH | `/api/admin/bookings/:id/approve` | Admin | Approve |
| PATCH | `/api/admin/bookings/:id/reject` | Admin | Reject |
| PATCH | `/api/admin/bookings/:id/complete` | Admin | Complete |
| GET/POST | `/api/admin/slots` | Admin | Manage slots |
| GET/POST/PATCH/DELETE | `/api/admin/reading-types` | Admin | Manage types |
| GET | `/api/health` | Public | Health check |

---

## 📌 Placeholder URLs

After deployment, replace these placeholders:

- **Frontend (Vercel)**: `https://your-app.vercel.app`
- **Backend service**: configured in the root `vercel.json` and routed under `/api`
- **Repository**: `https://github.com/Ishaan07-cpu/Tarot-Reading`

---

*Built with ✨ by Ishaan Umrao*