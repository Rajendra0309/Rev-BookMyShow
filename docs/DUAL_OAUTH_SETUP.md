# 🔐 Dual OAuth Setup Guide: Google & Microsoft Integration
> **Secure Social Sign-In using Firebase Auth (Client) & MERN JWT Validation (Server)**

This guide details the implementation and configuration steps to enable Google and Microsoft Social Logins.

---

## 1. System Architecture Flow

The system uses a hybrid approach to authentication:
1. **Client Authentication:** React uses the Firebase Client SDK to open sign-in popups for Google and Microsoft.
2. **Identity Verification:** On successful authentication, Firebase returns an ID Token (`JWT`) to the React client.
3. **Session Issuance:** The client POSTs the ID Token to the Express backend (`/api/auth/social-login`).
4. **Token Verification:** The backend verifies the token using the `firebase-admin` SDK.
5. **Database Synchronization:** The backend checks MongoDB for the user's email. If the user does not exist, a new user account is created.
6. **Application Login:** Express generates a local application JWT token and sends it to the client for session storage.

---

## 2. Cloud Configuration Steps

### A. Firebase Console Setup
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Create or select your project.
3. In the left navigation bar, go to **Build** -> **Authentication** and click **Get Started**.
4. Navigate to the **Sign-in method** tab:
   * **Google:** Click Google -> Toggle Enable -> Set Project Support Email -> Save.
   * **Microsoft:** Click Microsoft -> Toggle Enable. Copy the **Redirect URI** provided at the bottom of the dialog. Keep this settings page open.

### B. Azure Portal App Registration (For Microsoft Login)
1. Log in to the [Azure Portal](https://portal.azure.com/).
2. Search for and select **Microsoft Entra ID**.
3. Under Manage in the left panel, click **App registrations** -> **New registration**:
   * **Name:** `Rev-BookMyShow`
   * **Supported Account Types:** Select *"Accounts in any organizational directory (Any Microsoft Entra ID tenant - Multitenant) and personal Microsoft accounts (e.g. Skype, Xbox)"*.
   * **Redirect URI:** Select **Web** from the dropdown, and paste the **Redirect URI** copied from the Firebase Microsoft sign-in page.
   * Click **Register**.
4. In the app overview screen, copy the **Application (client) ID**.
5. In the left menu, click **Certificates & secrets** -> **New client secret**:
   * Input a description and select an expiration date.
   * Click **Add**.
   * Copy the secret **Value** immediately (this will not be displayed again).
6. Return to your Firebase Console (Microsoft Auth configuration settings):
   * Paste the **Application (client) ID** into the *Application ID* field.
   * Paste the **Client Secret Value** into the *Client Secret* field.
   * Click **Save**.

---

## 3. Local Environment Configuration

### A. Frontend Environment Variables
Create or update `frontend/.env` in the React root directory:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### B. Backend Private Key Credentials
The backend verifies incoming logins using a service account private key file.
1. In the Firebase Console, go to **Project Settings** -> **Service Accounts**.
2. Click the blue **Generate New Private Key** button.
3. Save the downloaded `.json` file in your backend folder at:
   `backend/config/firebase-service-account.json`
4. *(Note: This file is ignored by Git in `.gitignore` to prevent committing security keys to public repositories).*

---

## 4. Production Cloud Deployment (Render/AWS)

Because your service account JSON file is ignored by Git, you must configure your production environment to load these credentials dynamically.

### A. Environment variables
On your Render or AWS service configuration page, add the following Environment Variables:

| Key | Value | Description |
| :--- | :--- | :--- |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | `{ ... }` | Copy and paste the *entire contents* of your `firebase-service-account.json` file as the value. |
| `VITE_FIREBASE_API_KEY` | `your_api_key` | Required by the frontend build script. |
| `VITE_FIREBASE_AUTH_DOMAIN` | `your_auth_domain` | Required by the frontend build script. |
| `VITE_FIREBASE_PROJECT_ID` | `your_project_id` | Required by the frontend build script. |
| `VITE_FIREBASE_STORAGE_BUCKET` | `your_storage_bucket` | Required by the frontend build script. |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `your_sender_id` | Required by the frontend build script. |
| `VITE_FIREBASE_APP_ID` | `your_app_id` | Required by the frontend build script. |
| `VITE_FIREBASE_MEASUREMENT_ID` | `your_measurement_id` | Required by the frontend build script. |

---

## 5. Codebase Implementation Details

### A. Frontend SDK Configuration (`frontend/src/config/firebase.js`)
Initializes the Firebase Client App and sets up the Google and Microsoft authentication providers:
```javascript
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const microsoftProvider = new OAuthProvider("microsoft.com");
```

### B. User DB Schema (`backend/models/User.js`)
Updated to support optional passwords (since OAuth users have no password) and store provider identifiers:
```javascript
password: { type: String, required: false },
googleId: { type: String },
microsoftId: { type: String },
authProvider: { type: String, enum: ['local', 'google', 'microsoft'], default: 'local' }
```

### C. Backend API Endpoint (`backend/controllers/authController.js`)
The `socialLogin` route checks, verifies, and synchronizes the client credentials with MongoDB:
```javascript
const socialLogin = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ msg: 'Token is required' });

        const decodedToken = await admin.auth().verifyIdToken(token);
        const { email, name, uid, firebase } = decodedToken;
        const provider = firebase.sign_in_provider === 'google.com' ? 'google' : 'microsoft';

        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                name: name || email.split('@')[0],
                email,
                role: 'Customer',
                authProvider: provider,
                googleId: provider === 'google' ? uid : undefined,
                microsoftId: provider === 'microsoft' ? uid : undefined,
                status: 'Active'
            });
        } else {
            let updated = false;
            if (provider === 'google' && !user.googleId) {
                user.googleId = uid;
                user.authProvider = 'google';
                updated = true;
            } else if (provider === 'microsoft' && !user.microsoftId) {
                user.microsoftId = uid;
                user.authProvider = 'microsoft';
                updated = true;
            }
            if (updated) await user.save();
        }

        res.status(200).json({
            token: generateToken(user._id, user.role),
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (err) {
        res.status(401).json({ msg: 'Invalid or expired authorization token' });
    }
};
```
