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
| Deployment | Vercel (frontend) · Render (backend) · MongoDB Atlas (database) |

---

## 🏗 Architecture

```
Browser (React/Vite)
       │ HTTPS REST API
       │ HTTPS WebSocket
       ▼
Vercel CDN → frontend/dist (static)
       │
       ▼
Render (Node.js + Express)
  - REST API: /api/*
  - Socket.IO: /socket.io
  - Outbox worker (4s polling)
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
| `PORT` | No | Backend port (default: 5000; Render sets this automatically) |
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

### Frontend-only variables (set in Vercel)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Full Render backend URL: `https://your-backend.onrender.com` |
| `VITE_SOCKET_URL` | Full Render backend URL (same as above for Socket.IO) |

---

## 🍃 MongoDB Setup

### Local Development
MongoDB runs locally at `mongodb://127.0.0.1:27017/tarot_reading`.  
No configuration needed if MongoDB is installed.

### MongoDB Atlas (Production)

1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a database user (username + password)
3. Whitelist `0.0.0.0/0` in Network Access (or restrict to Render IPs)
4. Get the connection string: `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/tarot_reading?retryWrites=true&w=majority`
5. Set `MONGODB_URI` in Render environment variables

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
GitHub → Vercel (frontend) + Render (backend) + MongoDB Atlas
```

---

### Vercel (Frontend)

1. Go to [vercel.com](https://vercel.com) → Import Git Repository
2. Select `Ishaan07-cpu/Tarot-Reading`
3. Either use the repository root (configured by the root `vercel.json` to build and serve only the frontend) or set **Root Directory** to `frontend` with the Vite preset and `npm run build` / `dist`.
4. Add Environment Variables:
   ```
   VITE_API_URL=https://your-backend.onrender.com
   VITE_SOCKET_URL=https://your-backend.onrender.com
   ```
5. Deploy

The `frontend/vercel.json` handles React Router SPA rewrites automatically.

---

### Render (Backend)

1. Go to [render.com](https://render.com) → New Web Service
2. Connect `Ishaan07-cpu/Tarot-Reading`
3. Set:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Node
4. Add all Environment Variables (see table above), specifically:
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=<strong-random-secret>
   CLIENT_URL=https://your-app.vercel.app
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your@gmail.com
   SMTP_PASSWORD=your_app_password
   SMTP_FROM="Mystic Tarot" <your@gmail.com>
   ```
5. Deploy

> After Render deploys, copy its URL and set it as `VITE_API_URL` and `VITE_SOCKET_URL` in Vercel, then redeploy the frontend. Do not point either variable at the Vercel frontend URL. Set `CLIENT_URL` on Render to the exact Vercel frontend origin; comma-separated production/preview origins are supported.

---

### Seed the Production Database

After Render is running (and Atlas is connected), run the seed scripts **once**:

On Render: go to your service → **Shell** → run:
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
- **Backend (Render)**: `https://your-backend.onrender.com`
- **Repository**: `https://github.com/Ishaan07-cpu/Tarot-Reading`

---

*Built with ✨ by Ishaan Umrao*