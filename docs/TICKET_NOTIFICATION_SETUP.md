# 🎟️ Serverless PDF Ticket & Email Notification System Setup Guide
> **In-Memory PDF Generation, Scannable QR Codes, and Automated Nodemailer SMTP Dispatch**

This document details the configuration parameters, testing walkthroughs, and deliverability troubleshooting for the automated booking receipt system.

---

## 1. System Integration Flow

The ticket generation and dispatch system executes immediately after a customer's payment is validated:

1. **Successful Payment Hook:** Once the backend verifies the Razorpay signature and saves the booking to MongoDB, it spawns a non-blocking background task.
2. **Data Relationship Query:** The task queries the database to resolve all foreign keys (Movie title, Theatre name, Screen details, and User contact details).
3. **In-Memory PDF Layout Draw:** The ticket generator builds an A6-sized PDF receipt detailing the showtime, date, selected seats, total amount, and confirmation details.
4. **Scannable QR Generation:** A real-time QR code is compiled using the ticket data. When scanned, it outputs raw, structured ticket validation text. This QR image is embedded directly into the PDF.
5. **Transporter Dispatch:** Nodemailer connects to the configured SMTP server, formats a structured HTML confirmation body, attaches the in-memory PDF buffer, and delivers it to the customer.

---

## 2. SMTP Environment Configuration

Add the following credentials to your local `backend/.env` file:

*   `SMTP_HOST`: The address of your SMTP server (e.g. `smtp.gmail.com` for Gmail, or `sandbox.smtp.mailtrap.io` for testing).
*   `SMTP_PORT`: Port number (e.g. `587` for secure TLS startup, or `465` for SSL connections).
*   `SMTP_USER`: The email address used to log in and send emails (e.g. `yourname@gmail.com`).
*   `SMTP_PASS`: Your secure 16-character Google App Password (without spaces) or SMTP service credential.
*   `FROM_EMAIL`: The display email sender address.

---

## 3. Resolving Deliverability & "Spam Folder" Issues

When testing with a personal Gmail account or a fresh domain, emails may sometimes arrive in the **Spam** folder. This is normal and can be corrected by adjusting your configuration:

### A. Sender Email Match (Critical)
*   **The Issue:** If `FROM_EMAIL` is set to a custom domain (e.g. `noreply@revbookmyshow.com`) while the SMTP transporter logs in using a personal Gmail account (e.g. `yourname@gmail.com`), Google will flag this as a "Spoofing" attempt because the domains do not match.
*   **The Fix:** Make sure your `FROM_EMAIL` matches your `SMTP_USER` exactly in your `.env` file.

### B. Mark as "Not Spam"
*   **The Issue:** Fresh development SMTP connections sending PDF attachments and QR codes look suspicious to spam filters.
*   **The Fix:** Open your Gmail spam folder, locate the confirmation email, and click **"Report not spam"** or **"Looks safe"**. This teaches the Google spam filter to recognize your developer connection, ensuring subsequent emails land in the primary Inbox.

---

## 4. Manual Testing & Verification

Follow these steps to verify both email delivery and QR code scanning:

1. Launch your backend and React client servers.
2. Log in, select a movie, choose seats, and complete a test transaction.
3. Verify that the console prints a success message: `✉️ Confirmation email sent successfully`.
4. Open the recipient's inbox (or spam folder) and open the booking email.
5. Open the attached PDF and verify the formatting is aligned correctly.
6. Open your mobile phone's camera or a QR scanner app and scan the QR code printed on the PDF.
7. Verify that your phone displays the booking info (Booking ID, Movie Title, Theatre name, Seat numbers, and confirmation date).
