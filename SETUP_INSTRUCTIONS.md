# Environment Variables Setup Instructions

## Quick Setup

### Backend Setup

1. **Create `.env` file in `backend/` directory:**
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Edit `backend/.env` and fill in your values:**
   - **MongoDB URI**: Your MongoDB connection string
   - **JWT_SECRET**: Generate with `openssl rand -base64 32`
   - **Razorpay Keys**: Get from https://dashboard.razorpay.com/app/keys
   - **SMTP Credentials**: Gmail App Password (not regular password)
   - **Cloudinary**: Get from https://cloudinary.com/console

### Frontend Setup

1. **Create `.env` file in `frontend/` directory:**
   ```bash
   cd frontend
   cp .env.example .env
   ```

2. **Edit `frontend/.env` and fill in your values:**
   - **VITE_API_URL**: Backend API URL (default: `http://localhost:5000/api`)
   - **VITE_RAZORPAY_KEY_ID**: Same as `RAZORPAY_KEY_ID` in backend `.env`

## Detailed Configuration Guide

### 1. MongoDB Setup

**Option A: Local MongoDB**
```env
MONGODB_URI=mongodb://localhost:27017/festo
```

**Option B: MongoDB Atlas (Cloud)**
1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/festo?retryWrites=true&w=majority
```

### 2. Razorpay Setup

1. Sign up at https://razorpay.com
2. Go to Dashboard → Settings → API Keys
3. Generate Test/Live keys
4. Copy Key ID and Key Secret to `.env`:
```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your-secret-key-here
```

### 3. Email Setup (Gmail)

1. Enable 2-Factor Authentication on your Gmail account
2. Go to https://myaccount.google.com/apppasswords
3. Generate an App Password for "Mail"
4. Use in `.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
SMTP_FROM=Lumière Events
```

### 4. Cloudinary Setup (Image Uploads)

1. Sign up at https://cloudinary.com
2. Go to Dashboard
3. Copy credentials:
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your-api-secret
```

### 5. JWT Secret

Generate a secure random string:
```bash
openssl rand -base64 32
```

Or use any strong random string (minimum 32 characters recommended).

## Security Notes

⚠️ **IMPORTANT:**
- Never commit `.env` files to git
- Keep `.env` files secure and private
- Use different credentials for development and production
- Rotate secrets regularly in production

## Verification

After setting up `.env` files:

1. **Backend:**
   ```bash
   cd backend
   npm run dev
   ```
   Check console for:
   - ✅ MongoDB Connected
   - ✅ Server running on port 5000

2. **Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```
   Check browser console for API connection.

## Troubleshooting

### MongoDB Connection Failed
- Check if MongoDB is running (local)
- Verify connection string format
- Check network/firewall settings (Atlas)

### Razorpay Not Working
- Verify Key ID and Secret are correct
- Check if using Test keys in test mode
- Ensure keys match in both frontend and backend

### Email Not Sending
- Verify Gmail App Password (not regular password)
- Check 2FA is enabled
- Verify SMTP settings

### Cloudinary Upload Failed
- Verify all three credentials (cloud_name, api_key, api_secret)
- Check account status and limits












