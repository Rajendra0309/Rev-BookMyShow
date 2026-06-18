# RevBookMyShow – Movie Ticket Booking System
> A MERN Stack mini project built as part of CBA training program.

---

## 📌 Project Overview
**RevBookMyShow** is a movie ticket booking system that allows customers to browse movies, check show timings, select seats, and book tickets. Theatre Administrators can manage theatres, screens, movies, shows, pricing, and monitor bookings.

---

## 👥 Team & Role Distribution

| Member      | Role / Epic                                | Branch Prefix                      |
|-------------|--------------------------------------------|------------------------------------|
| **Rajendra**   | Project Architecture & Authentication   | `feature/project-setup-auth`       |
| **Madhusudan** | Movie Management Module                 | `feature/movie-management`         |
| **Samarth**    | Theatre & Screen Management Module      | `feature/theatre-screen-management`|
| **Samrudhi**   | Show & Booking Management Module        | `feature/show-booking-management`  |
| **Spoorthy**   | Reporting & Notification Module         | `feature/reporting-notification`   |

---

## 🚀 Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React.js (Vite)                   |
| Backend    | Node.js + Express.js              |
| Database   | MongoDB + Mongoose                |
| Auth       | JWT & Firebase (Google OAuth 2.0) |
| Payments   | Razorpay Integration              |
| Uploads    | Multer + AWS SDK v3 (S3 Bucket)   |
| Delivery   | Nodemailer + PDFKit + QR Code     |

---

## 📁 Project Structure

```
RevBookMyShow/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── models/
│   │   ├── User.js
│   │   ├── Movie.js
│   │   ├── Theatre.js
│   │   ├── Screen.js
│   │   ├── Seat.js
│   │   ├── Show.js               # ticketPrice: { Regular, Premium, VIP }
│   │   ├── Booking.js
│   │   ├── BookingSeat.js
│   │   └── Notification.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── movieController.js
│   │   ├── theatreController.js
│   │   ├── showController.js
│   │   ├── bookingController.js
│   │   └── reportController.js
│   ├── utils/                    # Shared Helper Functions
│   │   ├── pdfGenerator.js       # A6 PDF & QR Compiler
│   │   ├── emailService.js       # SMTP + IPv4 Resolver Dispatcher
│   │   └── s3Upload.js           # AWS S3 Poster Uploader
│   ├── routes/
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT verify + role check
│   ├── .env                      # (DO NOT commit this file)
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── MovieList.jsx     # Browse & search movies
│   │   │   ├── MovieDetails.jsx  # Movie info + available shows
│   │   │   ├── TheatreList.jsx   # Customer theatre browser
│   │   │   ├── TheatreDetail.jsx # Screen & seat viewer (read-only)
│   │   │   ├── SeatSelection.jsx # Seat map + booking flow
│   │   │   ├── BookingHistory.jsx
│   │   │   ├── AdminCreateShow.jsx  # Admin Panel (Movies, Shows, Theatres)
│   │   │   └── Reports.jsx       # Revenue, Occupancy, Notifications
│   │   ├── components/
│   │   │   └── Navbar.jsx
│   │   ├── services/             # Axios API call functions
│   │   │   ├── authService.js
│   │   │   ├── movieService.js
│   │   │   ├── theatreService.js
│   │   │   ├── showService.js
│   │   │   └── bookingService.js
│   │   ├── App.jsx               # All routes defined here
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
├── docs/                         # API testing guides per module
├── .gitignore
└── README.md
```

---

## 🌐 Application Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/login` | Public | Login page |
| `/register` | Public | Register page |
| `/movies` | All users | Browse & search movies |
| `/movies/:id` | All users | Movie details + available shows |
| `/theatres` | Customer only | Browse theatres |
| `/theatres/:id` | Customer only | Theatre screens & seats (read-only) |
| `/booking` | Customer | Seat selection & booking |
| `/bookings` | Customer | My booking history |
| `/admin/show/create` | Admin only | Admin panel (movies, shows, theatres) |
| `/reports` | All logged-in | Reports (admin) + Notifications (customer) |

---

## ⚙️ Getting Started (For All Teammates)

### Prerequisites
- Node.js v18+
- MongoDB (local) or MongoDB Atlas account
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/Rajendra0309/Rev-BookMyShow.git
cd Rev-BookMyShow
```

### 2. Setup Backend
```bash
cd backend
npm install
```
Create a `.env` file inside `backend/`:
```
MONGO_URI=mongodb://localhost:27017/revbookmyshow
JWT_SECRET=your_jwt_secret_key
PORT=5000
```
Run the backend:
```bash
npx nodemon server.js
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs on **http://localhost:5173**

---

## 🎟️ Key Features

### Customer
- Browse and search movies (by title, genre, language)
- View available shows per movie grouped by theatre
- Visual seat map with colour-coded Regular / Premium / VIP seats
- Per-seat-type pricing (different price per seat category)
- Booking confirmation with seat breakdown and total
- Booking history and cancellation (before show start only)
- In-app notifications for bookings and cancellations
- Browse theatres and view their screens/seats

### Admin Panel (single page — 3 tabs)
| Tab | Manages |
|-----|---------|
| Movie Management | Add / Edit / Delete movies (with local S3 file uploads) |
| Show Management | Create / Edit / Cancel shows with per-type pricing |
| Theatre Management | Add/Edit/Delete theatres → screens → configure seats |

### 🛡️ Production & Cloud Upgrades (Completed)
- **Dual OAuth System:** Integrates native MERN authentication alongside Google Sign-In via Firebase Auth.
- **Razorpay Payments:** End-to-end checkout integration supporting secure payment gateway processing.
- **PDF Ticket Generation:** In-memory generation of A6 format PDF tickets with full metadata styling.
- **Embedded QR Code Verification:** Generates verification QR codes embedded inside the ticket PDF.
- **Robust SMTP Notification:** Automated Nodemailer emailing with forced IPv4 DNS lookup to bypass IPv6 limits.
- **Render Firewall Bypass (Port 2525):** Configured Brevo/SendGrid Port 2525 relay supporting free-tier outbound routing.
- **AWS S3 Poster Uploads:** Direct admin file upload to AWS S3 buckets with automatic ACL fallback and live image preview.

---

## 🌿 Git Workflow (MANDATORY for all teammates)

```bash
# 1. Always pull latest main before starting work
git checkout main
git pull origin main

# 2. Create / switch to your feature branch
git checkout -b feature/your-module-name

# 3. Make changes, then commit
git add .
git commit -m "feat: Day1 - description of what you did (YourName)"

# 4. Push your branch
git push origin feature/your-module-name

# 5. Create a Pull Request on GitHub for review
```

---

## 📚 API Documentation & Setup Guides

See the `/docs` folder for detailed API testing and cloud configuration guides:

| File | Module / Purpose |
|------|------------------|
| `AUTH_TESTING.md` | Register, Login, Forgot Password |
| `MOVIE_TESTING.md` | Movie CRUD |
| `THEATRE_TESTING.md` | Theatre, Screen & Seat management |
| `BOOKING_TESTING.md` | Show creation & Booking flow |
| `REPORTS_TESTING.md` | Revenue, Occupancy & Notifications |
| `DUAL_OAUTH_SETUP.md` | Firebase & Google OAuth 2.0 Integration |
| `PAYMENT_GATEWAY_SETUP.md` | Razorpay Checkout Settings |
| `TICKET_NOTIFICATION_SETUP.md` | SMTP Ports & Brevo Port 2525 Relay Setup |
| `TICKET_NOTIFICATION_TESTING.md` | PDF & QR Code Verification Guides |
| `AWS_S3_POSTER_UPLOAD_SETUP.md` | AWS IAM & S3 Bucket Policy Configuration |

> **Base URL:** `http://localhost:5000/api`  
> **Frontend URL:** `http://localhost:5173`
