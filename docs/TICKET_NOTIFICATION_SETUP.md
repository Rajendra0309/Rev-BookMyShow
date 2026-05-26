# 🎟️ Serverless PDF Ticket & Email Notification System Setup Guide
> **In-Memory PDF Generation, Scannable QR Codes, and SMTP-Only Delivery Configuration**

This document details the configuration parameters, testing walkthroughs, and deliverability troubleshooting for the automated booking receipt system.

---

## 1. System Integration Flow

The ticket generation and dispatch system executes immediately after a customer's payment is validated:

1. **Successful Payment Hook:** Once the backend verifies the Razorpay signature and saves the booking to MongoDB, it spawns a non-blocking background task.
2. **Data Relationship Query:** The task queries the database to resolve all foreign keys (Movie title, Theatre name, Screen details, and User contact details).
3. **In-Memory PDF Layout Draw:** The ticket generator builds an A6-sized PDF receipt detailing the showtime, date, selected seats, total amount, and confirmation details.
4. **Scannable QR Generation:** A real-time QR code is compiled using the ticket data. When scanned, it outputs raw, structured ticket validation text. This QR image is embedded directly into the PDF.
5. **Transporter Dispatch:** Nodemailer establishes a connection with the SMTP server and delivers the PDF ticket to the customer.

---

## 2. Resolving Render Port Blocks (Sending to Everyone)

Render blocks all outbound SMTP ports (**25, 465, and 587**) on their **Free Web Service** tier. Standard Gmail SMTP connections (which require port 587 or 465) will fail with a `Connection timeout` error on Render's free tier. 

You have two choices to make SMTP send successfully from your deployed app to any customer globally:

### Choice A: Use an SMTP Relay on Port `2525` (Free Tier Option)
Render blocks 25, 465, and 587, but they **do not block port 2525**. Many global email dispatch services provide SMTP relays on port 2525 specifically to bypass cloud firewalls. 
1. Sign up for a free account at a service like **Brevo (formerly Sendinblue)** or **SendGrid**.
2. Perform **Single Sender Verification** in their dashboard (simply enter your personal email address and click the verification link they send to your inbox).
3. Add these credentials to your Render Web Service Environment:
   * `SMTP_HOST`: `smtp-relay.sendinblue.com` (for Brevo) or `smtp.sendgrid.net` (for SendGrid)
   * `SMTP_PORT`: `2525` (This port is unblocked on Render!)
   * `SMTP_USER`: Your relay username or API key
   * `SMTP_PASS`: Your relay password
   * `FROM_EMAIL`: Your verified sender email address
4. The system will connect via port 2525, bypassing Render's firewall and successfully sending emails to any recipient globally.

### Choice B: Upgrade Render Instance to Paid (Starter Tier Option)
Render only blocks SMTP ports on free accounts. Upgrading your backend service to Render's **Starter Plan** (paid tier) instantly unblocks ports 587 and 465. 
Once upgraded, your standard Gmail SMTP configuration (`smtp.gmail.com` on port `587`) will connect and send emails to everyone globally out-of-the-box.

---

## 3. Localhost Configuration

For local development where SMTP ports are not blocked, you can use your Gmail SMTP settings:

*   `SMTP_HOST`: `smtp.gmail.com`
*   `SMTP_PORT`: `587`
*   `SMTP_USER`: Your Gmail address.
*   `SMTP_PASS`: Your 16-character secure Google App Password (without spaces).
*   `FROM_EMAIL`: Your Gmail address.

---

## 4. Manual Testing & Verification

Follow these steps to verify both email delivery and QR code scanning:

1. Launch your backend and React client servers.
2. Log in, select a movie, choose seats, and complete a test transaction.
3. Verify that the console prints a success message: `✉️ Confirmation email sent successfully`.
4. Open the recipient's inbox and open the booking email.
5. Open the attached PDF and verify the formatting is aligned correctly.
6. Open your mobile phone's camera or a QR scanner app and scan the QR code printed on the PDF.
7. Verify that your phone displays the booking info (Booking ID, Movie Title, Theatre name, Seat numbers, and confirmation date).
