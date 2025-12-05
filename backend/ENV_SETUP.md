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








