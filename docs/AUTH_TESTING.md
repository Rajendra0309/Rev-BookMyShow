# 🔐 Auth Module – API Testing Guide

**Base URL:** `http://localhost:5000/api/auth`  
**Tool:** Thunder Client (VS Code) or Postman  
**Always set:** `Content-Type: application/json` in Headers

---

## 1. Register
```
POST /api/auth/register
```
```json
{
  "name": "Test User",
  "email": "test@test.com",
  "password": "pass123",
  "role": "Customer",
  "securityQuestion": "Pet name?",
  "securityAnswer": "Tommy"
}
```
✅ Returns: JWT token + user info  
❌ Duplicate email → 400 error

---

## 2. Register Admin
```
POST /api/auth/register
```
```json
{
  "name": "Admin User",
  "email": "admin@test.com",
  "password": "admin123",
  "role": "Admin"
}
```

---

## 3. Login
```
POST /api/auth/login
```
```json
{
  "email": "test@test.com",
  "password": "pass123"
}
```
✅ Returns: JWT token → **Copy this token for protected routes below**  
❌ Wrong password → 400 error

---

## 4. Get Profile *(requires token)*
```
GET /api/auth/profile
Header → Authorization: Bearer <token>
```
✅ Returns: User profile (no password field)  
❌ No token → 401 error

---

## 5. Change Password *(requires token)*
```
POST /api/auth/change-password
Header → Authorization: Bearer <token>
```
```json
{
  "currentPassword": "pass123",
  "newPassword": "newpass456"
}
```
✅ Returns: `Password changed successfully`  
❌ Wrong current password → 400 error

---

## 6. Get Security Question
```
GET /api/auth/security-question?email=test@test.com
```
✅ Returns: `{ "securityQuestion": "Pet name?" }`

---

## 7. Forgot Password
```
POST /api/auth/forgot-password
```
```json
{
  "email": "test@test.com",
  "securityAnswer": "Tommy",
  "newPassword": "reset123"
}
```
✅ Returns: `Password reset successfully`  
❌ Wrong answer → 400 error

---

## 8. Admin – Get All Users *(Admin token only)*
```
GET /api/auth/users
Header → Authorization: Bearer <admin_token>
```
✅ Returns: All users list  
❌ Customer token → 403 Admins only
