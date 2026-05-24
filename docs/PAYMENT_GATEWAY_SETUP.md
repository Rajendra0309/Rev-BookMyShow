# 💳 Razorpay Payment Gateway Integration Setup & Testing Guide
> **Interactive Ticket Checkout using Razorpay Test Mode (Cards, UPI, and QR Code)**

This document explains the conceptual integration, configuration parameters, and manual validation steps for the checkout system.

---

## 1. Core Integration Workflow

The checkout system functions as a secure three-way transaction flow between the client portal, the server API, and Razorpay's processing servers:

1. **Pre-Payment Verification:** When seats are confirmed, the system verifies seat availability and calculates the ticket total.
2. **Order Registration:** The backend server registers a secure payment transaction with Razorpay. Razorpay returns a unique transaction order identifier.
3. **Checkout Widget Interface:** The frontend loads the secure checkout screen on top of the seat selection page.
4. **Simulated Authorization:** The customer executes the payment inside the checkout interface (using test mode cards, UPI accounts, or simulated QR codes).
5. **Authenticity Signature Verification:** Once authorization succeeds, Razorpay returns a payment signature. The backend validates this signature cryptographically using keys before saving the reservation to MongoDB.

---

## 2. Setting Up Razorpay Credentials

To test checkout features, a secure developer API key pair must be generated.

### A. Razorpay Account Access
1. Visit the Razorpay Developer portal and sign up for a free developer account.
2. Complete the initial registration panel. Select standard options (such as unregistered business or freelancer) to bypass uploading official documents.
3. Once the main dashboard loads, verify that the toggle at the top navigation bar is set to **Test Mode** (instead of "Live Mode"). All transactions remain sandboxed and free of charge.

### B. Activating Payment Capabilities
1. Navigate to **Account & Settings** in the left sidebar menu.
2. Under the **Business Settings** category, click on **Payment Methods**.
3. Inspect the status list:
   * **Cards:** Make sure cards are active.
   * **UPI / QR Code:** If the status is showing as "Inactive", click **Activate** or **Request**. The approval in Test Mode is processed automatically and takes effect immediately.

### C. Key Generation
1. Inside **Account & Settings**, select the **API Keys** section.
2. Click the **Generate Key** button.
3. Copy the two displayed values to your secure local credentials files:
   * **Key ID:** Used by both frontend client widgets and the backend.
   * **Key Secret:** Used exclusively by the backend to verify payments.

---

## 3. Project Configuration Variables

Ensure the generated credentials are saved in the project files as environment variables.

### A. Backend Variables (`backend/.env`)
Set these parameters in the backend root directory file:
* `RAZORPAY_KEY_ID` (Paste your generated Key ID)
* `RAZORPAY_KEY_SECRET` (Paste your generated Key Secret)

### B. Frontend Variables (`frontend/.env`)
Set this parameter in the frontend root directory file:
* `VITE_RAZORPAY_KEY_ID` (Paste your generated Key ID)

*(Note: For production cloud servers such as Render, these exact keys must be added to the Environment Variables settings panel before deploying).*

---

## 4. Step-by-Step Testing & Verification

Use the following test procedures to verify that payments function correctly.

### A. Testing Card Transactions
1. Run the local servers and navigate to the application movie seat selection screen.
2. Select your seats and click **Confirm Booking**.
3. The checkout frame will slide open on the screen. Select **Cards** as the payment option.
4. Input the following test parameters:
   * **Card Number:** Use standard Visa test card number `4111 1111 1111 1111`.
   * **Expiry Date:** Enter any valid future date (e.g. `12/30`).
   * **CVV:** Enter any three digits (e.g. `123`).
5. Click the submit button.
6. A mock bank validation screen will open on the interface. 
7. Click the green **Success** button. 
8. The checkout screen will close, your transaction will be finalized, and the booking confirmation card will display.

### B. Testing UPI & QR Code Payments
1. Start seat selection, click **Confirm Booking**, and select **UPI** from the options list in the checkout frame.
2. **UPI ID Test:**
   * Select the UPI ID text box and enter a test address (e.g. `success@razorpay`).
   * Click Pay, then approve the transaction in the simulated bank notification interface.
3. **QR Code Test:**
   * Select the **QR Code** option.
   * A simulated scannable QR Code will load on screen.
   * Scan or click the mock approval trigger to complete the payment.

### C. Verifying the Database Records
To confirm the transaction details are stored securely:
1. Open your MongoDB administration tool or MongoDB Atlas dashboard.
2. Navigate to the `bookings` collection.
3. Inspect the newly created document. Verify that:
   * The `status` field is set to `Confirmed`.
   * The `paymentStatus` field is set to `Completed`.
   * The fields `razorpayOrderId`, `razorpayPaymentId`, and `razorpaySignature` contain valid transaction hash values.
