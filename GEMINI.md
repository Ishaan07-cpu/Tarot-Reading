# GEMINI.md — Tarot Reading Platform Implementation Instructions

## 1. Your Role

You are the primary senior full-stack engineer responsible for implementing this project.

The complete product requirements, architecture, workflows, API requirements, database design, security requirements, UI requirements, and acceptance criteria are defined in `README.md`.

Treat `README.md` as the source of truth for WHAT must be built.

Treat this file as the source of truth for HOW you should approach the implementation.

---

## 2. Read Before Coding

Before writing or modifying code:

1. Read `README.md` completely.
2. Read this `GEMINI.md` completely.
3. Understand the complete client flow and admin flow.
4. Inspect the existing project structure and files.
5. Identify all required frontend, backend, database, authentication, booking, email, realtime, and admin functionality.
6. Then implement the complete application.

Do not start coding after reading only part of the requirements.

---

## 3. Implement the Complete Website in One Go

Build the entire working system described in `README.md`.

Do NOT create a phased implementation plan.

Do NOT stop after creating the UI.

Do NOT create only a prototype, mockup, static frontend, fake dashboard, or fake API.

The final project must contain a functioning:

- Client website
- Client authentication
- Email OTP verification
- Login/logout
- Password reset
- Client dashboard
- Slot browsing
- Reading type selection
- Booking creation
- Booking status tracking
- Booking cancellation
- Admin authentication
- Admin dashboard
- Booking management
- Approve/reject/cancel/complete workflows
- Slot management
- Reading type management
- Client management
- Email notifications
- Socket.IO realtime updates
- MongoDB persistence
- Booking state machine
- Transactional booking/approval logic
- Outbox event processing
- Security protections
- Validation
- Error handling
- Tests for critical flows

Everything required by `README.md` should be implemented.

---

## 4. Do Not Weaken the Architecture

Do not replace important architectural requirements with simpler but unsafe alternatives.

In particular:

- MongoDB must be the persistent database.
- Backend must be authoritative.
- Never trust frontend status, role, price, slot availability, or ownership.
- Do not use frontend-only booking protection.
- Prevent double booking at the database/backend level.
- Preserve the booking state machine defined in `README.md`.
- Use MongoDB transactions where required.
- Use the outbox pattern for notification intent.
- Do not send email inside the critical MongoDB transaction.
- Socket.IO must never be the source of truth.
- After realtime events, the client should refetch authoritative data when appropriate.
- Email failures must not undo successful database operations.
- Admin authorization must be enforced server-side.

---

## 5. Free Technology Requirement

Use the free/open-source stack specified in `README.md`.

Do not introduce paid services unnecessarily.

Do not add:

- Paid authentication providers
- Paid email APIs
- Paid realtime services
- Paid queues
- Redis unless explicitly required by the README
- Kafka
- RabbitMQ
- Elasticsearch
- Kubernetes
- Unnecessary cloud infrastructure

Use MongoDB Atlas Free Tier and Nodemailer/Gmail SMTP as specified.

Keep external services abstracted so they can be replaced later.

---

## 6. Authentication and Security

Implement authentication properly.

Requirements include:

- Secure password hashing with bcrypt.
- Cryptographically secure OTP generation.
- Never store plaintext OTPs.
- OTP expiry.
- OTP attempt limits.
- OTP resend cooldown.
- Rate limiting.
- Secure password reset.
- JWT authentication.
- Prefer HTTP-only secure SameSite cookies for browser authentication.
- Server-side role authorization.
- Public signup must never allow the user to choose `ADMIN`.
- Admin creation must use a secure seed/bootstrap process.
- Validate request bodies.
- Protect against common injection/security issues.
- Configure CORS correctly.
- Use Helmet.
- Never expose secrets.
- Never return password hashes, OTPs, JWT secrets, or SMTP credentials.
- Enforce resource ownership on every client-owned resource.

---

## 7. Booking and Slot Integrity

The booking state machine in `README.md` is mandatory.

Do not implement booking logic by simply changing a status field from the controller.

Create a dedicated service/domain layer that:

1. Validates the current booking state.
2. Validates the requested transition.
3. Validates actor permissions.
4. Validates slot availability.
5. Performs required booking and slot updates atomically.
6. Creates the required outbox event.
7. Commits the transaction.
8. Lets notification processing happen after commit.

Prevent race conditions and double booking.

Do not rely on frontend validation for any critical booking rule.

---

## 8. Database Design

Follow the schemas and indexes in `README.md`.

Use Mongoose cleanly.

Create appropriate models, validation, indexes, timestamps, and references.

Avoid unnecessary duplication.

Use transactions for operations where booking/slot consistency matters.

Make sure MongoDB errors are handled cleanly.

---

## 9. Email Architecture

Keep email delivery separate from domain logic.

Create a dedicated email service with functions equivalent to:

- `sendOTPEmail`
- `sendBookingReceivedEmail`
- `sendBookingApprovedEmail`
- `sendBookingRejectedEmail`
- `sendBookingCancelledEmail`
- `sendPasswordResetEmail`

Email delivery must not be required for the database transaction to succeed.

Implement retry behavior according to `README.md`.

Do not log sensitive values such as OTPs or credentials.

---

## 10. Realtime Architecture

Use Socket.IO as specified.

Authenticate socket connections.

Use appropriate rooms such as:

- `user:<userId>`
- `admins`

Never broadcast private booking information globally.

Realtime events should notify clients that something changed.

The client should use REST/API data as the authoritative source.

If Socket.IO disconnects, the website must continue working through normal REST requests.

---

## 11. Outbox Processing

Implement the MongoDB outbox mechanism described in `README.md`.

Critical flow:

```text
Database transaction
    ↓
Booking update
    ↓
Slot update
    ↓
Outbox event created
    ↓
Transaction commits
    ↓
Outbox processor
    ↓
Email + Socket.IO notification
```

Never put external email/network calls inside the MongoDB transaction.

Handle retries and failed events safely.

Avoid duplicate side effects where practical.

---

## 12. Frontend Quality

Build a real production-quality React application.

Use:

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- React Hook Form where useful

Create reusable components instead of duplicating UI.

Handle:

- Loading states
- Empty states
- Error states
- Form validation
- API errors
- Unauthorized access
- Session expiration
- Mobile layouts
- Responsive desktop layouts

The design should feel:

- Mystical
- Premium
- Modern
- Elegant
- Minimal
- Trustworthy

Use a dark/purple/gold visual direction without making the interface cluttered.

Do not sacrifice usability for decoration.

---

## 13. Admin UI

The admin dashboard is a real application, not a visual mockup.

Implement:

- Admin login
- Dashboard statistics
- Pending bookings
- Booking table
- Search
- Filters
- Booking details
- Approve
- Reject
- Cancel
- Complete
- Slot calendar/management
- Reading type CRUD
- Client list/details
- Settings where specified
- Logout

Only admins can access admin APIs and pages.

---

## 14. Client UI

Implement the complete client experience:

```text
Landing Page
    ↓
Signup
    ↓
OTP Verification
    ↓
Login
    ↓
Dashboard
    ↓
Choose Reading
    ↓
Choose Available Slot
    ↓
Book
    ↓
Pending
    ↓
Admin Decision
    ↓
Approved / Rejected
    ↓
Reading
    ↓
Completed
```

The status shown to the client must always come from the backend.

When an admin approves or rejects a booking, the client UI must update correctly through Socket.IO and/or REST fallback.

---

## 15. Environment Configuration

Never hardcode:

- MongoDB URI
- JWT secret
- SMTP username/password
- Admin credentials
- API secrets

Use `.env`.

Provide `.env.example` containing variable names but no real secrets.

Validate required environment variables when the server starts.

---

## 16. Code Quality

Use clean TypeScript.

Prefer:

- Small focused modules
- Controllers for HTTP concerns
- Services for business logic
- Models for persistence
- Middleware for cross-cutting concerns
- Utilities for reusable helpers
- Centralized error handling
- Consistent API responses
- Clear naming
- Strong typing

Avoid:

- Giant controller files
- Business logic duplicated across routes
- Magic strings scattered throughout the project
- Hardcoded credentials
- Dead code
- Fake implementations
- TODO placeholders for required functionality

---

## 17. Testing

After implementation, test the complete application.

At minimum verify:

- Signup
- Duplicate email
- OTP verification
- Expired OTP
- OTP resend limits
- Login
- Invalid credentials
- Logout
- Password reset
- Client authorization
- Admin authorization
- Slot creation
- Slot validation
- Booking creation
- Double-booking/concurrency protection
- Approval
- Rejection
- Cancellation
- Completion
- Invalid state transitions
- Email failure/retry
- Outbox processing
- Socket connection/authentication
- Realtime booking updates
- REST fallback
- Client ownership protection

Fix discovered problems rather than merely documenting them.

---

## 18. Build and Run Verification

After implementation:

1. Install dependencies.
2. Verify TypeScript compilation.
3. Verify frontend build.
4. Verify backend build.
5. Run tests.
6. Fix build errors.
7. Fix runtime errors.
8. Verify API routes.
9. Verify database connectivity.
10. Verify the main client booking flow.
11. Verify the main admin approval flow.
12. Verify client-side status synchronization.

Do not declare the project complete if the application does not build.

---

## 19. Decision-Making Rule

If a minor implementation detail is not explicitly specified:

- Choose the simplest secure solution.
- Prefer the technologies already selected in `README.md`.
- Prefer free/open-source solutions.
- Preserve the architecture and business rules.
- Do not ask for approval for every minor implementation decision.

Only ask for clarification if a decision would materially change the product requirements or contradict the README.

---

## 20. Final Acceptance Criteria

Before considering the task complete, confirm that:

- The full website is implemented.
- Client and admin experiences both work.
- Authentication works.
- OTP email works.
- Password reset works.
- Booking works.
- Double booking is prevented.
- Admin approval works.
- Admin rejection works.
- Client status updates after admin action.
- Email notifications work independently of database transactions.
- Socket.IO realtime updates work.
- REST fallback works.
- Outbox events are persisted and processed.
- Slot states remain consistent.
- Security controls are implemented.
- Tests pass.
- Frontend builds.
- Backend builds.
- No required feature is left as a mockup or placeholder.

Do not provide a phased roadmap instead of implementing the application.

The objective is to produce the complete working tarot-reading platform described in `README.md`.
