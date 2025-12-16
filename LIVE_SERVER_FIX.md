# Live Server Troubleshooting Guide

## Issues Addressed
1. ✅ 401 (Unauthorized) errors - FIXED
2. ⚠️ Timeout errors (30-60 seconds) - NEEDS DEPLOYMENT

## Latest Update: Timeout Fix (Commit d5ab838)
Added 60-second timeout and automatic retry logic for cold starts on free hosting tiers.

## Quick Fix Steps

### 1. Deploy Latest Changes to Live Server

**IMPORTANT:** You must deploy the latest code to fix timeout issues!

#### For Render:
1. Go to https://dashboard.render.com
2. Find your backend service
3. Click "Manual Deploy" → "Deploy latest commit"
4. Wait for deployment to complete (check logs)

#### For Vercel (Frontend):
1. Go to https://vercel.com/dashboard
2. Find your project (lumiere-sandy-pi)
3. Click "Redeploy" or push will auto-deploy
4. Wait for deployment to complete

### 2. Verify Environment Variables
Make sure these are set on your live server:

```env
ADMIN_PASSWORD=Admin@123
ADMIN_EMAIL=razaaatif658@gmail.com
JWT_SECRET=your-secret-key-here
MONGODB_URI=your-mongodb-connection-string
```

### 3. Clear Browser Storage
On the live site, open browser console and run:
```javascript
localStorage.clear();
```
Then refresh and login again.

### 4. Test Login
1. Go to `/admin/login`
2. Enter password: `Admin@123`
3. Should redirect to dashboard
4. Check browser console for: `✅ Admin token stored successfully`

### 5. Verify Token Storage
After login, check browser console:
```javascript
console.log('Token:', localStorage.getItem('adminToken'));
console.log('Auth:', localStorage.getItem('adminAuthenticated'));
```

Both should have values.

## What Was Fixed

1. **Admin Login** - Now properly stores JWT token from backend
2. **API URL** - Uses environment variable for live server
3. **Authorization** - Added super-admin role to authorized roles
4. **Error Handling** - Better error messages and logging

## If Still Not Working

### Check Backend Logs
Look for these messages:
- `✅ Admin login successful (legacy mode)`
- `✅ MongoDB Connected`
- `JWT_SECRET` is set

### Verify JWT Token Generation
The backend should return:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "_id": "...",
    "name": "Administrator",
    "email": "razaaatif658@gmail.com",
    "role": "admin"
  }
}
```

### Check API Requests
In browser Network tab, verify:
1. Login request to `/api/admin/login` returns 200
2. Dashboard request to `/api/admin/dashboard` includes header:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## Alternative: Use New Admin System

If you want to use the new Admin model instead:

1. SSH into your server
2. Run: `cd backend && npm run create-super-admin`
3. Login with email: `admin@lumiere.com` and password: `Admin@123`
4. This creates a proper Admin user with full permissions

## Environment Variables Checklist

- [ ] `ADMIN_PASSWORD` is set
- [ ] `ADMIN_EMAIL` is set  
- [ ] `JWT_SECRET` is set (minimum 32 characters)
- [ ] `MONGODB_URI` is set
- [ ] Server restarted after setting variables

## Timeout Issues (30-60 seconds)

### Why This Happens
Render free tier puts servers to sleep after 15 minutes of inactivity. First request after sleep takes 30-60 seconds to wake up.

### What We Fixed (Commit d5ab838)
1. **Increased timeout** from 30s to 60s
2. **Added retry logic** - automatically retries failed requests up to 2 times
3. **Better error messages** - tells users when server is waking up
4. **Retry on specific errors** - ECONNABORTED, ERR_NETWORK, no response

### After Deploying
First request after server sleep will:
1. Show loading state for 30-60 seconds
2. Automatically retry if it times out
3. Display helpful message: "Server may be sleeping. Please wait..."

### Long-term Solutions
1. **Upgrade Render plan** - Paid plans don't sleep ($7/month)
2. **Keep-alive ping** - Ping server every 10 minutes to keep it awake
3. **Use different host** - Railway, Fly.io, or AWS have better free tiers

### Temporary Workaround
If you get timeout on first request:
1. Wait 60 seconds
2. Try again - server should be awake now
3. Subsequent requests will be fast

## Contact Support

If issue persists after deployment:
1. Check Render logs for errors: Dashboard → Service → Logs
2. Verify backend is running: Visit `https://your-backend.onrender.com/api/health`
3. Check MongoDB connection in logs
4. Verify all environment variables are set
5. Try manual restart: Dashboard → Service → Manual Deploy → "Clear build cache & deploy"
