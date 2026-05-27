# ☁️ AWS S3 Movie Poster Uploads – Setup & Testing Guide

This guide details how to configure AWS, set up your S3 bucket permissions, define credentials, and test the direct movie poster upload feature.

---

## 🔑 Step 1 — AWS S3 Bucket Setup

For posters to display correctly on the frontend, the uploaded images must be publicly readable.

### A. Create the Bucket
1. Log into your **AWS Console** and search for **S3**.
2. Click **Create bucket**.
3. Name your bucket (e.g., `rev-bookmyshow-posters`).
4. Select your region (e.g., `us-east-1`).
5. Under **Object Ownership**, select **ACLs enabled** (and select **Bucket owner preferred**).
6. Under **Block Public Access settings for this bucket**:
   * *Option 1 (Recommended):* Uncheck **Block all public access** (to allow public-read ACLs).
   * *Option 2:* Leave public access blocked, and configure a CloudFront CDN or custom bucket policy for public access.
7. Click **Create bucket**.

### B. Add Bucket Policy (Required if ACLs are blocked)
If public ACLs are disallowed by your organization, add the following policy under the **Permissions** tab of your bucket to make all uploaded posters public:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/posters/*"
    }
  ]
}
```
*(Replace `YOUR_BUCKET_NAME` with your actual bucket name).*

---

## 🔑 Step 2 — Create IAM User Credentials

1. Go to the **IAM Console** in AWS.
2. Go to **Users** -> click **Create user**.
3. Name it `rev-bookmyshow-uploader`.
4. Under **Attach policies directly**, search for and select:
   * **`AmazonS3FullAccess`** (or create a custom inline policy allowing `s3:PutObject` and `s3:PutObjectAcl` on your bucket).
5. Complete user creation.
6. Click on the created user -> go to the **Security credentials** tab -> click **Create access key**.
7. Select **Command Line Interface (CLI)** or **Application integration**, and click Next.
8. Copy the **Access Key ID** and **Secret Access Key**.

---

## ⚙️ Step 3 — Environment Variables Configuration

Add these variables to your `backend/.env` file or Render's Environment panel:

```
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-east-1
AWS_BUCKET_NAME=rev-bookmyshow-posters
```

---

## 🧪 Step 4 — Testing the Integration

### Method A: Testing from the Admin UI (Vite App)
1. Log in as an **Admin** user.
2. Navigate to the **Admin Panel** (`/admin/show/create`).
3. Under **Movie Management**, fill out the movie details.
4. Locate the **Movie Poster Image** section.
5. Click **Upload File** and select a local image (JPEG/PNG) from your computer.
6. **Expected Behavior:**
   * The button changes to `Uploading...`.
   * Upon completion, a browser alert says: `Poster uploaded to S3 successfully!`.
   * A **Poster Preview** thumbnail renders instantly inside the form.
   * The `imageUrl` text field automatically populates with the S3 URL (e.g. `https://bucket.s3.region.amazonaws.com/posters/12345.jpg`).

---

### Method B: Testing via Thunder Client / Postman (API)
Send a multipart request to the upload route:

```
POST http://localhost:5000/api/movies/upload
Header → Authorization: Bearer <admin_token>
Body → Form-Data
  - Key: "image"
  - Value: [Select Image File]
```

✅ **Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Image uploaded successfully to AWS S3",
  "imageUrl": "https://rev-bookmyshow-posters.s3.us-east-1.amazonaws.com/posters/177983610239-58302.jpg"
}
```

---

## ❌ S3 Upload Troubleshooting Index

| Error Code / Message | Root Cause | Fix |
|:---|:---|:---|
| `AccessDenied (403)` | The IAM user doesn't have permissions or the bucket restricts public ACLs. | 1. Ensure IAM user has `AmazonS3FullAccess`. <br> 2. Ensure your S3 bucket block settings allow public ACLs, or add the bucket policy shown in Step 1B. |
| `NoSuchBucket (404)` | The `AWS_BUCKET_NAME` env variable doesn't match your S3 bucket name. | Verify the spelling of the bucket name in your `.env` file. |
| `InvalidAccessKeyId` | The `AWS_ACCESS_KEY_ID` or secret is incorrect. | Re-generate IAM access keys and update your `.env` values. |
| `Only image files are allowed` | You uploaded a file with a non-image MIME type (e.g., `.pdf` or `.txt`). | Ensure you select a valid image file (JPEG, PNG, WEBP). |
