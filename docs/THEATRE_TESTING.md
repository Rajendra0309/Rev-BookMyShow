# 🏟️ Theatre, Screen & Seat Module – API Testing Guide

**Owner:** Samarth  
**Base URL:** `http://localhost:5000/api/theatres`  
**Tool:** Thunder Client (VS Code) or Postman  
**Always set:** `Content-Type: application/json` in Headers

> ⚠️ All routes require `Authorization: Bearer <token>` header.  
> Admin-only routes also need an **Admin** role token.

---

## 🔑 Setup: Get Your Tokens First

**Register Admin:**
```
POST /api/auth/register
```
```json
{ "name": "Admin User", "email": "admin@test.com", "password": "admin123", "role": "Admin" }
```

**Login → copy the token:**
```
POST /api/auth/login
```
```json
{ "email": "admin@test.com", "password": "admin123" }
```

---

## PART 1 — Theatre CRUD

### 1. Get All Theatres
```
GET /api/theatres
Header → Authorization: Bearer <token>
```
✅ Returns: Array of all theatres  
**Filter by city:**  
```
GET /api/theatres?city=Bangalore
```

---

### 2. Get Theatre by ID
```
GET /api/theatres/<theatre_id>
Header → Authorization: Bearer <token>
```
✅ Returns: Theatre details  
❌ Wrong ID → 404 error

---

### 3. Create Theatre *(Admin only)*
```
POST /api/theatres
Header → Authorization: Bearer <admin_token>
```
```json
{
  "name": "PVR Cinemas",
  "city": "Bangalore",
  "location": "Forum Mall, Koramangala"
}
```
✅ Returns: Newly created theatre with `_id`  
> 📌 **Save this `_id`** — you'll need it for screen tests below.  
❌ No admin token → 403 error

---

### 4. Update Theatre *(Admin only)*
```
PUT /api/theatres/<theatre_id>
Header → Authorization: Bearer <admin_token>
```
```json
{ "name": "PVR Cinemas Updated", "city": "Mysore" }
```
✅ Returns: Updated theatre object

---

### 5. Delete Theatre *(Admin only)*
```
DELETE /api/theatres/<theatre_id>
Header → Authorization: Bearer <admin_token>
```
✅ Returns: `{ "message": "Theatre deleted" }`  
❌ Customer token → 403 error

---

## PART 2 — Screen Management

### 6. Get Screens of a Theatre
```
GET /api/theatres/<theatre_id>/screens
Header → Authorization: Bearer <token>
```
✅ Returns: Array of screens for that theatre

---

### 7. Add Screen to Theatre *(Admin only)*
```
POST /api/theatres/<theatre_id>/screens
Header → Authorization: Bearer <admin_token>
```
```json
{ "screenName": "Screen 1", "totalSeats": 100 }
```
✅ Returns: Newly created screen with `_id`  
> 📌 **Save this screen `_id`** — needed for seat tests.  
❌ No admin token → 403 error

---

### 8. Add Second Screen
```
POST /api/theatres/<theatre_id>/screens
Header → Authorization: Bearer <admin_token>
```
```json
{ "screenName": "Screen 2", "totalSeats": 60 }
```

---

### 9. Update Screen *(Admin only)*
```
PUT /api/theatres/screens/<screen_id>
Header → Authorization: Bearer <admin_token>
```
```json
{ "screenName": "Screen 1 - 4K", "totalSeats": 120 }
```
✅ Returns: Updated screen object

---

### 10. Delete Screen *(Admin only)*
```
DELETE /api/theatres/screens/<screen_id>
Header → Authorization: Bearer <admin_token>
```
✅ Returns: `{ "message": "Screen deleted" }`

---

## PART 3 — Seat Management

### 11. Add Seats to Screen *(Admin only)*
```
POST /api/theatres/screens/<screen_id>/seats
Header → Authorization: Bearer <admin_token>
```
```json
{
  "seats": [
    { "seatNumber": "A1", "seatType": "Regular" },
    { "seatNumber": "A2", "seatType": "Regular" },
    { "seatNumber": "A3", "seatType": "Premium" },
    { "seatNumber": "A4", "seatType": "Premium" },
    { "seatNumber": "A5", "seatType": "VIP" }
  ]
}
```
✅ Returns: Created seats array  
❌ No admin token → 403 error

---

### 12. Get Seats of a Screen
```
GET /api/theatres/screens/<screen_id>/seats
Header → Authorization: Bearer <token>
```
✅ Returns: All seats with seatNumber and seatType (Regular / Premium / VIP)

---

### 13. Delete All Seats of a Screen *(Admin only)*
```
DELETE /api/theatres/screens/<screen_id>/seats
Header → Authorization: Bearer <admin_token>
```
✅ Returns: `{ "message": "Seats deleted" }`

---

## ✅ Full Test Flow (Order Matters)

```
1. Register Admin  →  Login  →  Copy token
2. Create Theatre  →  Copy theatre._id
3. Add Screen 1   →  Copy screen._id
4. Add Seats to Screen 1
5. GET /theatres   →  See your theatre listed
6. GET /theatres/:id/screens  →  See Screen 1
7. GET /theatres/screens/:id/seats  →  See all added seats
8. Delete Screen 1  →  GET screens again → empty
```

---

## ❌ Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| 401 Unauthorized | No token / expired | Login again, copy new token |
| 403 Forbidden | Customer token on admin route | Use Admin token |
| 404 Not Found | Wrong ID in URL | Copy exact `_id` from create response |
| 500 Server Error | Invalid ObjectId format | Use real MongoDB `_id` (24 hex chars) |
