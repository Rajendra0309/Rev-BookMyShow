# 🎟️ Show & Booking Module – API Testing Guide

**Owner:** Samrudhi  
**Base URLs:**
- Shows: `http://localhost:5000/api/shows`  
- Bookings: `http://localhost:5000/api/bookings`  

**Tool:** Thunder Client (VS Code) or Postman  
**Always set:** `Content-Type: application/json` in Headers

> ⚠️ All routes require `Authorization: Bearer <token>` header.  
> Admin routes also need an **Admin** role token.

---

## 🔑 Setup: Get Your Tokens First

**Login as Admin:**
```
POST /api/auth/login
```
```json
{ "email": "admin@test.com", "password": "admin123" }
```
→ Copy **admin_token**

**Login as Customer:**
```
POST /api/auth/login
```
```json
{ "email": "customer@test.com", "password": "pass123" }
```
→ Copy **customer_token**

> 📌 You also need: a `movieId` from Movies API and a `screenId` from Theatre API before testing Shows.

---

## PART 1 — Show Management (Admin)

### 1. Create Show *(Admin only)*
```
POST /api/shows/create
Header → Authorization: Bearer <admin_token>
```
```json
{
  "movieId": "<copy from GET /api/movies>",
  "screenId": "<copy from GET /api/theatres/:id/screens>",
  "showDate": "2026-03-10",
  "showTime": "18:00",
  "ticketPrice": {
    "Regular": 150,
    "Premium": 250,
    "VIP": 400
  }
}
```
✅ Returns: Show object with `_id`  
> 📌 **Save this show `_id`** — needed for booking tests.  
❌ No admin token → 403 error  
❌ Show date already passed → 400 error  
❌ Invalid screenId (not MongoDB ObjectId) → 500 Cast error

---

### 2. Get All Shows
```
GET /api/shows
Header → Authorization: Bearer <token>
```
✅ Returns: All shows with populated `movieId` and `screenId` details

---

### 3. Get Show by ID
```
GET /api/shows/<show_id>
Header → Authorization: Bearer <token>
```
✅ Returns: Single show with full details  
❌ Wrong ID → 404 error

---

### 4. Cancel Show *(Admin only)*
```
PUT /api/shows/cancel/<show_id>
Header → Authorization: Bearer <admin_token>
```
✅ Returns: Show with `status: "Cancelled"`  
❌ Customer token → 403 error

---

## PART 2 — Booking (Customer)

### 5. Check Seat Availability
```
GET /api/bookings/availability/<show_id>
Header → Authorization: Bearer <token>
```
✅ Returns:
```json
{ "bookedSeats": ["A1", "A3"] }
```
> Seats listed here are already booked and cannot be selected.

---

### 6. Create Booking *(Logged-in user)*
```
POST /api/bookings/create
Header → Authorization: Bearer <customer_token>
```
```json
{
  "showId": "<show_id from step 1>",
  "seats": ["A1", "A2"]
}
```
✅ Returns: Booking object with totalAmount and status `"Confirmed"`  
✅ Also creates a notification for the user  
❌ Seats already booked → 400 `"One or more seats already booked"`  
❌ Show cancelled → 400 `"Cannot book cancelled show"`  
❌ Show already started (date + time passed) → 400  
❌ No token → 401

---

### 7. Book Same Seats (Test Conflict)
Try booking A1 again with a different user:
```
POST /api/bookings/create
Header → Authorization: Bearer <another_customer_token>
```
```json
{ "showId": "<same_show_id>", "seats": ["A1"] }
```
❌ Should return: `400 One or more seats already booked`

---

### 8. Get My Bookings
```
GET /api/bookings/user/<userId>
Header → Authorization: Bearer <customer_token>
```
✅ Returns: All bookings for the logged-in user  
> Note: The `userId` in the URL is ignored — backend uses the token to identify the user securely.

---

### 9. Cancel Booking
```
PUT /api/bookings/cancel/<booking_id>
Header → Authorization: Bearer <customer_token>
```
✅ Returns: Booking with `status: "Cancelled"`  
✅ Also creates a cancellation notification  
❌ Already cancelled → 400 error  
❌ Wrong user → 403 error (can't cancel others' bookings)

---

### 10. Delete All Bookings *(Admin only — for testing/cleanup)*
```
DELETE /api/bookings/delete-all
Header → Authorization: Bearer <admin_token>
```
✅ Returns: `{ "message": "All bookings deleted" }`  
❌ Customer token → 403 error

---

## ✅ Full Test Flow (Order Matters)

```
Pre-requisites:
  1. Create a Theatre  →  theatreId
  2. Add Screen to Theatre  →  screenId
  3. Add Seats to Screen (A1–A5)
  4. Create a Movie  →  movieId

Show + Booking flow:
  5. Admin: Create Show (movieId + screenId + future date + time)  →  showId
  6. Customer: GET /availability/:showId  →  See empty bookedSeats: []
  7. Customer: POST /create { showId, seats: ["A1","A2"] }  →  Booking confirmed ✅
  8. Customer: GET /availability/:showId  →  bookedSeats: ["A1","A2"]
  9. Customer: Try booking A1 again  →  400 conflict ✅
  10. Customer: GET /user/:userId  →  See booking history ✅
  11. Customer: PUT /cancel/:bookingId  →  Status: Cancelled ✅
  12. Customer: GET /user/:userId  →  Status updated to Cancelled ✅
```

---

## ❌ Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| 401 Unauthorized | No / expired token | Login again, copy new token |
| 403 Forbidden | Customer token on Admin route | Use Admin token |
| 400 Seats already booked | Seat taken by another booking | Pick different seat numbers |
| 400 Show has already started | showDate + showTime in the past | Use a future date and time |
| 500 Cast to ObjectId failed | Typed `"1"` instead of real MongoDB ID | Copy exact `_id` from API response |
| 404 Show not found | Wrong showId | Copy exact `_id` from create show response |
