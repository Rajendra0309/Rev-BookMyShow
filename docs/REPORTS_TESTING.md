# 📊 Reports & Notifications Module – API Testing Guide (Spoorthy – Epic 5)

**Base URL:** `http://localhost:5000/api/reports`  
**Tool:** Thunder Client (VS Code extension) or Postman  
**Always set header:** `Content-Type: application/json`

> ⚠️ All endpoints require a JWT token in the header:  
> `Authorization: Bearer <token>`

---

## Step 0 — Get a JWT Token

### Register a user (if not done):
```
POST http://localhost:5000/api/auth/register
```
```json
{
  "name": "Spoorthy",
  "email": "spoorthy@test.com",
  "password": "spoorthy123",
  "role": "Admin"
}
```

### Login to get token:
```
POST http://localhost:5000/api/auth/login
```
```json
{
  "email": "spoorthy@test.com",
  "password": "spoorthy123"
}
```
✅ Copy the `token` from the response. Use it as `Bearer <token>` in all requests below.  
✅ Copy the `user._id` (or `user.id`) — needed for notification tests.

---

## Task 1 — Notification Logic

### 1a. Get all notifications for a user
```
GET http://localhost:5000/api/reports/notifications/<YOUR_USER_ID>
Authorization: Bearer <token>
```
✅ Expected (empty initially):
```json
{ "success": true, "count": 0, "data": [] }
```

> 💡 Notifications are auto-created when a booking is confirmed or cancelled.  
> Make a booking first (via `POST /api/bookings`) then check here.

### 1b. Mark a notification as Read
```
PUT http://localhost:5000/api/reports/notifications/<NOTIFICATION_ID>/read
Authorization: Bearer <token>
```
✅ Expected:
```json
{ "success": true, "message": "Notification marked as read" }
```

### 1c. Delete a notification
```
DELETE http://localhost:5000/api/reports/notifications/<NOTIFICATION_ID>
Authorization: Bearer <token>
```
✅ Expected:
```json
{ "success": true, "message": "Notification deleted" }
```

---

## Task 2 — Revenue Report API *(Admin only)*

### Basic revenue report:
```
GET http://localhost:5000/api/reports/revenue
Authorization: Bearer <admin_token>
```
✅ Expected:
```json
{
  "success": true,
  "data": {
    "totalRevenue": 0,
    "revenueByMovie": [],
    "revenueByDate": []
  }
}
```

### With date filters:
```
GET http://localhost:5000/api/reports/revenue?startDate=2026-01-01&endDate=2026-12-31
Authorization: Bearer <admin_token>
```

### Filter by a specific movie:
```
GET http://localhost:5000/api/reports/revenue?movieId=<MOVIE_ID>
Authorization: Bearer <admin_token>
```

### ❌ Auth test — Customer token should be rejected:
```
GET http://localhost:5000/api/reports/revenue
Authorization: Bearer <customer_token>
```
✅ Expected: `403 Forbidden` → `{ "msg": "Access denied: Admins only" }`

---

## Task 3 — Theatre Occupancy Report *(Admin only)*

```
GET http://localhost:5000/api/reports/occupancy
Authorization: Bearer <admin_token>
```
✅ Expected (with data):
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "movieTitle": "KGF Chapter 2",
      "theatreName": "PVR Cinemas",
      "city": "Bangalore",
      "showDate": "2026-03-05T00:00:00.000Z",
      "showTime": "6:00 PM",
      "totalSeats": 100,
      "seatsBooked": 75,
      "occupancyPercentage": 75.0
    }
  ]
}
```
✅ Empty when no bookings exist → `{ "success": true, "count": 0, "data": [] }`

---

## Task 4 — Booking & Cancellation Report *(Admin only)*

### Basic report:
```
GET http://localhost:5000/api/reports/bookings
Authorization: Bearer <admin_token>
```
✅ Expected:
```json
{
  "success": true,
  "data": {
    "totalBookings": 0,
    "confirmed": 0,
    "cancelled": 0,
    "cancellationRate": 0,
    "dailyBreakdown": []
  }
}
```

### With date range:
```
GET http://localhost:5000/api/reports/bookings?startDate=2026-03-01&endDate=2026-03-31
Authorization: Bearer <admin_token>
```
✅ Returns counts only for bookings in that date range.

---

## Task 5 — Frontend Reports Page

1. Start frontend: `npm run dev` in `frontend/`
2. Open: `http://localhost:5173`
3. Login as Admin → navigate to `http://localhost:5173/reports`

| Tab | Expected |
|-----|---------|
| 🔔 Notifications | Lists your notifications; unread highlighted in blue |
| 💰 Revenue | Shows revenue totals with date filters |
| 🏟️ Occupancy | Shows seats booked % per show |
| 📋 Bookings | Shows booking/cancellation summary |

### Quick Flow to See Live Data:
1. Create a booking via `POST /api/bookings`
   → Notification auto-created for the user
2. Cancel it via `PUT /api/bookings/:id/cancel`
   → Second notification auto-created
3. Refresh `/reports` → 🔔 tab shows 2 notifications
4. Admin → Revenue tab shows booking amount
5. Admin → Bookings tab shows 1 confirmed + 1 cancelled

---

## End-to-End Test Checklist

| # | Test | Expected |
|---|------|---------|
| 1 | GET `/api/reports/notifications/:userId` | `200 OK`, empty or notification list |
| 2 | PUT `/api/reports/notifications/:id/read` | `200 OK`, status → Read |
| 3 | DELETE `/api/reports/notifications/:id` | `200 OK`, deleted |
| 4 | GET `/api/reports/revenue` (Admin) | `200 OK`, revenue data |
| 5 | GET `/api/reports/revenue` (Customer) | `403 Forbidden` |
| 6 | GET `/api/reports/occupancy` (Admin) | `200 OK`, occupancy array |
| 7 | GET `/api/reports/bookings` (Admin) | `200 OK`, booking stats |
| 8 | Frontend `/reports` logged in as Admin | All 4 tabs visible |
| 9 | Frontend `/reports` logged in as Customer | Only 🔔 Notifications tab |
| 10 | Frontend `/reports` logged out | Redirect to `/login` |
