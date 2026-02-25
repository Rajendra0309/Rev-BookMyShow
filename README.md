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
| Auth       | JWT (JSON Web Tokens)             |

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
│   │   ├── Show.js
│   │   ├── Booking.js
│   │   ├── BookingSeat.js
│   │   └── Notification.js
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── .env                      # (DO NOT commit this file)
│   └── server.js
├── frontend/                 # React Vite (minimal UI)
│   ├── src/
│   │   ├── pages/            # Each teammate adds their page here
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── MovieList.jsx
│   │   │   ├── SeatSelection.jsx
│   │   │   └── Reports.jsx
│   │   ├── components/       # Shared components (Navbar, etc.)
│   │   ├── services/         # Axios API call functions
│   │   ├── App.jsx           # Routes defined here
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
├── .gitignore
└── README.md
```

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

> ⚠️ **Only Rajendra runs this once on Day 1.** Teammates just run `npm install` after pulling.

**Initialize (run once):**
```bash
cd frontend
npm create vite@latest . -- --template react
npm install
npm install axios react-router-dom
```

**Run the frontend:**
```bash
npm run dev
```
Runs on **http://localhost:5173**

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

> **Documentation will be updated daily as the project progresses.**
