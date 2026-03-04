# Theatre, Screen, and Seat Management Testing Guide

This document provides step-by-step instructions to test the theatre, screen, and seat endpoints and functionality using Thunder Client or cURL.

---

## Prerequisites

- Backend server running on `http://localhost:5000`
- MongoDB running and connected
- Valid JWT token (obtain from login/register, typically requires Admin role for creation endpoints)

---

## Test Endpoints

### 1. Create Theatre (Admin Only)

**Endpoint:** `POST /api/theatres/create`

**Headers:**
```
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
    "name": "PVR Cinemas",
    "location": "Koramangala",
    "city": "Bangalore"
}
```

**Expected Response: 201 Created**
```json
{
    "message": "Theatre created successfully",
    "theatre": {
        "name": "PVR Cinemas",
        "location": "Koramangala",
        "city": "Bangalore",
        "_id": "THEATRE_ID",
        "createdAt": "...",
        "updatedAt": "..."
    }
}
```

---

### 2. Create Screen (Admin Only)

**Endpoint:** `POST /api/screens/create`

**Headers:**
```
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
    "screenName": "Screen 1 IMAX",
    "theatreId": "THEATRE_ID",
    "totalSeats": 100
}
```

**Expected Response: 201 Created**
```json
{
    "message": "Screen created successfully",
    "screen": {
        "screenName": "Screen 1 IMAX",
        "theatreId": "THEATRE_ID",
        "totalSeats": 100,
        "_id": "SCREEN_ID",
        "createdAt": "...",
        "updatedAt": "..."
    }
}
```

---

### 3. Get Seats by Screen ID

**Endpoint:** `GET /api/theatres/screens/:screenId/seats`

**Headers:**
```
Authorization: Bearer <TOKEN>
```

**Expected Response: 200 OK**
```json
[
    {
        "_id": "SEAT_ID_1",
        "screenId": "SCREEN_ID",
        "seatNumber": "A1",
        "type": "Standard",
        "priceMultiplier": 1
    },
    {
        "_id": "SEAT_ID_2",
        "screenId": "SCREEN_ID",
        "seatNumber": "A2",
        "type": "Standard",
        "priceMultiplier": 1
    }
    // ... more seats
]
```

**Error Responses:**
- `404 Not Found`: "No seats found for this screen" if the screen ID is invalid or has no seats.

---

## Testing Workflow (Sequence)

1. **Login as Admin** -> Get Token
2. **Create a Theatre** -> Save the returned `THEATRE_ID`
3. **Create a Screen** -> Use the `THEATRE_ID` in the request body. Save the returned `SCREEN_ID`.
4. *(Note: Depending on implementation details, creating a screen might automatically generate seats, or you might need a separate endpoint to populate seats. Ensure seats exist for the next step.)*
5. **Fetch Seats for Screen** -> Use the `SCREEN_ID` to verify seats are correctly linked to the screen.

## Common Issues

- **Invalid Theatre ID:** When creating a screen, ensure the `theatreId` exists and is a valid MongoDB ObjectId.
- **Seat Generation:** If the `GET /api/theatres/screens/:screenId/seats` endpoint returns 404, verify that the seat generation logic is implemented and successfully runs when a screen is created (or triggered manually if that's the design).
