# 🎟️ PDF Ticket & Email Notification – Integration Testing Guide

This guide details how to verify, test, and troubleshoot the automated ticket creation and email dispatch system.

**Triggers:** Instantly executed on the backend after booking confirmation via:
*   Booking API: `POST http://localhost:5000/api/bookings/create`
*   Headers: `Authorization: Bearer <customer_token>`
*   Headers: `Content-Type: application/json`

---

## 🔑 Setup: Environment Configuration

Before testing the dispatch flow, ensure your local `backend/.env` file or Render Environment panel has the SMTP relay settings configured:

```
SMTP_HOST=smtp.gmail.com (or smtp-relay.sendinblue.com for Brevo)
SMTP_PORT=587 (or 2525 to bypass Render firewall blocks)
SMTP_USER=your_verified_email@gmail.com
SMTP_PASS=your_smtp_app_password
FROM_EMAIL=your_verified_email@gmail.com
```

---

## PART 1 — Integration Testing Flow (Order of Operations)

Follow these steps to trigger and verify the email ticket dispatch:

### 1. Register or Log in as a Customer
Perform a login request to retrieve your authentication token and copy your account email.
```
POST /api/auth/login
```
```json
{
  "email": "customer@test.com",
  "password": "pass123"
}
```
*   **Save the returned `token`** (used as `Bearer <token>`).
*   **Ensure the customer email** is an address you can access to check the inbox.

### 2. Confirm Booking (Triggering the Dispatch)
Select a show ID and seat numbers to complete a booking.
```
POST /api/bookings/create
Header → Authorization: Bearer <customer_token>
```
```json
{
  "showId": "<copy_from_shows>",
  "seats": ["C3", "C4"],
  "paymentMethod": "Card",
  "razorpayOrderId": "order_12345",
  "razorpayPaymentId": "pay_12345",
  "razorpaySignature": "signature_12345"
}
```

### 3. Inspect Server Logs
Verify that the backend console prints a confirmation log:
*   **Expected Success Log:** `✉️ Confirmation email sent successfully to customer@test.com. Message ID: <id>`
*   **Bypass Warning:** `⚠️ [Email Service Bypass]: SMTP credentials are not fully configured...` (Indicates credentials are empty in `.env`).

---

## PART 2 — Deliverability & QR Code Validation

Once the success log appears, verify the physical email receipt:

### 1. Check Recipient Mailbox
*   Locate the email with the subject line: `🎟️ Your Ticket Confirmation: <Movie Title>`.
*   *Note: If the email does not land in the primary Inbox, check your **Spam/Junk** folder. Open it and click **"Not Spam"** to authorize the developer SMTP server.*

### 2. Inspect the PDF Attachment
*   Open the attached PDF file (`ticket_<movie_name>.pdf`).
*   Verify that the header displays **Rev-BookMyShow** branding.
*   Confirm the Movie Title, Theatre Name, Screen Name, Seat Numbers, Date, and Time match the booking inputs exactly.

### 3. Scan the Embedded QR Code
*   Open your mobile phone camera or any QR scanner app.
*   Point it at the QR code embedded at the bottom center of the PDF page.
*   **Expected Scan Output:** Your phone screen should display the raw text receipt showing:
    ```
    🎟️ REV-BOOKMYSHOW TICKET
    --------------------------
    Booking ID: 60a32b9c...
    Movie: Inception
    Theatre: INOX
    Screen: Screen 1
    Seats: C3, C4
    Date: Sun, 10 May 2026
    Time: 18:00
    Total Amount: INR 300
    Status: Confirmed & Paid
    ```

---

## ✅ End-to-End Test Checklist

| # | Test Action | Expected Result | Status |
|---|-------------|-----------------|--------|
| 1 | POST `/api/bookings/create` (without SMTP envs) | Booking succeeds; console logs "Email Service Bypass" warning. | Passed |
| 2 | POST `/api/bookings/create` (with valid SMTP envs) | Booking succeeds; console logs "email sent successfully". | Passed |
| 3 | Open PDF Attachment | Document format aligns, displays correct show/theatre metadata. | Passed |
| 4 | Scan PDF QR Code | Phone decodes and displays structured ticket details. | Passed |
| 5 | Trigger booking on Render Free Tier (Port 587/465) | Connection times out due to Render's outbound port block. | Passed |
| 6 | Trigger booking on Render Free Tier (Port 2525 Relay) | Connection succeeds, bypasses firewall, and sends email. | Passed |

---

## ❌ Troubleshooting Common Errors

| Error Message | Root Cause | Fix |
|:---|:---|:---|
| `Connection timeout` | Outbound ports 587 / 465 are blocked by your cloud provider (e.g. Render Free Tier). | Set your SMTP settings to use a relay service (like Brevo or SendGrid) on Port **`2525`**. |
| `connect ENETUNREACH <IPv6_Address>` | Cloud hosting network lacks IPv6 routing support. | The system automatically forces IPv4 resolution via custom DNS lookup in `emailService.js`. |
| `535-5.7.8 Username and Password not accepted` | Using standard account password or app password with spaces. | 1. Generate a 16-character Google App Password.<br>2. Remove all spaces before pasting it into your `.env` or Render panel. |
| `Email Service Bypass` | Credentials are empty in your `.env` or Render environment settings. | Add `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and `FROM_EMAIL` variables. |
