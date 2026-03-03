# 📘 RevBookMyShow -- Movie Module Backend Testing Guide

> This document defines the complete backend testing process for the
> Movie Management Module. All steps must be verified before creating a
> Pull Request.

------------------------------------------------------------------------

## 📌 Module Overview

The Movie Management Module includes:

-   Add Movie (Admin only)
-   Update Movie (Admin only)
-   Delete Movie (Soft Delete -- Admin only)
-   View Movies (All logged-in users)
-   Filtering (title, genre, language)
-   Pagination
-   Role-based access control

------------------------------------------------------------------------

## 🔧 Testing Prerequisites

Before testing, ensure:

-   Backend server is running
-   MongoDB is connected
-   Auth module is working
-   Postman is installed

### ▶ Start Backend Server

cd backend\
npx nodemon server.js

Expected Output:

Server running on port 5000\
MongoDB Connected

Base URL:

http://localhost:5000/api

------------------------------------------------------------------------

# 🧪 Testing Workflow

Follow this sequence:

1.  Register Admin\
2.  Login Admin\
3.  Create Movie\
4.  Test Duplicate\
5.  Get Movies\
6.  Filter Movies\
7.  Update Movie\
8.  Soft Delete\
9.  Role Restriction (Customer)\
10. Validation Testing

------------------------------------------------------------------------

# 1️⃣ Register Admin User

POST /api/auth/register

{ "name": "Admin User", "email": "admin@test.com", "password": "123456",
"role": "Admin" }

Expected: Status 201, Token returned

------------------------------------------------------------------------

# 2️⃣ Login as Admin

POST /api/auth/login

{ "email": "admin@test.com", "password": "123456" }

Expected: Status 200, JWT token returned

------------------------------------------------------------------------

# 3️⃣ Create Movie (Admin Only)

POST /api/movies

Header: Authorization: Bearer `<ADMIN_TOKEN>`{=html}

{ "title": "Leo", "genre": \["Action", "Thriller"\], "language":
"Tamil", "duration": 165, "rating": 8.3, "description": "Mass
entertainer" }

Expected: Status 201, Movie created

------------------------------------------------------------------------

# 4️⃣ Duplicate Movie Test

Send same request again.

Expected: Status 400, Duplicate error

------------------------------------------------------------------------

# 5️⃣ Get All Movies

GET /api/movies

Expected Response Structure:

{ "success": true, "total": 1, "page": 1, "totalPages": 1, "data":
\[...\] }

------------------------------------------------------------------------

# 6️⃣ Filtering Tests

GET /api/movies?title=leo\
GET /api/movies?genre=Action\
GET /api/movies?language=Tamil

Expected: Filtered results returned

------------------------------------------------------------------------

# 7️⃣ Get Movie By ID

GET /api/movies/`<movie_id>`{=html}

Expected: Movie details returned

------------------------------------------------------------------------

# 8️⃣ Update Movie (Admin Only)

PUT /api/movies/`<movie_id>`{=html}

{ "rating": 9 }

Expected: Status 200, Movie updated

------------------------------------------------------------------------

# 9️⃣ Soft Delete Movie

DELETE /api/movies/`<movie_id>`{=html}

Expected: Status 200, Movie deactivated

Verify: GET /api/movies\
Deleted movie should not appear.

------------------------------------------------------------------------

# 🔟 Role Restriction Test (Customer)

Register customer and login.

Try: POST /api/movies

Expected: 403 Access denied

GET /api/movies

Expected: Movies visible

------------------------------------------------------------------------

# 🔎 Validation Testing

-   rating \> 10 → Validation error
-   duration \< 1 → Validation error
-   missing title → Validation error
-   invalid ID → Proper error handled

------------------------------------------------------------------------

# ✅ Final Checklist

-   Admin can create movie
-   Duplicate prevented
-   Customer restricted from admin actions
-   Filtering works
-   Pagination works
-   Soft delete works
-   Validation rules enforced

------------------------------------------------------------------------

# 🎯 Definition of Done

Movie Module Backend is complete when:

-   All APIs tested successfully
-   Role-based access verified
-   Soft delete confirmed
-   No unhandled errors
-   Ready for frontend integration
