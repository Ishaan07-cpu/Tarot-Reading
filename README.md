# Tarot Reading Booking Platform

A complete full-stack tarot-reading booking platform with:

-   Client website
-   Client authentication
-   Email OTP verification
-   Tarot reading slot booking
-   Admin dashboard
-   Admin approval/rejection workflow
-   Booking status synchronization
-   Email notifications
-   Real-time Socket.IO updates
-   MongoDB persistence
-   Strong backend authorization and validation
-   Free/open-source technology stack wherever possible

The application is intended to be a real working full-stack product, not
a frontend-only demo.

------------------------------------------------------------------------

# 1. Core Objective

The website has two separate experiences:

## Client

A client can:

1.  Create an account
2.  Verify their email using OTP
3.  Log in
4.  View available tarot-reading slots
5.  Select a reading type
6.  Book a slot
7.  Receive a booking confirmation email
8.  Track booking status
9.  Receive an approval/rejection email
10. See booking status updates on the dashboard
11. View booking history
12. Manage their profile
13. Reset their password

## Admin

The admin can:

1.  Log in securely
2.  View dashboard statistics
3.  View pending booking requests
4.  View client details
5.  Approve bookings
6.  Reject bookings
7.  Manage available slots
8.  Manage clients
9.  Manage tarot reading types
10. Mark approved readings as completed
11. Cancel bookings where appropriate
12. Receive real-time notifications for new bookings
13. Track booking state changes

------------------------------------------------------------------------

# 2. Important Implementation Requirement

Build the entire application as a complete full-stack system in one go.

Do NOT create a fake frontend-only demo.

Do NOT implement only the UI.

The following must actually work:

-   Signup
-   Email OTP
-   Login
-   Logout
-   JWT authentication
-   Password reset
-   MongoDB persistence
-   Slot creation
-   Slot availability
-   Booking creation
-   Double-booking prevention
-   Admin authentication
-   Admin approval
-   Admin rejection
-   Booking cancellation
-   Booking completion
-   Client/admin synchronization
-   Email notifications
-   Real-time Socket.IO updates
-   Secure authorization
-   Error handling

The backend must be the source of truth.

------------------------------------------------------------------------

# 3. Technology Stack

## Frontend

Use:

-   React
-   TypeScript
-   Vite
-   Tailwind CSS
-   React Router
-   Axios
-   React Hook Form where useful

## Backend

Use:

-   Node.js
-   Express.js
-   TypeScript
-   Mongoose
-   JWT
-   bcrypt
-   Helmet
-   express-rate-limit
-   Zod or another strong validation library
-   Socket.IO

## Database

Use:

**MongoDB Atlas Free Tier**

MongoDB should be the primary database.

## Email

Use:

**Nodemailer**

Initially support Gmail SMTP.

The email service must be abstracted so another provider can be added
later without rewriting the application.

## Real-Time

Use:

**Socket.IO**

Do not use paid real-time services.

------------------------------------------------------------------------

# 4. Zero-Cost Requirement

The project must be designed around free/open-source technologies and
free tiers.

Target development/MVP cost:

**₹0**

Do not introduce paid services unless absolutely unavoidable.

Do not require:

-   Paid authentication services
-   Paid email APIs
-   Paid real-time services
-   Paid database plans
-   Paid analytics
-   Paid queues
-   Paid cloud infrastructure

Possible free stack:

``` text
React + Vite
       ↓
Free frontend hosting
       ↓
Node + Express
       ↓
Free backend hosting
       ↓
MongoDB Atlas Free Tier
       ↓
Gmail SMTP + Nodemailer
```

Free tiers have provider-specific limits. Do not claim unlimited free
usage.

------------------------------------------------------------------------

# 5. Project Structure

Use a clean production-style structure:

``` text
tarot-reading-platform/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── context/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   └── ...
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── config/
│   │   ├── types/
│   │   ├── events/
│   │   ├── workers/
│   │   ├── app.ts
│   │   └── server.ts
│   │
│   └── ...
│
├── .env.example
├── .gitignore
└── README.md
```

Do not put all backend logic into route files.

Do not put database queries directly into React components.

Use controllers, services, models and middleware.

------------------------------------------------------------------------

# 6. Environment Variables

Create:

``` text
.env.example
```

Example:

``` env
PORT=5000

MONGODB_URI=

JWT_SECRET=
JWT_EXPIRES_IN=7d

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=

CLIENT_URL=http://localhost:5173

ADMIN_NAME=
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

Never commit `.env`.

Add `.env` to `.gitignore`.

Never expose secrets to the frontend.

------------------------------------------------------------------------

# 7. Authentication

Implement secure authentication.

## Signup

Fields:

-   Full name
-   Email
-   Phone number
-   Password
-   Confirm password

Flow:

``` text
Signup
  ↓
Validate input
  ↓
Check email
  ↓
Hash password
  ↓
Create user
  ↓
Generate OTP
  ↓
Hash OTP
  ↓
Store OTP
  ↓
Send email
  ↓
Verify OTP
  ↓
Mark email verified
```

OTP requirements:

-   6 digits
-   Cryptographically random
-   Expires after 5--10 minutes
-   Single use
-   Store hashed OTP
-   Attempt limit
-   Resend cooldown
-   Rate limiting

Never store plaintext OTPs.

------------------------------------------------------------------------

# 8. Login

Login fields:

-   Email
-   Password

Use JWT authentication.

Prefer HTTP-only cookies for production.

Authentication state should include:

``` text
user
isAuthenticated
loading
```

Use an AuthContext or equivalent.

After normal login:

``` text
/dashboard
```

After admin login:

``` text
/admin/dashboard
```

------------------------------------------------------------------------

# 9. Roles

Use exactly:

``` text
USER
ADMIN
```

or equivalent lowercase values consistently.

Normal signup must never allow a user to choose:

``` text
role = admin
```

The backend must determine the user's role.

Never trust a role sent from the frontend.

Create middleware such as:

``` text
requireAuth
requireAdmin
```

------------------------------------------------------------------------

# 10. Admin Account

Do not expose public admin registration.

Create the first admin through a secure seed script:

``` text
npm run seed:admin
```

Use environment variables:

``` env
ADMIN_NAME=
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

Alternatively, create the admin securely through MongoDB.

Never return admin passwords or password hashes through APIs.

------------------------------------------------------------------------

# 11. Password Reset

Implement:

``` text
Forgot Password
       ↓
Enter email
       ↓
Generate secure reset OTP/token
       ↓
Send email
       ↓
Verify
       ↓
Set new password
       ↓
Hash password
       ↓
Invalidate reset token
```

Apply rate limits and expiration.

------------------------------------------------------------------------

# 12. Client Website

Create a polished tarot website.

Design:

-   Mystical
-   Premium
-   Modern
-   Minimal
-   Dark/purple/gold aesthetic
-   Responsive
-   Mobile friendly
-   Smooth but restrained animations

The primary purpose is booking tarot readings.

Do not overload the website with unnecessary features.

------------------------------------------------------------------------

# 13. Public Pages

Create:

``` text
/
```

Home page.

``` text
/login
```

Login.

``` text
/signup
```

Signup.

``` text
/verify-email
```

OTP verification.

The home page should include:

-   Hero section
-   "Discover What the Cards Have to Say"
-   Booking CTA
-   How It Works
-   Reading Types
-   Benefits
-   FAQ
-   Contact
-   Footer

------------------------------------------------------------------------

# 14. Client Protected Pages

Create:

``` text
/dashboard
/book
/bookings
/profile
```

Protect all private routes.

------------------------------------------------------------------------

# 15. Client Dashboard

Display:

-   Welcome message
-   Upcoming reading
-   Pending bookings
-   Approved bookings
-   Completed readings

Show the current booking status clearly.

Example:

``` text
Pending Approval
Approved
Rejected
Cancelled
Completed
```

The displayed status must come from the backend.

Do not treat localStorage or frontend state as the permanent source of
truth.

------------------------------------------------------------------------

# 16. Booking System

The client can:

1.  Select reading type
2.  Select available date
3.  Select available time slot
4.  Add optional notes/questions
5.  Submit booking request

Example reading types:

-   General Tarot Reading
-   Love & Relationship Reading
-   Career Reading
-   Finance Reading
-   Personal Guidance

Reading types should be configurable through the admin dashboard.

------------------------------------------------------------------------

# 17. Slot System

Admin creates available slots.

Example:

``` text
Date: 10 October 2026
Time: 6:00 PM – 6:30 PM
Status: Available
```

A slot cannot be booked twice.

The backend, not the frontend, must enforce availability.

------------------------------------------------------------------------

# 18. Database Design

Use MongoDB + Mongoose.

Collections:

``` text
users
otpVerifications
slots
bookings
readingTypes
emailLogs
outboxEvents
auditLogs
```

------------------------------------------------------------------------

# 19. User Model

Suggested fields:

``` text
_id
name
email
phone
passwordHash
role
isEmailVerified
createdAt
updatedAt
```

Create a unique index on:

``` text
email
```

------------------------------------------------------------------------

# 20. OTP Model

Suggested:

``` text
_id
email
otpHash
purpose
expiresAt
attempts
createdAt
```

Purposes:

``` text
email_verification
password_reset
```

Use a TTL index on:

``` text
expiresAt
```

------------------------------------------------------------------------

# 21. Slot Model

Suggested:

``` text
_id
date
startTime
endTime
status
heldBy
heldUntil
createdAt
updatedAt
```

Slot status:

``` text
AVAILABLE
HELD
BOOKED
DISABLED
```

Use `HELD` only if needed for temporary reservation. Do not implement
both an unnecessary hold system and an equivalent locking mechanism.

------------------------------------------------------------------------

# 22. Booking Model

Suggested:

``` text
_id
userId
slotId
readingTypeId
notes
status
createdAt
updatedAt
approvedAt
rejectedAt
cancelledAt
completedAt
rejectionReason
cancellationReason
```

Do not create separate boolean fields such as:

``` text
isApproved
isRejected
isCompleted
```

The single `status` field is the source of truth.

------------------------------------------------------------------------

# 23. Reading Type Model

Suggested:

``` text
_id
name
description
duration
price
isActive
createdAt
updatedAt
```

Only active reading types appear to clients.

------------------------------------------------------------------------

# 24. Email Log Model

Suggested:

``` text
_id
userId
bookingId
type
recipient
status
attempts
sentAt
lastError
createdAt
```

Statuses:

``` text
PENDING
SENT
FAILED
```

------------------------------------------------------------------------

# 25. Outbox Event Model

Use MongoDB as a lightweight event/outbox store.

Suggested:

``` text
_id
type
bookingId
userId
status
attempts
nextAttemptAt
createdAt
processedAt
lastError
```

Statuses:

``` text
PENDING
PROCESSING
PROCESSED
FAILED
```

This avoids adding Redis, RabbitMQ or another paid/external queue.

------------------------------------------------------------------------

# 26. Audit Log Model

Suggested:

``` text
_id
bookingId
actorId
actorRole
action
fromStatus
toStatus
timestamp
```

Use this to record important booking actions.

Clients must never be allowed to modify audit logs.

------------------------------------------------------------------------

# 27. Database Indexes

Create:

``` text
users.email → unique

bookings.userId
bookings.slotId
bookings.status
bookings.createdAt

slots.date
slots.status

otpVerifications.expiresAt → TTL

outboxEvents.status
outboxEvents.nextAttemptAt
```

Use appropriate compound indexes if query patterns require them.

------------------------------------------------------------------------

# 28. API Design

Authentication:

``` text
POST /api/auth/signup
POST /api/auth/verify-email
POST /api/auth/resend-otp
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET  /api/auth/me
```

Client:

``` text
GET   /api/slots
GET   /api/reading-types
POST  /api/bookings
GET   /api/bookings/my-bookings
GET   /api/bookings/:id
PATCH /api/bookings/:id/cancel
```

Admin:

``` text
GET   /api/admin/dashboard
GET   /api/admin/bookings
GET   /api/admin/bookings/:id
PATCH /api/admin/bookings/:id/approve
PATCH /api/admin/bookings/:id/reject
PATCH /api/admin/bookings/:id/complete
PATCH /api/admin/bookings/:id/cancel

GET    /api/admin/users

GET    /api/admin/slots
POST   /api/admin/slots
PATCH  /api/admin/slots/:id
DELETE /api/admin/slots/:id

GET    /api/admin/reading-types
POST   /api/admin/reading-types
PATCH  /api/admin/reading-types/:id
DELETE /api/admin/reading-types/:id
```

Use consistent API responses:

Success:

``` json
{
  "success": true,
  "data": {}
}
```

Error:

``` json
{
  "success": false,
  "message": "Something went wrong"
}
```

------------------------------------------------------------------------

# 29. Booking State Machine

Implement the booking system as an explicit finite state machine.

Valid booking states:

``` text
PENDING
APPROVED
REJECTED
CANCELLED
COMPLETED
```

Do not allow arbitrary status changes.

------------------------------------------------------------------------

# 30. State Definitions

## PENDING

The client submitted a booking and is waiting for admin action.

Valid transitions:

``` text
PENDING → APPROVED
PENDING → REJECTED
PENDING → CANCELLED
```

When created:

``` text
status = PENDING
```

Send:

``` text
Booking Request Received
```

------------------------------------------------------------------------

## APPROVED

Admin has confirmed the booking.

Valid transitions:

``` text
APPROVED → COMPLETED
APPROVED → CANCELLED
```

On approval:

-   Set `status = APPROVED`
-   Set `approvedAt`
-   Set slot = `BOOKED`
-   Send approval email
-   Emit real-time update
-   Update client dashboard

------------------------------------------------------------------------

## REJECTED

Admin rejected the booking.

Terminal state.

No normal outgoing transition.

On rejection:

-   Set `status = REJECTED`
-   Set `rejectedAt`
-   Store optional rejection reason
-   Make associated slot available again
-   Send rejection email
-   Emit real-time update

If the client wants another session, create a new booking.

------------------------------------------------------------------------

## CANCELLED

Booking was cancelled.

Valid transitions:

``` text
PENDING → CANCELLED
APPROVED → CANCELLED
```

Approved bookings may only be cancelled before a configurable
cancellation deadline.

When cancelled:

-   Set `status = CANCELLED`
-   Set `cancelledAt`
-   Store optional cancellation reason
-   Release slot when appropriate
-   Send cancellation email
-   Emit real-time update

------------------------------------------------------------------------

## COMPLETED

The tarot session took place.

Transition:

``` text
APPROVED → COMPLETED
```

Admin normally marks the booking completed.

Set:

``` text
completedAt
```

Completed bookings are historical.

------------------------------------------------------------------------

# 31. State Transition Diagram

``` text
                    ┌─────────────┐
                    │   PENDING   │
                    └──────┬──────┘
                           │
                ┌──────────┼──────────┐
                │          │          │
                ▼          ▼          ▼
          ┌──────────┐ ┌─────────┐ ┌───────────┐
          │ APPROVED │ │REJECTED │ │ CANCELLED │
          └────┬─────┘ └─────────┘ └───────────┘
               │
          ┌────┴───────┐
          │            │
          ▼            ▼
   ┌───────────┐ ┌───────────┐
   │ COMPLETED │ │ CANCELLED │
   └───────────┘ └───────────┘
```

Valid transitions:

``` text
PENDING → APPROVED
PENDING → REJECTED
PENDING → CANCELLED

APPROVED → COMPLETED
APPROVED → CANCELLED
```

------------------------------------------------------------------------

# 32. Invalid Transitions

Reject:

``` text
REJECTED → APPROVED
REJECTED → PENDING
REJECTED → COMPLETED

CANCELLED → APPROVED
CANCELLED → PENDING
CANCELLED → COMPLETED

COMPLETED → APPROVED
COMPLETED → CANCELLED
COMPLETED → PENDING

APPROVED → PENDING
APPROVED → REJECTED
```

Return:

``` json
{
  "success": false,
  "message": "Invalid booking status transition"
}
```

Use HTTP `409 Conflict` where appropriate.

------------------------------------------------------------------------

# 33. Booking State Service

Create:

``` text
services/bookingState.service.ts
```

or an equivalent dedicated state-transition service.

Do not update booking status directly from controllers.

Conceptually:

``` text
transitionBooking(
    bookingId,
    targetState,
    actor
)
```

Responsibilities:

1.  Load booking
2.  Determine current state
3.  Validate transition
4.  Verify actor permissions
5.  Verify slot conditions
6.  Execute MongoDB transaction
7.  Update booking
8.  Update slot
9.  Create audit event
10. Create outbox event
11. Return updated booking

------------------------------------------------------------------------

# 34. Actor Permissions

## Client

Allowed:

``` text
PENDING → CANCELLED
```

The client cannot approve, reject or complete their own booking.

## Admin

Allowed:

``` text
PENDING → APPROVED
PENDING → REJECTED
PENDING → CANCELLED

APPROVED → COMPLETED
APPROVED → CANCELLED
```

Backend authorization must enforce these rules.

------------------------------------------------------------------------

# 35. Slot State Machine

Slot states:

``` text
AVAILABLE
HELD
BOOKED
DISABLED
```

Flow:

``` text
AVAILABLE
    │
    ▼
   HELD
    │
    ├────────→ AVAILABLE
    │
    ▼
  BOOKED
```

`DISABLED` is an administrative state.

------------------------------------------------------------------------

# 36. Slot Rules

## AVAILABLE

Client can book it.

## HELD

Temporarily reserved while booking is being completed.

Use:

``` text
heldBy
heldUntil
```

If the hold expires:

``` text
HELD → AVAILABLE
```

If a simpler atomic database booking strategy is sufficient, use that
instead and avoid unnecessary hold complexity.

## BOOKED

The slot is confirmed and cannot be booked again.

## DISABLED

Admin has disabled the slot.

It must not appear as available to clients.

------------------------------------------------------------------------

# 37. Booking and Slot Consistency

Maintain these invariants.

For an approved booking:

``` text
booking.status = APPROVED
slot.status = BOOKED
```

For a rejected booking:

``` text
booking.status = REJECTED
slot.status = AVAILABLE
```

For a cancelled booking:

``` text
booking.status = CANCELLED
slot.status = AVAILABLE
```

where the slot was reserved by that booking.

For a completed booking:

``` text
booking.status = COMPLETED
```

The historical slot must not accidentally become a new available slot.

------------------------------------------------------------------------

# 38. Prevent Double Booking

Two clients must never successfully book the same slot.

Do not depend on frontend validation.

Use MongoDB atomic operations and/or transactions.

Example:

``` text
Client A ──┐
           ├── Same slot
Client B ──┘
```

Only one operation may successfully reserve the slot.

The losing request should receive a conflict such as:

``` text
Slot is no longer available.
```

------------------------------------------------------------------------

# 39. Atomic Approval

Approval must keep booking and slot state consistent.

Correct:

``` text
Start transaction
    ↓
Verify booking is PENDING
    ↓
Verify slot is valid
    ↓
Booking → APPROVED
    ↓
Slot → BOOKED
    ↓
Create outbox event
    ↓
Commit
```

Never allow:

``` text
Booking = APPROVED
Slot = AVAILABLE
```

or:

``` text
Booking = PENDING
Slot = BOOKED
```

after a successful transaction.

------------------------------------------------------------------------

# 40. Admin Dashboard

Route:

``` text
/admin/dashboard
```

Only admins can access it.

Admin navigation:

``` text
Dashboard
Bookings
Calendar / Slots
Clients
Reading Types
Settings
Logout
```

Mobile navigation should be collapsible.

------------------------------------------------------------------------

# 41. Admin Dashboard Overview

Show:

``` text
Total Bookings
Pending Bookings
Approved Bookings
Upcoming Readings
Total Users
```

Also show recent pending requests.

Example:

``` text
Client          Reading          Date       Time      Action
Rahul Sharma    Love Reading     10 Oct     6 PM      View
Priya Singh     Career Reading   10 Oct     7 PM      View
```

------------------------------------------------------------------------

# 42. Admin Booking Management

Show:

``` text
Booking ID
Client
Reading Type
Date
Time
Status
Created At
Actions
```

Actions depend on current state.

Pending:

``` text
View
Approve
Reject
```

Approved:

``` text
View
Complete
Cancel
```

Rejected/completed/cancelled:

``` text
View
```

Do not display invalid actions.

------------------------------------------------------------------------

# 43. Booking Details

Admin can view:

## Client

``` text
Name
Email
Phone
```

## Booking

``` text
Booking ID
Reading Type
Date
Time
Notes
Status
Created At
```

For pending bookings:

``` text
Approve
Reject
```

------------------------------------------------------------------------

# 44. Approval Workflow

Admin clicks Approve.

Show confirmation:

``` text
Are you sure you want to approve this booking?

Client:
Rahul Sharma

Reading:
Love & Relationship

Date:
10 October 2026

Time:
6:00 PM

[Cancel] [Confirm Approval]
```

After confirmation:

1.  Authenticate admin
2.  Validate state
3.  Validate slot
4.  Start MongoDB transaction
5.  Booking PENDING → APPROVED
6.  Slot → BOOKED
7.  Set `approvedAt`
8.  Create outbox event
9.  Commit transaction
10. Return success
11. Process notifications separately
12. Update admin UI

------------------------------------------------------------------------

# 45. Rejection Workflow

Admin clicks Reject.

Show confirmation:

``` text
Are you sure you want to reject this booking?

Optional rejection reason:
[________________]

[Cancel] [Confirm Rejection]
```

After confirmation:

1.  Validate admin
2.  Validate booking is PENDING
3.  Update booking to REJECTED
4.  Set `rejectedAt`
5.  Save rejection reason
6.  Release slot
7.  Create outbox event
8.  Commit
9.  Process notifications separately
10. Update UI

------------------------------------------------------------------------

# 46. Admin Slot Management

Admin can:

-   Create slot
-   Edit slot
-   Disable slot
-   View slots
-   View booked slots

Create slot:

``` text
Date
Start Time
End Time
```

Validate:

-   Date is valid
-   End is after start
-   Slot is not in the past
-   No conflicting slot exists
-   No duplicate slot exists

Do not allow an active approved booking to be accidentally overwritten.

------------------------------------------------------------------------

# 47. Calendar

Admin should have a calendar-style view.

Display:

``` text
AVAILABLE
HELD
BOOKED
DISABLED
```

Example:

``` text
10 October

5:00 PM    Available
6:00 PM    Held
7:00 PM    Booked
8:00 PM    Available
```

------------------------------------------------------------------------

# 48. Client Management

Admin can view:

``` text
Name
Email
Phone
Email Verification
Joined Date
Total Bookings
```

Client profile shows booking history.

Never expose:

``` text
password
passwordHash
OTP
JWT
secrets
```

------------------------------------------------------------------------

# 49. Reading Type Management

Admin can:

-   Create
-   Edit
-   Disable
-   Delete

Fields:

``` text
Name
Description
Duration
Price
Active
```

Only active types appear to clients.

------------------------------------------------------------------------

# 50. Admin Notifications

When a new booking is successfully created:

``` text
BOOKING_CREATED
```

Notify the admin dashboard through Socket.IO.

Example:

``` text
New Booking Request

Rahul Sharma requested a
Love & Relationship reading.

10 October
6:00 PM

[View Booking]
```

Update pending count automatically.

------------------------------------------------------------------------

# 51. Separate Email and Real-Time Processing

Email delivery and Socket.IO notifications must be completely separated
from the core booking transaction.

Core rule:

**DATABASE FIRST, NOTIFICATIONS SECOND.**

Do not allow email or WebSocket failure to change a successful booking
state.

------------------------------------------------------------------------

# 52. Booking Transaction

Correct:

``` text
Admin Approve
    ↓
Authenticate
    ↓
Validate State
    ↓
MongoDB Transaction
    ↓
Update Booking
    ↓
Update Slot
    ↓
Create Outbox Event
    ↓
Commit
    ↓
Return Success
    ↓
Process Notifications
```

Incorrect:

``` text
Start DB Transaction
    ↓
Send Gmail
    ↓
Wait
    ↓
Update DB
    ↓
Commit
```

Never keep a database transaction open while waiting for SMTP.

------------------------------------------------------------------------

# 53. Booking Service

Create:

``` text
services/booking.service.ts
```

It handles:

-   Booking creation
-   Booking cancellation
-   State transitions
-   Slot consistency
-   Transactions
-   Double-booking prevention

It must not contain email HTML/templates or Socket.IO connection logic.

------------------------------------------------------------------------

# 54. Email Service

Create:

``` text
services/email.service.ts
```

Functions:

``` text
sendOTPEmail()
sendBookingReceivedEmail()
sendBookingApprovedEmail()
sendBookingRejectedEmail()
sendBookingCancelledEmail()
sendPasswordResetEmail()
```

The email service must not:

-   Approve bookings
-   Reject bookings
-   Change slot status
-   Modify authentication
-   Change booking state

------------------------------------------------------------------------

# 55. Real-Time Service

Create:

``` text
services/realtime.service.ts
```

Functions can include:

``` text
notifyUser()
notifyAdmins()
emitBookingUpdated()
emitBookingCreated()
```

It only handles Socket.IO.

It must not modify booking state.

------------------------------------------------------------------------

# 56. Domain Events

Use internal events:

``` text
BOOKING_CREATED
BOOKING_APPROVED
BOOKING_REJECTED
BOOKING_CANCELLED
BOOKING_COMPLETED
```

Example:

``` text
Admin Approves
      ↓
Booking Service
      ↓
MongoDB Transaction
      ↓
COMMIT
      ↓
BOOKING_APPROVED
      ├── Email
      ├── Socket.IO
      └── Audit processing
```

------------------------------------------------------------------------

# 57. Event Payload

Keep payloads minimal.

Example:

``` json
{
  "type": "BOOKING_APPROVED",
  "bookingId": "...",
  "userId": "...",
  "timestamp": "..."
}
```

Never include:

-   Passwords
-   OTPs
-   JWTs
-   SMTP credentials
-   Secrets

------------------------------------------------------------------------

# 58. Email Processing

After a successful booking event:

``` text
BOOKING_APPROVED
       ↓
Email Handler
       ↓
Load required data
       ↓
Build HTML email
       ↓
Nodemailer
       ↓
Gmail SMTP
```

Approval email should include:

-   Client name
-   Reading type
-   Date
-   Time
-   Booking ID
-   Relevant instructions

------------------------------------------------------------------------

# 59. Email Types

## OTP

Subject:

``` text
Verify Your Tarot Reading Account
```

Contains:

``` text
6-digit OTP
Expiration information
```

## Booking Received

Subject:

``` text
Your Tarot Reading Booking Request
```

Contains:

``` text
Reading type
Date
Time
Booking ID
Status: Pending Approval
```

## Booking Approved

Subject:

``` text
Your Tarot Reading Booking Has Been Approved
```

Contains:

``` text
Reading type
Date
Time
Booking ID
Status: Approved
```

## Booking Rejected

Subject:

``` text
Update Regarding Your Tarot Reading Booking
```

Contains:

``` text
Reading type
Date
Time
Booking ID
Optional reason
Status: Rejected
```

## Booking Cancelled

Subject:

``` text
Your Tarot Reading Booking Has Been Cancelled
```

## Password Reset

Send secure reset OTP/token.

------------------------------------------------------------------------

# 60. Email Failure

Email failure must never roll back a successful booking.

Example:

``` text
MongoDB:
APPROVED ✓

Email:
FAILED ✗
```

Booking remains:

``` text
APPROVED
```

Log the email failure.

Use:

``` text
emailLogs
```

with:

``` text
attempts
status
lastError
```

------------------------------------------------------------------------

# 61. Email Retry

Use lightweight retries.

Maximum:

``` text
3 attempts
```

Do not retry forever.

Do not keep the original HTTP request waiting.

If all retries fail:

``` text
emailLogs.status = FAILED
```

The booking remains unchanged.

------------------------------------------------------------------------

# 62. Real-Time Processing

When a booking changes:

``` text
booking:updated
```

Payload:

``` json
{
  "bookingId": "...",
  "status": "approved"
}
```

The client should then refetch the authoritative booking data.

------------------------------------------------------------------------

# 63. Socket.IO Is Only a Signal

Socket.IO must not be the source of truth.

Recommended:

``` text
Socket event
     ↓
"Something changed"
     ↓
GET /api/bookings/my-bookings
     ↓
MongoDB
     ↓
Render latest state
```

This prevents frontend/backend state drift.

------------------------------------------------------------------------

# 64. Socket Failure

If Socket.IO fails:

``` text
MongoDB = APPROVED
Socket.IO = FAILED
```

The booking remains approved.

Client can still discover the correct state through REST APIs.

Use:

-   Dashboard load refresh
-   Browser focus refresh
-   Optional low-frequency polling

Avoid aggressive polling.

------------------------------------------------------------------------

# 65. Client Synchronization

Primary:

``` text
Socket.IO
```

Fallback:

``` text
REST API
```

The client should refetch booking data after receiving:

``` text
booking:updated
```

Do not permanently update the client using only the socket payload.

------------------------------------------------------------------------

# 66. Admin Real-Time Updates

When a client creates a booking:

``` text
POST /api/bookings
       ↓
MongoDB Commit
       ↓
BOOKING_CREATED
       ↓
Socket.IO
       ↓
Admin Dashboard
```

Admin dashboard should update:

-   Pending count
-   Booking table
-   Dashboard statistics
-   Notification indicator

------------------------------------------------------------------------

# 67. Socket Security

Authenticate Socket.IO connections.

Do not trust frontend-provided:

``` text
userId
role
email
```

Verify the authentication server-side.

Use rooms:

``` text
user:<userId>
admins
```

Only send private booking events to the appropriate user.

Do not broadcast private booking data globally.

------------------------------------------------------------------------

# 68. MongoDB Outbox Pattern

For stronger reliability, use:

``` text
outboxEvents
```

inside MongoDB.

Transaction:

``` text
Start Transaction
    ↓
Update Booking
    ↓
Update Slot
    ↓
Insert Outbox Event
    ↓
Commit
```

Then:

``` text
Outbox Processor
      ↓
Read PENDING event
      ↓
Email Handler
+
Real-Time Handler
      ↓
Mark event processed
```

This prevents notification intent from being lost if the server crashes
immediately after a booking transaction.

------------------------------------------------------------------------

# 69. Outbox Processing

Do not introduce:

-   Redis
-   Kafka
-   RabbitMQ
-   AWS SQS
-   Paid queue services

Use MongoDB for the outbox.

Process events safely and make handlers idempotent where practical.

------------------------------------------------------------------------

# 70. Independent Notifications

Email and Socket.IO are independent.

This is valid:

``` text
BOOKING_APPROVED
    ├── Email → FAILED
    └── Socket.IO → SUCCESS
```

Also valid:

``` text
BOOKING_APPROVED
    ├── Email → SUCCESS
    └── Socket.IO → FAILED
```

Neither failure changes:

``` text
booking.status = APPROVED
```

------------------------------------------------------------------------

# 71. OTP Exception

OTP email is required for account verification.

If OTP email delivery fails, clearly report:

``` text
Unable to send verification email. Please try again.
```

Do not expose OTP values in API responses.

------------------------------------------------------------------------

# 72. Admin Workflow

The complete admin workflow:

``` text
Admin Login
     ↓
Dashboard
     ↓
See Pending Booking
     ↓
Open Booking
     ↓
Review Client + Slot
     ↓
Approve / Reject
     ↓
Backend validates state
     ↓
MongoDB transaction
     ↓
Booking updated
     ↓
Slot updated
     ↓
Notification event
     ↓
Email + Socket.IO
     ↓
Client sees updated status
```

The admin's main task should take under 30 seconds:

``` text
Login
↓
See Pending Booking
↓
Open
↓
Review
↓
Approve
↓
Done
```

------------------------------------------------------------------------

# 73. Client Booking Flow

``` text
Visit Website
     ↓
Signup
     ↓
Receive OTP
     ↓
Verify Email
     ↓
Login
     ↓
View Available Slots
     ↓
Choose Reading Type
     ↓
Choose Date/Time
     ↓
Submit Booking
     ↓
Booking = PENDING
     ↓
Receive Confirmation Email
     ↓
Wait for Admin
     ↓
Admin Approves
     ↓
Booking = APPROVED
     ↓
Approval Email
     ↓
Socket.IO Update
     ↓
Client Dashboard Updates
     ↓
Attend Reading
     ↓
Admin Marks COMPLETED
```

------------------------------------------------------------------------

# 74. Security Requirements

Implement:

-   bcrypt password hashing
-   Secure JWT authentication
-   HTTP-only cookies where appropriate
-   Secure/SameSite cookie configuration
-   Helmet
-   CORS restrictions
-   Rate limiting
-   Input validation
-   MongoDB sanitization
-   Centralized error handling
-   Authorization middleware
-   OTP expiration
-   OTP attempt limits
-   Login rate limiting
-   Password reset rate limiting

Never expose:

``` text
passwordHash
JWT secrets
SMTP credentials
OTP values
private environment variables
```

------------------------------------------------------------------------

# 75. API Authorization

Every protected API must verify:

1.  Authentication
2.  User identity
3.  User role
4.  Resource ownership where required
5.  State transition validity

For example, a user must only be able to retrieve their own bookings.

Never rely on:

``` text
userId
```

sent by the client to determine ownership.

Use the authenticated user identity from the server-side session/JWT.

------------------------------------------------------------------------

# 76. Frontend UI Components

Create reusable:

``` text
Button
Input
Modal
Table
Badge
Card
Navbar
Sidebar
Toast
LoadingSpinner
ConfirmDialog
DatePicker
SlotPicker
```

------------------------------------------------------------------------

# 77. Status Badges

Use clear visual statuses:

``` text
PENDING
APPROVED
REJECTED
CANCELLED
COMPLETED
```

Use appropriate colors and accessible contrast.

------------------------------------------------------------------------

# 78. Loading and Empty States

Implement:

-   Loading states
-   Error states
-   Empty states
-   Success notifications
-   Toast messages

Examples:

``` text
No upcoming bookings.
```

``` text
No pending booking requests.
```

``` text
No available slots.
```

------------------------------------------------------------------------

# 79. Profile Page

Client can view/update:

``` text
Name
Phone
Email
```

Email should remain read-only after verification unless a secure
email-change verification flow is added.

------------------------------------------------------------------------

# 80. Booking History

Client sees:

``` text
Booking ID
Reading Type
Date
Time
Status
Created Date
```

Clicking a booking shows full details.

------------------------------------------------------------------------

# 81. Admin Search and Filters

Booking management should support:

## Status

``` text
All
Pending
Approved
Rejected
Completed
Cancelled
```

## Date

``` text
Today
Tomorrow
This Week
Custom Date
```

## Reading Type

``` text
All
General
Love
Career
Finance
```

## Search

Search by:

``` text
Client Name
Email
Booking ID
```

Backend should handle scalable filtering/search.

------------------------------------------------------------------------

# 82. Error Handling

Use centralized error handling.

Do not expose stack traces in production.

Use consistent status codes.

Examples:

``` text
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
429 Too Many Requests
500 Internal Server Error
```

------------------------------------------------------------------------

# 83. Transaction and Notification Rules

Always follow:

``` text
1. Validate request
2. Authenticate actor
3. Validate state transition
4. Execute database transaction
5. Store notification/event intent
6. Commit
7. Return success
8. Process email separately
9. Process Socket.IO separately
10. Log failures
11. Retry important email failures safely
```

Never:

``` text
Email failure → rollback booking
```

Never:

``` text
Socket failure → rollback booking
```

Never:

``` text
Frontend state → determine backend booking state
```

Never:

``` text
Keep MongoDB transaction open while waiting for Gmail
```

------------------------------------------------------------------------

# 84. Testing Requirements

Test every valid transition:

``` text
PENDING → APPROVED
PENDING → REJECTED
PENDING → CANCELLED

APPROVED → COMPLETED
APPROVED → CANCELLED
```

Test invalid transitions:

``` text
REJECTED → APPROVED
REJECTED → CANCELLED
REJECTED → COMPLETED

CANCELLED → APPROVED
CANCELLED → COMPLETED

COMPLETED → APPROVED
COMPLETED → CANCELLED

APPROVED → PENDING
APPROVED → REJECTED
```

Also test:

-   Signup
-   OTP verification
-   Expired OTP
-   OTP attempts
-   Resend OTP
-   Login
-   Invalid password
-   Password reset
-   Protected routes
-   Admin authorization
-   Client authorization
-   Booking creation
-   Double booking
-   Concurrent slot booking
-   Approval
-   Rejection
-   Cancellation
-   Completion
-   Email failure
-   Email retry
-   Socket.IO failure
-   Socket.IO reconnection
-   Outbox processing
-   Duplicate event handling

------------------------------------------------------------------------

# 85. Final Source-of-Truth Architecture

``` text
                    ┌───────────────────┐
                    │     MongoDB       │
                    │ Source of Truth   │
                    └─────────┬─────────┘
                              │
                 ┌────────────┴────────────┐
                 │                         │
                 ▼                         ▼
        ┌────────────────┐       ┌────────────────┐
        │ Client Frontend│       │ Admin Dashboard│
        └───────┬────────┘       └───────┬────────┘
                │                        │
                └─────────┬──────────────┘
                          │
                     REST API
                          +
                      Socket.IO
```

MongoDB is authoritative.

REST APIs retrieve authoritative data.

Socket.IO tells the frontend that something changed.

The frontend then retrieves the latest state.

------------------------------------------------------------------------

# 86. Complete Processing Architecture

``` text
                         CLIENT / ADMIN
                               │
                               ▼
                            REST API
                               │
                               ▼
                    BOOKING STATE SERVICE
                               │
                               ▼
                       MongoDB Transaction
                         │            │
                         │            └── Outbox Event
                         │
                         ▼
                       COMMIT
                         │
                         ▼
                    HTTP SUCCESS


                     OUTBOX PROCESSOR
                           │
                 ┌─────────┴─────────┐
                 ▼                   ▼
           EMAIL HANDLER       REAL-TIME HANDLER
                 │                   │
                 ▼                   ▼
             Nodemailer           Socket.IO
                 │                   │
                 ▼                   ▼
             Gmail SMTP            Client
```

------------------------------------------------------------------------

# 87. Frontend Authentication State

Use an authentication context/store containing:

``` text
user
isAuthenticated
loading
```

After login:

``` text
USER → /dashboard
ADMIN → /admin/dashboard
```

Redirect unauthenticated users away from protected pages.

Redirect normal users away from admin pages.

------------------------------------------------------------------------

# 88. Free Infrastructure

The application should work with:

``` text
Frontend:
React + Vite + Tailwind

Backend:
Node + Express

Database:
MongoDB Atlas Free Tier

Email:
Nodemailer + Gmail SMTP

Real-Time:
Socket.IO

Authentication:
JWT + bcrypt

Repository:
Git + GitHub

Editor:
VS Code
```

Do not require paid services.

------------------------------------------------------------------------

# 89. No Payment System in Initial Product

Do not add:

-   Stripe
-   Razorpay
-   PayPal
-   Payment gateway

The booking system is currently:

``` text
Book
→ Pending
→ Admin Review
→ Approved/Rejected
```

Payment can be added later without redesigning the booking state
machine.

------------------------------------------------------------------------

# 90. No Unnecessary Infrastructure

Do not add:

-   Redis
-   Kafka
-   RabbitMQ
-   Elasticsearch
-   Kubernetes
-   Microservices
-   Paid queues
-   Paid monitoring
-   Paid analytics

unless a genuine future requirement exists.

For this application:

``` text
React
+
Express
+
MongoDB
+
Socket.IO
+
Nodemailer
```

is sufficient.

------------------------------------------------------------------------

# 91. UI/UX Principles

The client booking process should be extremely simple:

``` text
Choose Reading
      ↓
Choose Date
      ↓
Choose Time
      ↓
Confirm Booking
```

The admin process should be:

``` text
Open Dashboard
      ↓
See Pending Requests
      ↓
Open Booking
      ↓
Review
      ↓
Approve / Reject
```

Do not add unnecessary screens or configuration.

------------------------------------------------------------------------

# 92. Responsive Design

The entire application must work on:

-   Desktop
-   Laptop
-   Tablet
-   Mobile

Admin dashboard should adapt to mobile using a collapsible sidebar.

Client booking should be particularly mobile-friendly.

------------------------------------------------------------------------

# 93. Accessibility

Use:

-   Proper labels
-   Keyboard navigation
-   Accessible buttons
-   Sufficient contrast
-   Focus states
-   Meaningful error messages
-   ARIA attributes where appropriate

Do not rely solely on color to communicate booking status.

------------------------------------------------------------------------

# 94. README Requirements

The generated project README should explain:

-   Project overview
-   Features
-   Architecture
-   Technology stack
-   Folder structure
-   MongoDB setup
-   Environment variables
-   Gmail SMTP setup
-   Installation
-   Running frontend
-   Running backend
-   Creating admin
-   API overview
-   Booking state machine
-   Email architecture
-   Real-time architecture
-   Security
-   Testing
-   Deployment using free tiers
-   Cost limitations

------------------------------------------------------------------------

# 95. Final Implementation Rules

The final system must follow these principles:

### 1. Backend is authoritative

Frontend never decides permanent state.

### 2. MongoDB is the source of truth

Do not use localStorage as a database.

### 3. Booking state is explicit

Use the defined finite state machine.

### 4. State transitions are centralized

Use a booking state service.

### 5. Database changes are atomic

Keep booking and slot states consistent.

### 6. Notifications are side effects

Email and Socket.IO do not control booking state.

### 7. Email failures do not rollback bookings

A confirmed booking stays confirmed.

### 8. Socket failures do not rollback bookings

REST remains the fallback.

### 9. Socket.IO is a signal

Refetch authoritative data after important events.

### 10. Security is server-side

Never trust frontend roles, IDs or status values.

### 11. Keep the stack free

Prefer open-source/free-tier solutions.

### 12. Keep the architecture upgradeable

The application should be easy to move to paid infrastructure later
without rewriting the core business logic.

------------------------------------------------------------------------

# 96. Final User Experience

## Client

``` text
Visit Website
     ↓
Signup
     ↓
OTP Email
     ↓
Verify Email
     ↓
Login
     ↓
Dashboard
     ↓
Available Slots
     ↓
Choose Reading
     ↓
Book
     ↓
Booking = PENDING
     ↓
Confirmation Email
     ↓
Admin Review
     ↓
APPROVED / REJECTED
     ↓
Email Notification
     ↓
Real-Time Dashboard Update
     ↓
Reading
     ↓
COMPLETED
```

## Admin

``` text
Admin Login
     ↓
Dashboard
     ↓
New/Pending Booking
     ↓
View Client + Booking
     ↓
Approve / Reject
     ↓
Database Transaction
     ↓
Email + Socket.IO
     ↓
Client Updated
     ↓
Manage Upcoming Reading
     ↓
Mark Completed
```

The final application should feel like a polished professional booking
platform, not a college-project demo, while remaining simple enough to
operate and inexpensive enough to run on free infrastructure.
#   T a r o t - R e a d i n g  
 