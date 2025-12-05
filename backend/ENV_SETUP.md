# Environment Variables Setup

Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
# Replace with your MongoDB connection string
# Local: mongodb://localhost:27017/festo
# MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/festo?retryWrites=true&w=majority
MONGODB_URI=mongodb://localhost:27017/festo

# JWT Secret Key
# Generate a strong random string: openssl rand -base64 32
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Razorpay Payment Gateway Configuration
# Get from: https://dashboard.razorpay.com/app/keys
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# Email Configuration (SMTP)
# For Gmail: Enable 2FA and use App Password
# Get App Password: https://myaccount.google.com/apppasswords
# IMPORTANT: SMTP_USER must be a valid Gmail address (e.g., razaaatif658@gmail.com)
# DO NOT use admin@lumiere.com or any invalid email address
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=razaaatif658@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=Lumière Events

# Cloudinary Configuration (for image uploads)
# Get from: https://cloudinary.com/console
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Admin Configuration
ADMIN_EMAIL=razaaatif658@gmail.com
ADMIN_PASSWORD=Admin@123
```

## Setup Instructions:

1. **MongoDB:**
   - Local: Install MongoDB and use `mongodb://localhost:27017/festo`
   - Cloud: Use MongoDB Atlas and get connection string

2. **Razorpay:**
   - Sign up at https://razorpay.com
   - Go to Dashboard > Settings > API Keys
   - Copy Key ID and Key Secret

3. **Email (Gmail):**
   - Enable 2-Factor Authentication
   - Generate App Password: https://myaccount.google.com/apppasswords
   - Use App Password (not regular password)
   - **IMPORTANT:** SMTP_USER must be set to a valid Gmail address (e.g., razaaatif658@gmail.com)
   - DO NOT use admin@lumiere.com or any invalid/non-existent email address
   - The SMTP_USER email will be used as the "FROM" address for all emails

4. **Cloudinary:**
   - Sign up at https://cloudinary.com
   - Get credentials from Dashboard

5. **JWT Secret:**
   - Generate: `openssl rand -base64 32`
   - Or use any strong random string

## Production Deployment (Render, Vercel, etc.)

### ⚠️ IMPORTANT: Environment Variables on Production

**For production servers (like Render), you MUST set environment variables in the hosting platform's dashboard, NOT just in a `.env` file.**

The `.env` file is only for local development. Production servers need environment variables set in their dashboard.

### Steps for Render:

1. **Go to your Render Dashboard**
2. **Select your backend service**
3. **Go to "Environment" tab**
4. **Add all environment variables** from the list above:
   - `PORT` (usually auto-set by Render)
   - `NODE_ENV=production`
   - `MONGODB_URI` (your MongoDB Atlas connection string)
   - `JWT_SECRET` (generate a new one for production)
   - `RAZORPAY_KEY_ID` (use live keys for production)
   - `RAZORPAY_KEY_SECRET` (use live keys for production)
   - `SMTP_HOST=smtp.gmail.com`
   - `SMTP_PORT=587`
   - `SMTP_USER=razaaatif658@gmail.com` (your Gmail address)
   - `SMTP_PASS=your-16-char-app-password` (Gmail App Password)
   - `SMTP_FROM=Lumière Events`
   - `ADMIN_EMAIL=razaaatif658@gmail.com`
   - `ADMIN_PASSWORD=your-secure-password`
   - `CLOUDINARY_CLOUD_NAME=your-cloud-name`
   - `CLOUDINARY_API_KEY=your-api-key`
   - `CLOUDINARY_API_SECRET=your-api-secret`

5. **After adding variables, restart your service**

### Testing Email Configuration:

After setting up environment variables, you can test email configuration:

1. **Login to admin panel**
2. **Make a POST request to:** `/api/admin/test-email`
   - Or use the admin dashboard if a UI is available
3. **Check the response** for configuration status
4. **Check your email inbox** for the test email

### Common Email Issues on Production:

1. **Emails not sending:**
   - ✅ Check if `SMTP_USER` and `SMTP_PASS` are set in production environment
   - ✅ Verify Gmail App Password is correct (16 characters, no spaces)
   - ✅ Ensure 2FA is enabled on Gmail account
   - ✅ Check server logs for detailed error messages

2. **"SMTP credentials not configured" error:**
   - Environment variables are not set in production dashboard
   - Restart server after setting variables

3. **"Invalid login" or "Authentication failed" error:**
   - Gmail App Password is incorrect
   - Generate a new App Password: https://myaccount.google.com/apppasswords

4. **"Connection timeout" error:**
   - Check if `SMTP_PORT=587` is set correctly
   - Some hosting providers block port 587, try port 465 with `secure: true`

### Email Test Endpoint:

**POST** `/api/admin/test-email`

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json
```

**Body (optional):**
```json
{
  "email": "test@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Test email sent successfully! Check your inbox.",
  "config": {
    "SMTP_HOST": "smtp.gmail.com",
    "SMTP_PORT": "587",
    "SMTP_USER": "raz***",
    "SMTP_PASS": "SET",
    "ADMIN_EMAIL": "razaaatif658@gmail.com",
    "NODE_ENV": "production"
  },
  "verification": {
    "success": true
  },
  "email": {
    "success": true,
    "messageId": "..."
  }
}
```








