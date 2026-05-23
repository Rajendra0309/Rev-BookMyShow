# 🎓 Capstone Upgrade Plan: Rev-BookMyShow
> **MERN Stack + AWS Cloud + Data Engineering + AI Integration**

This document serves as the master blueprint for upgrading the **RevBookMyShow** application into a production-grade Capstone Project. It details what is currently built, what is being added, how the architecture changes, and how a team of 5 can execute this over 4 weeks.

---

## 1. Feature Comparison: Current vs. Upgraded System

| Module | Current Features (Old) | Upgraded Features (New) | Capstone Tech Value |
| :--- | :--- | :--- | :--- |
| **Authentication** | Email & Password signup/login + JWT tokens stored locally. | **Google & Microsoft Social Login** (OAuth 2.0) via Firebase Auth frontend integrated with MERN JWT backend. | **Identity & Access Management (IAM)**, security standard practices. |
| **Core Booking & Payments** | Select seats, calculate totals, click "Book", and save booking to MongoDB. | **Mock Payment Gateway (Stripe/Razorpay)** with support for credit cards and UPI (with simulated QR codes). | **E-Commerce Integration**, transaction handling. |
| **Notifications & Tickets** | Simple in-app text alerts showing booking status. | **Serverless PDF Ticket Generation** via AWS Lambda + automated email delivery with attached PDFs via Amazon SES. | **Serverless Computing & Cloud-Native Services**. |
| **Movie Assets** | Admins insert text URLs of poster images from the web. | **AWS S3 Image Uploads** allowing Admins to upload image files directly from their local computers. | **Cloud Asset Storage & CDN Delivery**. |
| **Data Engineering** | Simple admin page reading booking counts directly from MongoDB. | **Clickstream Data Ingestion + Python ETL Pipeline.** Users' clicks and searches are tracked, processed via Pandas, and loaded into an analytics schema. Visualized using **Recharts** on the Admin dashboard. | **Data Pipeline (ETL), Event Tracking, Business Intelligence (BI)**. |
| **Artificial Intelligence** | No AI features. | **1. Gemini AI Conversational Assistant** (Chatbot for booking/recommendation).<br>**2. FastAPI Recommendation Microservice** (Collaborative Filtering). | **Generative AI Agents, Machine Learning Microservices**. |

---

## 2. Updated Architecture (Simple & Robust)

This architecture runs both the Express API and the Python microservice on a single **AWS EC2** instance, utilizing **MongoDB Atlas** for data, **AWS S3/CloudFront** for assets and frontend delivery, and **AWS Lambda** for serverless operations.

# Old Architecture

``` mermaid
graph TD
    %% Client Tier
    subgraph ClientTier [Client Tier - Localhost:5173]
        direction LR
        Portal[React.js Client Portal]
        Admin[Admin Panel]
    end

    %% Server Tier
    subgraph ServerTier [Server Tier - Localhost:5000]
        direction LR
        Express[Express.js Server]
        JWT[JWT Authentication]
    end

    %% Data Tier
    subgraph DataTier [Data Tier]
        Mongo[(MongoDB Atlas Free Tier)]
    end

    %% Connections
    Portal -->|REST API Requests| Express
    Admin -->|REST API Requests| Express
    Express -->|Read/Write Operations| Mongo
```

[![](https://mermaid.ink/img/pako:eNqNU-9r2zAQ_VfEQWEDJ_OPRHb9YZAlHWy0LKSBwux90KxromFLniSPbmn-98lWk3kQ2AS2fO_e3T09rANUiiPksNOs3ZPtqpTErasrsqwFSku2ArXHTPfVk3ymT5BixCITcqsqVu-Vsfk8SpMvvq5fXGisrFCS3G7-oGulLauLDbLKTr-Z00gPj6oXvBGyGN5kzSSecih5Kc-C71H_cCouCPYZL3jE-ltwGIb_FHzz1Go0pnjZe82-36jy48O2cA9ZdHbvTiMq1re5qHjFLLukt8e92jNjNOBOyZ0qXg3b6h1Z2JoZ8l4jDsTXFyctlZT-PMZj3mMymbx93tzcO7XrD2SD3zs01jyfzump3vf_Yb4EnouMv3nQwiL51KIeTHD8QTUE7ncTHHKrOwygQd2wPoRD36cEZ1yDJeTuk-Mj62pbQimPrqxl8rNSzalSq263h_yR1cZFXcuZxZVgzsXmjGrnBOql6qSFPIqzZOgC-QGeII9pNp1FSZaFUXpN5zGlAfx0NJpOaRbG1_MsoTQJ42MAv4a54ZRGlIYzGtMozdJZNA8AubBK3_l7NFyn428prwvt?type=png)](https://mermaid.live/edit#pako:eNqNU-9r2zAQ_VfEQWEDJ_OPRHb9YZAlHWy0LKSBwux90KxromFLniSPbmn-98lWk3kQ2AS2fO_e3T09rANUiiPksNOs3ZPtqpTErasrsqwFSku2ArXHTPfVk3ymT5BixCITcqsqVu-Vsfk8SpMvvq5fXGisrFCS3G7-oGulLauLDbLKTr-Z00gPj6oXvBGyGN5kzSSecih5Kc-C71H_cCouCPYZL3jE-ltwGIb_FHzz1Go0pnjZe82-36jy48O2cA9ZdHbvTiMq1re5qHjFLLukt8e92jNjNOBOyZ0qXg3b6h1Z2JoZ8l4jDsTXFyctlZT-PMZj3mMymbx93tzcO7XrD2SD3zs01jyfzump3vf_Yb4EnouMv3nQwiL51KIeTHD8QTUE7ncTHHKrOwygQd2wPoRD36cEZ1yDJeTuk-Mj62pbQimPrqxl8rNSzalSq263h_yR1cZFXcuZxZVgzsXmjGrnBOql6qSFPIqzZOgC-QGeII9pNp1FSZaFUXpN5zGlAfx0NJpOaRbG1_MsoTQJ42MAv4a54ZRGlIYzGtMozdJZNA8AubBK3_l7NFyn428prwvt)

---

# Updated Architecture

``` mermaid
graph LR
    %% Styling Classes
    classDef client fill:#e1f5fe,stroke:#0288d1,stroke-width:1px;
    classDef backend fill:#e8f5e9,stroke:#388e3c,stroke-width:1px;
    classDef storage fill:#fff3e0,stroke:#f57c00,stroke-width:1px;
    classDef cloud fill:#ede7f6,stroke:#5e35b1,stroke-width:1px;
    classDef ai fill:#fce4ec,stroke:#c2185b,stroke-width:1px;

    %% Client Tier
    subgraph ClientTier [Client Tier - AWS S3 & CloudFront]
        UI[React Client App]:::client
        Admin[Admin Dashboard + Recharts]:::client
        ChatbotUI[Gemini Chatbot Widget]:::client
    end

    %% Application Tier
    subgraph AppTier [Application Tier - AWS EC2 Instance]
        API[Express.js Node API]:::backend
        AIService[Python FastAPI Recommender]:::ai
        ETLScript[Python Pandas ETL Script]:::cloud
    end

    %% Storage Tier
    subgraph StorageTier [Database & Assets]
        Mongo[(MongoDB Atlas M0 - Free)]:::storage
        S3Bucket[(AWS S3 Bucket - Posters & PDFs)]:::storage
    end

    %% Serverless Tier
    subgraph ServerlessTier [Serverless Dispatcher - AWS Lambda]
        Lambda[AWS Lambda PDF Generator]:::cloud
        SES[Amazon SES / Gmail SMTP]:::cloud
    end

    %% External AI
    Gemini[Gemini API - Free]:::ai

    %% --- Connections ---

    %% 1. Core Requests
    UI -->|1. HTTP Requests| API
    Admin -->|HTTP Requests| API
    ChatbotUI -->|2. Secure Chat API| API

    %% 2. Backend Logic
    API -->|3. Read/Write Data| Mongo
    API -->|4. Get Recommendations| AIService
    API -->|5. Forward Chat| Gemini
    API -->|6. Upload Posters| S3Bucket
    API -->|7. Trigger PDF Gen| Lambda

    %% 3. Serverless Flow
    Lambda -->|8. Store PDF| S3Bucket
    Lambda -->|9. Send Email| SES
    SES -.->|10. Deliver Email| UI

    %% 4. Data Engineering (Clickstream)
    UI -.->|A. Stream Logs| API
    API -.->|B. Save Logs| Mongo
    ETLScript -->|C. Extract & Aggregate| Mongo
    ETLScript -->|D. Load Metrics| Mongo
    API -->|E. Fetch Charts Data| Admin
```

[![](https://mermaid.ink/img/pako:eNqFVm1v4kYQ_isrn67KqeCzAYNxpUqElzRSqFAgilRyH5b12GzjF7q7XJIL-e-d9drGofTCB_DOPPP-7OBXi-UhWIEVC7rbkpvbh4zg5_NnslQvCc9iMk6olCCNnOnDBCJ84JApEvEkCT6BG3kRtKQS-SMEn5yO74dueWw_8VBtA3f3_NuJiw1lj5CFlQ8_8mBY--j6PnTZhz6kygWNofQRRVEXnNpH5A2Y43zogyX5vs4ihEHUrz140PU2H1dCeZUAgx6w2px1XN_bnDOvuzw2fVxxEEYm9xszCqPRCrJuoEibjO6XZNklvyAEM5-JPFPfjLH-3F2vb4EyVbke7XbfgiAwAzvCRmHKs3XxTSZUbjc5FSH5ldwC21Kh5Dmb8ZaqTa4wwhWgHa8E5J6HMahTExxuo1LMI-GMKp5n58pFtan1FFcWPB13yHUmFc0YNKodLa7X0-edACntvyX5E8msZTqVkl8N7PUSxHfOYL14UVt0P6NSIVjXnKcpYkFoQ8qPNtPVzZIJvlOVzYJmIZVaTozCVI2DOFf0suTnmYJLlSl6QhXdUAk41BHeNmz_MYV5nsX5-qL4mVySkULakbmDfZkJgC86fnkNjjbL7uUeq1fri5Is5og2i1wqEBIDLSYz-V_rk_yxYSAS7O7ZEmqtqaKBnnC5o4pt6_nd0HQT0kZZRrA-6nRC5AoyEBQTOmlrUdR0uR6l9AdOAR_JV3KVUp6Q5Xy1-OkQps9YcUYTJICRGfZWJNYMML2shl9bttttMs6zDJimo9Tnhta1USkA6fPPHqQqV-Qdemv_fkDlH6vVolYedByDMJdOg_4PUV-0AtWxsdNsj5G0XKNKaJ0JIi7LbXqTx5yVcRbGvmtjDBp-vRdcAdFUOxhSvYf1bGyMOl6G4grqrKpr8x7u2WSWiye9NXRah7Kr70F9m9ztkpyGFe8ONTXfAwc2WQkex8iXkgaHkhaNMrt2k5CzJH8yqpI_2o9vFxcLtJfTWA3YUHvCbk01gw6aTgaiedW29fgcm0wg4RisAt01O47N0o0k0yzmGYDQ_5QXuHHZI257oOmXIxm0u5FOS8v1fN5xYVEiLhFBv0Opb4yn3kBF4mNb01no_Y6rIo4FxFTBTwwmNrrE_s9BCc7k2clPcZSAl1UPEld_SZGCplYL3wx4aAVK7KFlpSCwGXi0XrWLB0ttIYUHK8DHECK6T9SD9ZC9odmOZn_leVpZinwfb60goonE036H9IIJp7hI0loqihU8zveZsgK347qFFyt4tZ7x3B3YjucMvP7QGXZ6Pa_Xsl40zLcdx3U7nX5v4HYcf_DWsn4UgR174Pf7bs8b9v1ed-AOvZYFIUd6zM07T_Hq8_Yv0oTSJQ?type=png)](https://mermaid.live/edit#pako:eNqFVm1v4kYQ_isrn67KqeCzAYNxpUqElzRSqFAgilRyH5b12GzjF7q7XJIL-e-d9drGofTCB_DOPPP-7OBXi-UhWIEVC7rbkpvbh4zg5_NnslQvCc9iMk6olCCNnOnDBCJ84JApEvEkCT6BG3kRtKQS-SMEn5yO74dueWw_8VBtA3f3_NuJiw1lj5CFlQ8_8mBY--j6PnTZhz6kygWNofQRRVEXnNpH5A2Y43zogyX5vs4ihEHUrz140PU2H1dCeZUAgx6w2px1XN_bnDOvuzw2fVxxEEYm9xszCqPRCrJuoEibjO6XZNklvyAEM5-JPFPfjLH-3F2vb4EyVbke7XbfgiAwAzvCRmHKs3XxTSZUbjc5FSH5ldwC21Kh5Dmb8ZaqTa4wwhWgHa8E5J6HMahTExxuo1LMI-GMKp5n58pFtan1FFcWPB13yHUmFc0YNKodLa7X0-edACntvyX5E8msZTqVkl8N7PUSxHfOYL14UVt0P6NSIVjXnKcpYkFoQ8qPNtPVzZIJvlOVzYJmIZVaTozCVI2DOFf0suTnmYJLlSl6QhXdUAk41BHeNmz_MYV5nsX5-qL4mVySkULakbmDfZkJgC86fnkNjjbL7uUeq1fri5Is5og2i1wqEBIDLSYz-V_rk_yxYSAS7O7ZEmqtqaKBnnC5o4pt6_nd0HQT0kZZRrA-6nRC5AoyEBQTOmlrUdR0uR6l9AdOAR_JV3KVUp6Q5Xy1-OkQps9YcUYTJICRGfZWJNYMML2shl9bttttMs6zDJimo9Tnhta1USkA6fPPHqQqV-Qdemv_fkDlH6vVolYedByDMJdOg_4PUV-0AtWxsdNsj5G0XKNKaJ0JIi7LbXqTx5yVcRbGvmtjDBp-vRdcAdFUOxhSvYf1bGyMOl6G4grqrKpr8x7u2WSWiye9NXRah7Kr70F9m9ztkpyGFe8ONTXfAwc2WQkex8iXkgaHkhaNMrt2k5CzJH8yqpI_2o9vFxcLtJfTWA3YUHvCbk01gw6aTgaiedW29fgcm0wg4RisAt01O47N0o0k0yzmGYDQ_5QXuHHZI257oOmXIxm0u5FOS8v1fN5xYVEiLhFBv0Opb4yn3kBF4mNb01no_Y6rIo4FxFTBTwwmNrrE_s9BCc7k2clPcZSAl1UPEld_SZGCplYL3wx4aAVK7KFlpSCwGXi0XrWLB0ttIYUHK8DHECK6T9SD9ZC9odmOZn_leVpZinwfb60goonE036H9IIJp7hI0loqihU8zveZsgK347qFFyt4tZ7x3B3YjucMvP7QGXZ6Pa_Xsl40zLcdx3U7nX5v4HYcf_DWsn4UgR174Pf7bs8b9v1ed-AOvZYFIUd6zM07T_Hq8_Yv0oTSJQ)

---

## 3. Core Technical Workflows

### A. Dynamic UPI & Card Payment Flow
*   **Card Payment:** React integrates the Stripe Checkout modal. In Test Mode, users use credit card number `4242 4242 4242 4242` to simulate successful checkouts without any actual charges.
*   **UPI Payment:** 
    - The React app uses the `qrcode.react` library to construct a dynamic UPI URI: `upi://pay?pa=merchant@upi&pn=RevBookMyShow&am=PRICE&cu=INR`.
    - If a user scans this QR code with their mobile phone, their UPI app (GPay/Paytm) opens pre-filled with the exact details.
    - A simulated "Verify Payment" button triggers a 3-second backend check and completes the transaction.

### B. Hybrid Auth Flow (Google + Microsoft + MongoDB)
1. The user clicks "Sign in with Google" or "Sign in with Microsoft" in the React app.
2. The frontend SDK (Firebase Auth) authenticates the user and returns an ID Token.
3. React sends this token to the Express API (`POST /api/auth/social`).
4. Express verifies the token, finds or creates the user record in **MongoDB Atlas**, and responds with your application's JWT session token.

### C. Clickstream Data Engineering Pipeline (ETL)
1. **Ingest:** Frontend hooks capture click activities (e.g., search keywords, hover events on seats) and POST them to `/api/events`.
2. **Extract:** Events are saved in raw format inside the `userevents` collection in MongoDB.
3. **Transform:** A Python Pandas script runs periodically on the EC2 instance, reading raw events and calculating metrics (e.g., peak booking hours, checkout conversion rate, popular genres).
4. **Load:** Aggregated summaries are written back to a structured `analytics` collection in MongoDB.
5. **Visualize:** Recharts inside the React Admin panel queries `/api/admin/reports` to load the aggregated collections into beautiful analytics graphs.

---

## 4. 4-Week Implementation & Tasks (5-Member Team)

Since you are the lead developer, this schedule isolates components so your teammates can develop independently without interrupting your core MERN code.

```
Week 1: Containerization, EC2 Server Launch & AWS S3 Integration
├── Member 3: Dockerize applications & Launch AWS EC2 Instance
├── Rajendra (You): Configure AWS S3 SDK for image/poster uploads in Express
└── Member 5: Set up AWS SES/Gmail SMTP and verify domain access
```

```
Week 2: Ingest Clickstream & Build Data Engineering Pipeline
├── Member 4: Implement event logging wrapper in React and POST to Express
├── Member 4: Write Python Pandas ETL script to process logs on EC2
└── Member 5: Build Recharts reporting dashboard in React Admin panel
```

```
Week 3: AI Recommendation Engine & Conversational Chatbot
├── Member 2: Build Flask/FastAPI recommender service & run on EC2
├── Member 2: Create Gemini API chat system prompts & tool integrations
└── Rajendra (You): Connect React Chatbot widget and feed recommendation data to home page
```

```
Week 4: Serverless Ticket Dispatcher, CI/CD Setup & Final Testing
├── Member 3: Write AWS Lambda PDF compiler & connect S3 upload trigger
├── Rajendra (You): Create GitHub Actions workflows for automated code deployment
└── Member 5: Run end-to-end user tests, fix UI bugs, and write the final slides
```

---

## 5. Automated CI/CD (GitHub Actions)

Two GitHub Actions pipelines automate the deployment:

1.  **Frontend Deploy (`.github/workflows/frontend.yml`):**
    - Triggers on push to `main` for folder `/frontend`.
    - Installs dependencies, runs `npm run build`, uploads to S3, and invalidates CloudFront CDN cache.
2.  **Backend Deploy (`.github/workflows/backend.yml`):**
    - Triggers on push to `main` for folder `/backend`.
    - Logs in to **Amazon ECR**, builds the Docker container (using secure **Chainguard Node** base images), pushes to ECR, and redeploys the task on **AWS ECS Fargate** or restarts the service on **AWS EC2**.

---

## 6. Slide-Ready Talking Points for Presentation Day

*   **Security (DevSecOps):** *"We replaced standard Node.js base images with Chainguard Distroless Node images. This reduces our production container vulnerability count to zero, ensuring a secure-by-default deployment."*
*   **Scalable Client-Delivery:** *"The frontend is hosted on AWS S3 and cached globally via AWS CloudFront CDN. This ensures sub-second page loads and near-zero bandwidth costs."*
*   **Modern Serverless PDF Workflow:** *"We use AWS Lambda for generating PDF ticket receipts. This keeps our main API server free from heavy CPU tasks like image/PDF compiling."*
*   **Custom Data Pipeline:** *"Rather than just query raw database tables, we built an ETL pipeline. Clickstream logs are cleaned via a Python Pandas microservice, transforming raw user activities into business intelligence insights displayed directly on the admin dashboard."*
