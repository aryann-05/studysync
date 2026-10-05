# StudySync – A Personalized Adaptive Study Plan Generator
## Backend REST API Documentation (MCA Major Project)

StudySync is an adaptive learning management and automated study plan generation backend built with **Node.js (LTS)**, **Express.js**, and **MongoDB (Mongoose ODM)**. It incorporates a **Modified SuperMemo SM-2 Spaced Repetition Algorithm**, an **Adaptive Learning Engine** that schedules targeted remedial sessions for weak topics, and an **Academic Priority-Based Fall-Behind Reshuffling Engine** to dynamically redistribute missed study workloads without exceeding daily limits.

---

## 1. Technology Stack

- **Runtime**: Node.js 20+ LTS (ES Modules)
- **Web Framework**: Express.js 5.x
- **Database**: MongoDB 5.0+ (Local, Docker, or MongoDB Atlas Cloud)
- **ODM**: Mongoose v8+ with schema validation, indexing, and connection management
- **Authentication**: JWT (JSON Web Tokens) with short-lived access tokens (15m) and refresh tokens (7d)
- **Password Security**: bcrypt with 12 salt rounds
- **File Ingestion**: Multer multipart form-data handling (PDF, DOCX, TXT up to 15 MB)
- **Push Notifications**: Firebase Admin SDK (Firebase Cloud Messaging - FCM)
- **Microservice Communication**: Axios HTTP client for Python NLP microservice (`/parse`)
- **API Security**: Helmet (HTTP security headers), CORS, express-rate-limit (100 req/15 min)
- **Testing**: Jest and Supertest automated test suite

---

## 2. Directory Architecture

```
backend/
│
├── src/
│   ├── config/
│   │   ├── env.js                      # Centralized environment variable validation
│   │   ├── database.js                 # Mongoose connection manager with pooling & retry
│   │   └── firebase.js                 # Firebase Admin SDK initialization with simulation mode
│   │
│   ├── models/                         # Mongoose Schema Models
│   │   ├── User.js                     # User model (email, password_hash, daily_max_hours)
│   │   ├── StudyPlan.js                # StudyPlan model (course_name, start_date, exam_date)
│   │   ├── Topic.js                    # Topic model (parent_topic_id, SM-2 ease_factor, rep)
│   │   ├── StudySession.js             # StudySession model (confidence_score, duration, type)
│   │   ├── FcmToken.js                 # FcmToken model (token, user_id)
│   │   └── index.js                    # Centralized models export
│   │
│   ├── controllers/
│   │   ├── authController.js           # Registration, login, and token refresh
│   │   ├── uploadController.js         # Document upload and file metadata registration
│   │   ├── planController.js           # Study plan generation and schedule reshuffling
│   │   ├── calendarController.js       # Calendar session retrieval with date/range filters
│   │   ├── sessionController.js        # Confidence score rating and SM-2 adaptive triggering
│   │   ├── analyticsController.js      # Mastery score calculation and progress analytics
│   │   └── notificationController.js   # FCM device token registration
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js           # Bearer JWT verification and req.user attachment
│   │   ├── errorMiddleware.js          # Centralized error handler with MongoDB error mappings
│   │   ├── uploadMiddleware.js         # Multer configuration with MIME & size validation
│   │   └── validationMiddleware.js     # Payload validation schemas
│   │
│   ├── routes/
│   │   ├── authRoutes.js               # POST /api/v1/auth/*
│   │   ├── uploadRoutes.js             # POST /api/v1/upload
│   │   ├── planRoutes.js               # POST /api/v1/plans/*
│   │   ├── calendarRoutes.js           # GET  /api/v1/calendar
│   │   ├── sessionRoutes.js            # POST /api/v1/sessions/*
│   │   ├── analyticsRoutes.js          # GET  /api/v1/analytics
│   │   └── notificationRoutes.js       # POST /api/v1/notifications/*
│   │
│   ├── services/
│   │   ├── authService.js              # Password hashing (12 rounds) & JWT generation
│   │   ├── uploadService.js            # File metadata persistence outside web root
│   │   ├── nlpService.js               # Python NLP service client with fallback heuristics
│   │   ├── schedulingService.js        # Capacity calculation ($E_{total} \le C_{total}$) & allocation
│   │   ├── spacedRepetitionService.js  # Modified SM-2 formula ($EF$, repetition, intervals)
│   │   ├── adaptiveLearningService.js  # Weak/Mastered classification & 45m remedial sessions
│   │   ├── reshuffleService.js         # Priority-based overdue session redistribution
│   │   ├── analyticsService.js         # Mastery formula, streaks, completion & coverage
│   │   └── notificationService.js      # FCM token management and 30-min reminder dispatch
│   │
│   ├── utils/
│   │   ├── jwt.js                      # JWT signing and verification helpers
│   │   ├── response.js                 # Standardized SRS JSON response builders
│   │   └── dateUtils.js                # UTC date parsing, difference math, streak algorithms
│   │
│   ├── app.js                          # Express application pipeline configuration
│   └── server.js                       # Server startup, DB verification & graceful shutdown
│
├── uploads/                            # Secure document store (outside public web root)
├── tests/                              # Automated integration and unit test suite (Jest + Supertest)
│   ├── setup.js                        # Test environment initialization
│   ├── mockDb.js                       # In-memory mock database driver for Mongoose
│   ├── testHelpers.js                  # User creation & database reset utilities
│   ├── auth.test.js
│   ├── upload.test.js
│   ├── plan.test.js
│   ├── calendar.test.js
│   ├── confidence.test.js
│   ├── reshuffle.test.js
│   ├── analytics.test.js
│   └── notification.test.js
│
├── .env.example                        # Template for environment configuration
├── package.json                        # NPM project specification and scripts
└── README.md                           # Documentation
```

---

## 3. Database Schema (MongoDB & Mongoose)

All documents maintain explicit UUID string identifiers (`user_id`, `plan_id`, `topic_id`, `session_id`, `token_id`) alongside MongoDB's native `_id` to guarantee 100% contract compatibility across routes and tokens.

### Collections

1. **`users`**:
   - `user_id`: `String (UUID, unique, index)`
   - `email`: `String (required, unique, lowercase, trim, index)`
   - `password_hash`: `String (required)`
   - `full_name`: `String (required, trim)`
   - `daily_max_hours`: `Number (default: 4.0, min: 0.5, max: 24.0)`
   - `created_at`: `Date (default: Date.now)`

2. **`study_plans`**:
   - `plan_id`: `String (UUID, unique, index)`
   - `user_id`: `String (required, index)`
   - `course_name`: `String (required, trim)`
   - `start_date`: `Date (required)`
   - `exam_date`: `Date (required)`
   - `is_active`: `Boolean (default: true)`
   - `created_at`: `Date (default: Date.now)`

3. **`topics`**:
   - `topic_id`: `String (UUID, unique, index)`
   - `plan_id`: `String (required, index)`
   - `parent_topic_id`: `String (default: null, index)`
   - `title`: `String (required, trim)`
   - `estimated_hours`: `Number (default: 1.00)`
   - `difficulty_weight`: `Number (default: 1.00)`
   - `ease_factor`: `Number (default: 2.50)`
   - `repetition_number`: `Number (default: 0)`

4. **`study_sessions`**:
   - `session_id`: `String (UUID, unique, index)`
   - `user_id`: `String (required, index)`
   - `topic_id`: `String (required, index)`
   - `scheduled_date`: `Date (required, index)`
   - `duration_hours`: `Number (required)`
   - `session_type`: `String (enum: ['INITIAL', 'REVIEW', 'REMEDIAL'], default: 'INITIAL')`
   - `is_completed`: `Boolean (default: false)`
   - `confidence_score`: `Number (min: 1, max: 5, default: null)`
   - `completed_at`: `Date (default: null)`

5. **`fcm_tokens`**:
   - `token_id`: `String (UUID, unique, index)`
   - `user_id`: `String (required, index)`
   - `token`: `String (required)`
   - `created_at`: `Date (default: Date.now)`

---

## 4. Algorithms & Mathematical Specifications

### A. Modified SuperMemo SM-2 Spaced Repetition

When a student finishes a study session, they submit a confidence rating $q \in \{1, 2, 3, 4, 5\}$:
- **1** = Complete Failure
- **2** = Poor
- **3** = Medium
- **4** = Good
- **5** = Perfect Mastery

**Ease Factor Update Formula**:
$$EF_{new} = \max\left(1.3, EF_{old} + (0.1 - (5 - q) \times (0.08 + (5 - q) \times 0.02))\right)$$

**Repetition & Review Interval ($I$ in days)**:
- If $q < 3$:
  - Reset `repetition_number = 1`
  - $I = 1$ day
  - Flags need for remedial session
- If $q \ge 3$:
  - Increment `repetition_number = repetition_number + 1`
  - If $n = 1 \implies I = 1$ day
  - If $n = 2 \implies I = 6$ days
  - If $n > 2 \implies I = \text{round}(I_{prev} \times EF_{new})$

### B. Adaptive Learning Engine

- If $q \in \{1, 2\}$ (**Weak Topic**):
  - Increase `difficulty_weight` by $+0.2$
  - Schedule a **45-minute (0.75 hrs) remedial session** within 48 hours (avoiding duplicate uncompleted remedial sessions).
- If $q = 3$ (**Normal Topic**):
  - Standard spaced repetition review session scheduled at $T + I$.
- If $q \in \{4, 5\}$ (**Mastered Topic**):
  - Mark topic as Mastered; expanded review interval allows weaker topics higher study priority.

### C. Fall-Behind Reshuffling Engine

When sessions become overdue (`scheduled_date < current_date AND is_completed = false`), each overdue session is ranked by Academic Urgency Priority:

$$\text{Priority} = \frac{\text{days\_overdue} \times 2.0 + (5 - \text{last\_confidence})}{\text{days\_remaining\_until\_exam}}$$

- Sessions are sorted in descending order of Priority.
- The engine searches forward from the current date to the exam date.
- It inserts each session into the earliest calendar day where:
  $$\text{allocated\_hours\_on\_day} + \text{session\_duration} \le \text{daily\_max\_hours}$$
- If no slot can accommodate the session before the exam date, an `overload_warning = true` flag is returned without deleting the session.

### D. Mastery Score Calculation

$$\text{Mastery} = \left(0.4 \times \frac{\text{CompletedSessions}}{\text{TotalScheduledSessions}} + 0.6 \times \frac{EF - 1.3}{2.5 - 1.3}\right) \times 100$$
- Result is strictly clamped between $0\%$ and $100\%$.

---

## 5. Installation & Setup Instructions

### Prerequisites
- Node.js 20.11.0+ LTS
- MongoDB 5.0+ (Local MongoDB Community Server, Docker, or MongoDB Atlas)
- (Optional) Python 3.10+ for Python NLP microservice

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Environment Configuration
Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```
Update `.env` with your credentials:
```env
PORT=5000
NODE_ENV=development

# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/studysync_db

# Or MongoDB Atlas Cloud:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/studysync_db?retryWrites=true&w=majority

JWT_SECRET=your_super_secret_random_jwt_key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

NLP_SERVICE_URL=http://localhost:8000/parse

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

### Step 3: Run the Backend
```bash
# Development mode (with live reload via nodemon)
npm run dev

# Production mode
npm start
```

---

## 6. Running Tests

Run the complete Jest test suite covering Auth, Upload, Plan Generation, Calendar, Confidence, Reshuffle, Analytics, and Notifications:
```bash
npm test
```

---

## 7. API Reference & Sample Payloads

All protected endpoints require the HTTP header:
```http
Authorization: Bearer <JWT_ACCESS_TOKEN>
```

### Standard Response Format

**Success Response**:
```json
{
  "status": "success",
  "message": "Operation description",
  "data": {}
}
```

**Error Response**:
```json
{
  "status": "error",
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE"
  }
}
```

---

### Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Register new student user | No |
| `POST` | `/api/v1/auth/login` | Authenticate user & return tokens | No |
| `POST` | `/api/v1/auth/refresh` | Refresh access token using refresh token | No |
| `POST` | `/api/v1/upload` | Upload syllabus document (PDF/DOCX/TXT) | **Yes** |
| `POST` | `/api/v1/plans/generate` | Generate adaptive study plan | **Yes** |
| `GET`  | `/api/v1/calendar` | Retrieve scheduled study sessions | **Yes** |
| `POST` | `/api/v1/sessions/confidence` | Submit confidence rating (1-5) & run SM-2 | **Yes** |
| `POST` | `/api/v1/plans/reshuffle` | Prioritize and redistribute overdue sessions | **Yes** |
| `GET`  | `/api/v1/analytics` | Fetch student mastery, progress & streaks | **Yes** |
| `POST` | `/api/v1/notifications/token` | Register FCM device token | **Yes** |
