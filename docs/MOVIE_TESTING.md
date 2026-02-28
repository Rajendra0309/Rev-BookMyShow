# 🎬 Movie Module – API Testing Guide

**Base URL:** `http://localhost:5000/api/movies`  
**Tool:** Thunder Client (VS Code) or Postman  
**Always set:** `Content-Type: application/json` in Headers

> ⚠️ All movie routes require a JWT token.  
> Login first → copy the token → use in `Authorization: Bearer <token>`

---

## Get Token First
```
POST http://localhost:5000/api/auth/login
{ "email": "admin@test.com", "password": "admin123" }
```
Copy the `token` from response.

---

## 1. Create Movie *(Admin only)*
```
POST /api/movies
Header → Authorization: Bearer <admin_token>
```
```json
{
  "title": "KGF Chapter 2",
  "genre": "Action",
  "language": "Kannada",
  "duration": 168,
  "rating": "U/A",
  "description": "Rocky expands his empire"
}
```
✅ Returns: created movie object  
❌ Duplicate title → 400 error  
❌ Customer token → 403 Admins only

---

## 2. Get All Movies *(any logged-in user)*
```
GET /api/movies
Header → Authorization: Bearer <token>
```
✅ Returns: list of active movies (paginated)

**With filters:**
```
GET /api/movies?genre=Action
GET /api/movies?language=Hindi
GET /api/movies?title=KGF
GET /api/movies?page=1&limit=5
```

---

## 3. Get Movie By ID
```
GET /api/movies/<movie_id>
Header → Authorization: Bearer <token>
```
✅ Returns: single movie details  
❌ Invalid ID → 404 not found

---

## 4. Update Movie *(Admin only)*
```
PUT /api/movies/<movie_id>
Header → Authorization: Bearer <admin_token>
```
```json
{
  "rating": "A",
  "description": "Updated description"
}
```
✅ Returns: updated movie object

---

## 5. Delete Movie *(Admin only – Soft Delete)*
```
DELETE /api/movies/<movie_id>
Header → Authorization: Bearer <admin_token>
```
✅ Returns: `Movie deactivated successfully`  
> Note: Movie is NOT removed from DB, just marked `Inactive`

---

## Quick Test Flow
1. Login as Admin → get token
2. Create a movie → copy `_id`
3. Get all movies → verify it appears
4. Get by ID → verify details
5. Update movie → verify changes
6. Delete movie → verify it disappears from GET all (inactive)
