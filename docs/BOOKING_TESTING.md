# Booking Management Testing Guide

This document provides step-by-step instructions to test the booking system endpoints and functionality.

---

## Prerequisites

- Backend server running on `http://localhost:5000`
- MongoDB running and connected
- Valid JWT token (obtain from login/register)
- Sample data: Movies, Theatres, Screens, and Shows created

---

## Test Endpoints

### 1. Create Booking

**Endpoint:** `POST /api/bookings/create`

**Headers:**
```
Authorization: Bearer <TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
    "userId": "USER_ID_FROM_TOKEN",
    "showId": "SHOW_ID",
    "seats": ["A1", "B3", "C2"]
}
```

**Expected Responses:**

✅ **201 Created** - Booking successful
```json
{
    "message": "Booking successful",
    "booking": {
        "_id": "BOOKING_ID",
        "userId": "USER_ID",
        "showId": "SHOW_ID",
        "seats": ["A1", "B3", "C2"],
        "totalAmount": 1500,
        "status": "Confirmed",
        "bookingDate": "2026-03-04T10:30:00Z"
    }
}
```

❌ **400 Bad Request** - Show already started
```json
{
    "message": "Cannot book. Show already started."
}
```

❌ **400 Bad Request** - Seats already booked
```json
{
    "message": "One or more seats already booked"
}
```

❌ **404 Not Found** - Show doesn't exist
```json
{
    "message": "Show not found"
}
```

**Test Scenarios:**
1. ✅ Book seats for a future show → Should succeed
2. ✅ Book different seats for the same show → Should succeed
3. ❌ Book already reserved seats → Should fail
4. ❌ Book for a past show (date+time) → Should fail
5. ❌ Book using invalid show ID → Should fail

---

### 2. Get Booking History by User

**Endpoint:** `GET /api/bookings/user/:userId`

**Headers:**
```
Authorization: Bearer <TOKEN>
```

**Expected Response: 200 OK**
```json
[
    {
        "_id": "BOOKING_ID",
        "userId": "USER_ID",
        "showId": {
            "_id": "SHOW_ID",
            "movieId": {
                "_id": "MOVIE_ID",
                "title": "Dune",
                ...
            },
            "showDate": "2026-03-10T00:00:00Z",
            "showTime": "20:00",
            "ticketPrice": 300
        },
        "seats": ["A1", "B3"],
        "totalAmount": 600,
        "status": "Confirmed",
        "bookingDate": "2026-03-04T10:30:00Z"
    }
]
```

**Test Scenarios:**
1. ✅ Fetch bookings for a user with bookings → Should return array
2. ✅ Fetch bookings for a user with no bookings → Should return empty array
3. ❌ Access without token → Should return 401 Unauthorized

---

### 3. Cancel Booking

**Endpoint:** `PUT /api/bookings/cancel/:id`

**Headers:**
```
Authorization: Bearer <TOKEN>
Content-Type: application/json
```

**Expected Response: 200 OK**
```json
{
    "message": "Booking cancelled successfully",
    "booking": {
        "_id": "BOOKING_ID",
        "status": "Cancelled",
        ...
    }
}
```

**Error Responses:**

❌ **404 Not Found** - Booking doesn't exist
```json
{
    "message": "Booking not found"
}
```

❌ **400 Bad Request** - Show already started
```json
{
    "message": "Cannot cancel after show started"
}
```

**Test Scenarios:**
1. ✅ Cancel a confirmed booking before show time → Should succeed
2. ✅ Check booking status changes to "Cancelled" → Should be cancelled
3. ❌ Cancel an already cancelled booking → Should fail
4. ❌ Cancel booking for a show that started → Should fail
5. ❌ Cancel with invalid booking ID → Should fail 404

---

### 4. Get Seat Availability

**Endpoint:** `GET /api/bookings/availability/:showId`

**Expected Response: 200 OK**
```json
{
    "showId": "SHOW_ID",
    "bookedSeats": ["A1", "B3", "C2"]
}
```

**Test Scenarios:**
1. ✅ Check availability for a show with bookings → Should return booked seats
2. ✅ Check availability for a new show → Should return empty array

---

## Date-Time Bug Fix Testing

### Issue: Show time check using date only

**Before Fix (❌ BUG):**
- Show scheduled for today at 8 PM
- Current time: 10 AM
- Result: ❌ Cannot book (incorrectly blocked)

**After Fix (✅ CORRECT):**
- Show scheduled for today at 8 PM
- Current time: 10 AM
- Result: ✅ Can book (correctly allowed)

**Test Scenario:**
```
Same-day show booking test:
1. Create a show for today at 19:00 (7 PM)
2. Try to book at 14:00 (2 PM)
3. ✅ Should succeed (hours, minutes extracted from showTime)
4. Try to book at 20:30 (8:30 PM)
5. ❌ Should fail (show duration check)
```

---

## Frontend Integration Testing

### BookingHistory Page (`/bookings`)
1. ✅ Page loads with user's bookings
2. ✅ Shows table with: Movie, Date & Time, Seats, Amount, Status
3. ✅ Status badge displays Confirmed (green) or Cancelled (red)
4. ✅ Cancel button visible only for Confirmed bookings
5. ✅ Clicking Cancel button opens confirmation dialog
6. ✅ Confirmed cancellation updates status

### SeatSelection Page (`/booking`)
1. ✅ Input fields for Show ID and Screen ID
2. ✅ Fetches real seats from `/api/theatres/screens/:screenId/seats`
3. ✅ Seats color-coded: Gray (available), Green (selected), Red (booked)
4. ✅ Selected seats displayed in summary
5. ✅ "Confirm Booking" button sends POST to `/api/bookings/create`
6. ✅ Success message appears after booking
7. ✅ Booked seats update in real-time

### AdminCreateShow Page (`/admin/show/create`)
1. ✅ Form displays all required fields
2. ✅ Movies dropdown populated from API
3. ✅ Screens dropdown populated from API
4. ✅ Show Time input in HH:MM format
5. ✅ POST request sent to `/api/bookings/create` on submit
6. ✅ Success message displays after creation

---

## cURL Testing Examples

### Create Booking
```bash
curl -X POST http://localhost:5000/api/bookings/create \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID",
    "showId": "SHOW_ID",
    "seats": ["A1", "B3"]
  }'
```

### Get Booking History
```bash
curl -X GET http://localhost:5000/api/bookings/user/USER_ID \
  -H "Authorization: Bearer <TOKEN>"
```

### Cancel Booking
```bash
curl -X PUT http://localhost:5000/api/bookings/cancel/BOOKING_ID \
  -H "Authorization: Bearer <TOKEN>"
```

### Get Seat Availability
```bash
curl -X GET http://localhost:5000/api/bookings/availability/SHOW_ID
```

---

## Common Issues & Fixes

| Issue | Cause | Solution |
|-------|-------|----------|
| "Show not found" | Invalid Show ID | Verify Show ID exists in DB |
| "One or more seats already booked" | Concurrent bookings | Refresh availability before booking |
| "Cannot book after show started" | Date-time bug (pre-fix) | Ensure showTime includes HH:MM |
| Token not recognized | Expired token | Re-login and get new token |
| Seats not loading | Missing API endpoint | Implement GET `/api/theatres/screens/:screenId/seats` |

---

## Performance Notes

- **Large bookings**: For shows with 100+ bookings, API response time may increase
- **Concurrent requests**: Test multiple users booking simultaneously to check race conditions
- **Seat generation**: Ensure screen seat data is pre-populated for performance

---

## Checklist

- [ ] Date-time bug fixed in `createBooking()`
- [ ] Date-time bug fixed in `cancelBooking()`
- [ ] BookingHistory.jsx displays bookings correctly
- [ ] AdminCreateShow.jsx form submits properly
- [ ] SeatSelection.jsx fetches dynamic seats
- [ ] Cancel button works with confirmation
- [ ] Success/error messages display appropriately
- [ ] Token-based authentication working
- [ ] All endpoints return correct HTTP status codes

