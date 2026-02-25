# 📘 RevBookMyShow – Team Project Guide

> **This document is the single source of truth for all teammates.**  
> Read this fully before you write a single line of code.

---

## 📌 Project Overview

**RevBookMyShow** is a movie ticket booking system built using the **MERN Stack** as a CBA mini project.

| Item | Details |
|------|---------|
| **App Name** | RevBookMyShow |
| **Type** | Full-Stack Web App (MERN) |
| **GitHub Repo** | https://github.com/Rajendra0309/Rev-BookMyShow |
| **Sprint Duration** | 7 Days |
| **Sprint Start** | 25 February 2026 |

### What the App Does
- **Customers** → Register, login, browse movies, select seats, book/cancel tickets, view booking history
- **Theatre Admins** → Manage theatres, screens, movies, shows, pricing, view reports

---

## 👥 Team Roles & Responsibilities

| Member | Epic | Responsibility | Git Branch |
|--------|------|---------------|-----------|
| **Rajendra** | Epic 1 | Project Architecture & Authentication | `feature/project-setup-auth` |
| **Madhusudan** | Epic 2 | Movie Management Module | `feature/movie-management` |
| **Samarth** | Epic 3 | Theatre & Screen Management | `feature/theatre-screen-management` |
| **Samrudhi** | Epic 4 | Show & Booking Management | `feature/show-booking-management` |
| **Spoorthy** | Epic 5 | Reporting & Notification | `feature/reporting-notification` |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js (Vite) — minimal UI |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose ODM |
| Authentication | JWT (JSON Web Tokens) |
| Password Security | bcryptjs |
| HTTP Client (FE) | Axios |
| Routing (FE) | React Router DOM |

---

## 🏛️ Application Architecture

The system follows a **4-Layer Architecture**:

```
┌──────────────────────────┐
│   Presentation Layer      │  ← React.js (minimal UI pages)
│   (Frontend - Vite)       │
└────────────┬─────────────┘
             │ HTTP REST API calls (Axios)
┌────────────▼─────────────┐
│   Controller Layer        │  ← Express Route Handlers
│   (backend/controllers/)  │
└────────────┬─────────────┘
             │
┌────────────▼─────────────┐
│   Service Layer           │  ← Business Logic
│   (backend/services/)     │
└────────────┬─────────────┘
             │
┌────────────▼─────────────┐
│   Repository/Data Layer   │  ← Mongoose Models
│   (backend/models/)       │
└────────────┬─────────────┘
             │
┌────────────▼─────────────┐
│   Database Layer          │  ← MongoDB
└──────────────────────────┘
```

---

## 📁 Complete Project Folder Structure

```
RevBookMyShow/
│
├── backend/                          ← Node.js + Express API
│   ├── config/
│   │   └── db.js                     ← MongoDB connection
│   │
│   ├── models/                       ← All Mongoose schemas (created by Rajendra)
│   │   ├── User.js                   ← Auth (Rajendra)
│   │   ├── Movie.js                  ← Movies (Madhusudan uses this)
│   │   ├── Theatre.js                ← Theatre (Samarth uses this)
│   │   ├── Screen.js                 ← Screen (Samarth uses this)
│   │   ├── Seat.js                   ← Seat (Samarth uses this)
│   │   ├── Show.js                   ← Show (Samrudhi uses this)
│   │   ├── Booking.js                ← Booking (Samrudhi uses this)
│   │   ├── BookingSeat.js            ← BookingSeat (Samrudhi uses this)
│   │   └── Notification.js           ← Notification (Spoorthy uses this)
│   │
│   ├── controllers/                  ← Business logic per module
│   │   ├── authController.js         ← Rajendra
│   │   ├── movieController.js        ← Madhusudan
│   │   ├── theatreController.js      ← Samarth
│   │   ├── showController.js         ← Samrudhi
│   │   ├── bookingController.js      ← Samrudhi
│   │   └── reportController.js       ← Spoorthy
│   │
│   ├── routes/                       ← Express route definitions
│   │   ├── authRoutes.js             ← Rajendra
│   │   ├── movieRoutes.js            ← Madhusudan
│   │   ├── theatreRoutes.js          ← Samarth
│   │   ├── showRoutes.js             ← Samrudhi
│   │   ├── bookingRoutes.js          ← Samrudhi
│   │   └── reportRoutes.js           ← Spoorthy
│   │
│   ├── middleware/
│   │   └── authMiddleware.js         ← JWT verify (Rajendra) — used by ALL teammates
│   │
│   ├── .env                          ← ⚠️ NEVER commit. Create locally.
│   ├── package.json
│   └── server.js                     ← Main entry point
│
├── frontend/                         ← React Vite (minimal UI)
│   ├── src/
│   │   ├── pages/                    ← Each teammate owns their page(s)
│   │   │   ├── Login.jsx             ← Rajendra
│   │   │   ├── Register.jsx          ← Rajendra
│   │   │   ├── MovieList.jsx         ← Madhusudan
│   │   │   ├── MovieDetails.jsx      ← Madhusudan
│   │   │   ├── TheatreList.jsx       ← Samarth
│   │   │   ├── SeatSelection.jsx     ← Samrudhi
│   │   │   ├── BookingConfirm.jsx    ← Samrudhi
│   │   │   ├── BookingHistory.jsx    ← Samrudhi
│   │   │   └── Reports.jsx           ← Spoorthy
│   │   │
│   │   ├── components/               ← Shared UI components
│   │   │   └── Navbar.jsx            ← Rajendra (shared by all)
│   │   │
│   │   ├── services/                 ← Axios API call functions
│   │   │   ├── authService.js        ← Rajendra
│   │   │   ├── movieService.js       ← Madhusudan
│   │   │   ├── theatreService.js     ← Samarth
│   │   │   ├── bookingService.js     ← Samrudhi
│   │   │   └── reportService.js      ← Spoorthy
│   │   │
│   │   ├── App.jsx                   ← Routes (Rajendra sets up, others add their routes)
│   │   └── main.jsx
│   │
│   ├── index.html
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🗃️ Database Schema (ERD)

All models are in `backend/models/`. Here is the relationship overview:

```
User ──────────── Booking (1 user → many bookings)
                      │
Show ──────────── Booking (1 show → many bookings)
  │                   │
Movie               BookingSeat (1 booking → many seats)
Screen ────── Seat ──┘
  │
Theatre
```

### Models Summary

| Model | Key Fields | Used By |
|-------|-----------|---------|
| `User` | name, email, password, role (Customer/Admin), securityQuestion | Rajendra |
| `Movie` | title, genre, language, duration, rating, description | Madhusudan |
| `Theatre` | name, location, city | Samarth |
| `Screen` | theatreId (FK), screenName, totalSeats | Samarth |
| `Seat` | screenId (FK), seatNumber, seatType (Regular/Premium/VIP) | Samarth |
| `Show` | movieId (FK), screenId (FK), showDate, showTime, ticketPrice, status | Samrudhi |
| `Booking` | userId (FK), showId (FK), bookingDate, totalAmount, status | Samrudhi |
| `BookingSeat` | bookingId (FK), seatId (FK) | Samrudhi |
| `Notification` | userId (FK), message, status (Unread/Read) | Spoorthy |

---

## ⚙️ Local Setup (Do This First — All Teammates)

### Prerequisites
- Node.js v18+
- MongoDB installed locally (or MongoDB Atlas account)
- Git installed
- VS Code

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/Rajendra0309/Rev-BookMyShow.git
cd Rev-BookMyShow
```

---

### Step 2: Setup Backend
```bash
cd backend
npm install
```

Create a `.env` file inside `backend/` folder (**do this manually, never commit this file**):
```
MONGO_URI=mongodb://localhost:27017/revbookmyshow
JWT_SECRET=revbookmyshow_secret_key_2026
PORT=5000
```

Run the backend server:
```bash
npx nodemon server.js
```
✅ You should see:
```
Server running on port 5000
MongoDB Connected
```

Test it: Open browser → `http://localhost:5000/api/auth/test`  
You should see: `{ "msg": "Auth route working" }`

---

### Step 3: Setup Frontend
```bash
cd ../frontend
npm install
npm run dev
```
✅ Frontend runs on: **http://localhost:5173**

---

## 🌿 Git Workflow — MANDATORY FOR ALL

> ⚠️ **NEVER push directly to `main`.** Always work on your feature branch.

### Daily Workflow
```bash
# Step 1: Pull latest main first (do this every day before starting work)
git checkout main
git pull origin main

# Step 2: Switch to your feature branch
git checkout feature/your-module-name
# If branch doesn't exist yet:
git checkout -b feature/your-module-name

# Step 3: Merge latest main into your branch (to stay updated)
git merge main

# Step 4: Do your work...

# Step 5: Stage and commit
git add .
git commit -m "feat: Day2 - Add movie CRUD APIs (Madhusudan)"

# Step 6: Push your branch
git push origin feature/your-module-name

# Step 7: Create Pull Request on GitHub
```

### Commit Message Format
```
feat: Day<N> - <what you did> (<YourName>)
fix:  Day<N> - <what you fixed> (<YourName>)
```

Examples:
```
feat: Day2 - Add user registration and login APIs (Rajendra)
feat: Day2 - Add movie schema and CRUD APIs (Madhusudan)
fix:  Day3 - Fix seat availability logic (Samrudhi)
```

---

## 📋 Each Teammate's Task Breakdown

### 🔵 Rajendra — Epic 1: Project Architecture & Authentication

| Day | Task | Description |
|-----|------|-------------|
| Day 1 | ✅ Setup MERN project structure | Backend + frontend scaffold, all 9 models |
| Day 1 | ✅ Database schema design | All Mongoose models created |
| Day 2 | User Registration API | `POST /api/auth/register` |
| Day 2 | Login API with JWT | `POST /api/auth/login` → returns JWT token |
| Day 3 | Role-based access control | `authMiddleware.js` → protect routes by role |
| Day 4 | Change password & security questions | `POST /api/auth/change-password` |
| Day 7 | Integration testing | Test all modules together |

**Files to create:**
- `backend/controllers/authController.js`
- `backend/routes/authRoutes.js`
- `backend/middleware/authMiddleware.js`
- `frontend/src/pages/Login.jsx`
- `frontend/src/pages/Register.jsx`

---

### 🟢 Madhusudan — Epic 2: Movie Management Module

| Day | Task | Description |
|-----|------|-------------|
| Day 2 | Movie schema already created ✅ | Use `backend/models/Movie.js` |
| Day 2 | Add Movie API | `POST /api/movies` (Admin only) |
| Day 3 | Update Movie API | `PUT /api/movies/:id` (Admin only) |
| Day 3 | Delete Movie API | `DELETE /api/movies/:id` (Admin only) |
| Day 4 | Movie search & filter API | `GET /api/movies?genre=&language=` |
| Day 5 | Movie details UI | `frontend/src/pages/MovieList.jsx` + `MovieDetails.jsx` |

**Files to create:**
- `backend/controllers/movieController.js`
- `backend/routes/movieRoutes.js`
- `frontend/src/pages/MovieList.jsx`
- `frontend/src/pages/MovieDetails.jsx`
- `frontend/src/services/movieService.js`

**Register route in `server.js`** (ask Rajendra to add):
```js
app.use('/api/movies', require('./routes/movieRoutes'));
```

---

### 🟡 Samarth — Epic 3: Theatre & Screen Management

| Day | Task | Description |
|-----|------|-------------|
| Day 2 | Theatre CRUD APIs | `GET/POST/PUT/DELETE /api/theatres` |
| Day 3 | Screen management | `POST /api/theatres/:id/screens` |
| Day 4 | Seat layout configuration | `POST /api/screens/:id/seats` |
| Day 4 | Seat types (Regular/Premium/VIP) | Already in `Seat` model |
| Day 5 | Seating capacity logic | Validate total seats on screen |

**Files to create:**
- `backend/controllers/theatreController.js`
- `backend/routes/theatreRoutes.js`
- `frontend/src/pages/TheatreList.jsx`
- `frontend/src/services/theatreService.js`

**Register route in `server.js`** (ask Rajendra to add):
```js
app.use('/api/theatres', require('./routes/theatreRoutes'));
```

---

### 🟠 Samrudhi — Epic 4: Show & Booking Management

| Day | Task | Description |
|-----|------|-------------|
| Day 2 | Show scheduling API | `POST /api/shows` (Admin) |
| Day 3 | Pricing logic | weekday vs weekend pricing in Show model |
| Day 3 | Seat availability matrix | `GET /api/shows/:id/seats` |
| Day 4 | Booking confirmation | `POST /api/bookings` |
| Day 5 | Ticket cancellation | `PUT /api/bookings/:id/cancel` |
| Day 5 | Booking history | `GET /api/bookings/user/:userId` |

**Files to create:**
- `backend/controllers/showController.js`
- `backend/controllers/bookingController.js`
- `backend/routes/showRoutes.js`
- `backend/routes/bookingRoutes.js`
- `frontend/src/pages/SeatSelection.jsx`
- `frontend/src/pages/BookingConfirm.jsx`
- `frontend/src/pages/BookingHistory.jsx`
- `frontend/src/services/bookingService.js`

**Register routes in `server.js`** (ask Rajendra to add):
```js
app.use('/api/shows', require('./routes/showRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
```

---

### 🔴 Spoorthy — Epic 5: Reporting & Notification

| Day | Task | Description |
|-----|------|-------------|
| Day 2 | Notification logic | Create notification on booking/cancellation |
| Day 3 | Revenue report API | `GET /api/reports/revenue` |
| Day 4 | Theatre occupancy report | `GET /api/reports/occupancy` |
| Day 4 | Booking & cancellation report | `GET /api/reports/bookings` |
| Day 5 | UI navigation & flow | `frontend/src/pages/Reports.jsx` |

**Files to create:**
- `backend/controllers/reportController.js`
- `backend/routes/reportRoutes.js`
- `frontend/src/pages/Reports.jsx`
- `frontend/src/services/reportService.js`

**Register route in `server.js`** (ask Rajendra to add):
```js
app.use('/api/reports', require('./routes/reportRoutes'));
```

---

## 🔐 How to Use Auth Middleware (All Teammates)

Once Rajendra completes `authMiddleware.js` on Day 3, all teammates must protect their admin-only routes like this:

```js
// In your routes file
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/', protect, adminOnly, createMovie);   // Admin only
router.get('/', protect, getAllMovies);               // Any logged-in user
```

---

## 📡 API Base URLs

| Service | URL |
|---------|-----|
| Backend API | `http://localhost:5000/api` |
| Frontend | `http://localhost:5173` |

---

## 📅 7-Day Sprint Schedule

| Day | Rajendra | Madhusudan | Samarth | Samrudhi | Spoorthy |
|-----|----------|-----------|---------|---------|---------|
| **1** | ✅ Project setup + All DB schemas | Onboard & pull | Onboard & pull | Onboard & pull | Onboard & pull |
| **2** | Register & Login APIs | Movie CRUD APIs | Theatre CRUD APIs | Show scheduling API | Notification logic |
| **3** | Role-based access control | Update/Delete Movie | Screen & Seat APIs | Seat availability | Revenue report API |
| **4** | Change password & security Q | Search & filter API | Seat type & capacity | Booking logic | Occupancy & reports |
| **5** | Login/Register UI pages | Movie UI pages | Theatre UI pages | Seat & Booking UI | Reports UI page |
| **6** | Bug fixes + PR reviews | Bug fixes + PR reviews | Bug fixes + PR reviews | Bug fixes + PR reviews | Bug fixes + PR reviews |
| **7** | Integration testing + Final merge | Final merge | Final merge | Final merge | Final merge |

---

## ✅ Definition of Done (Project Complete When)

- [ ] Working MERN application (backend + frontend running)
- [ ] Role-based authentication (Customer / Admin)
- [ ] Movie management implemented (CRUD)
- [ ] Theatre & screen management implemented
- [ ] Show scheduling and seat booking functional
- [ ] Ticket cancellation implemented
- [ ] Revenue report generation
- [ ] Clean GitHub repo — all branches merged to `main`
- [ ] README documentation complete

---

## ❓ Questions & Coordination

- **Slack/WhatsApp**: Tag the person whose module you depend on
- **Conflicts**: Never edit another person's files. Coordinate via PR comments.
- **Common files** (`server.js`, `App.jsx`): Only Rajendra edits these. Request additions via message.
- **Daily standup**: What did I do? What will I do? Any blockers?

---

> 📌 **This document will be updated by Rajendra as the project progresses.**  
> *Last updated: 25 February 2026*
