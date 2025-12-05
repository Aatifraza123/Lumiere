# Frontend Environment Variables Setup

Create a `.env` file in the `frontend` directory with the following variables:

```env
# API Configuration
# Backend API URL
# Development: http://localhost:5000/api
# Production: https://your-api-domain.com/api
VITE_API_URL=http://localhost:5000/api

# Razorpay Configuration
# Get from: https://dashboard.razorpay.com/app/keys
# Use the same KEY_ID as in backend .env file
VITE_RAZORPAY_KEY_ID=your-razorpay-key-id
```

## Setup Instructions:

1. **API URL:**
   - Development: `http://localhost:5000/api`
   - Production: Replace with your deployed backend URL

2. **Razorpay Key ID:**
   - Same as `RAZORPAY_KEY_ID` in backend `.env`
   - Get from: https://dashboard.razorpay.com/app/keys

## Important Notes:

- All Vite environment variables must start with `VITE_`
- After changing `.env`, restart the dev server
- Never commit `.env` file to git











