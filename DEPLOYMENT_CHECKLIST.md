# Deployment Checklist - Fix Timeout Errors

## ✅ What's Been Done
1. Fixed 401 authentication errors (commit a77e0c9)
2. Added 60-second timeout for cold starts (commit d5ab838)
3. Added automatic retry logic (up to 2 retries)
4. Improved error messages for sleeping servers
5. All changes pushed to GitHub

## 🚀 What You Need To Do Now

### Step 1: Deploy Backend (Render)
1. Go to https://dashboard.render.com
2. Find your backend service (lumiere-backend or similar)
3. Click **"Manual Deploy"** → **"Deploy latest commit"**
4. Wait for deployment (usually 2-5 minutes)
5. Check logs for: `✅ Server running on port...`

### Step 2: Deploy Frontend (Vercel)
1. Go to https://vercel.com/dashboard
2. Find your project: **lumiere-sandy-pi**
3. It should auto-deploy from GitHub push
4. If not, click **"Redeploy"**
5. Wait for deployment (usually 1-2 minutes)

### Step 3: Test the Fix
1. Clear browser cache and localStorage:
   ```javascript
   localStorage.clear();
   ```
2. Go to your live site: https://lumiere-sandy-pi.vercel.app
3. Try to login at `/admin/login`
4. Password: `Admin@123`
5. First request may take 30-60 seconds (server waking up)
6. You should see retry messages in console if needed
7. After first request, everything should be fast

### Step 4: Verify Environment Variables (Render)
Make sure these are set in Render dashboard:
- `ADMIN_PASSWORD=Admin@123`
- `ADMIN_EMAIL=razaaatif658@gmail.com`
- `JWT_SECRET=your-secret-key-here`
- `MONGODB_URI=your-mongodb-connection-string`
- `SMTP_USER=your-gmail@gmail.com`
- `SMTP_PASS=your-app-password`
- `VITE_API_URL=https://your-backend.onrender.com/api`

## 🔍 How to Check if It's Working

### Backend Health Check
Visit: `https://your-backend.onrender.com/api/health`
Should return: `{"status":"ok"}`

### Frontend Console
After login attempt, check browser console for:
- `✅ Admin token stored successfully` (good)
- `⚠️ Retrying request (1/2)` (normal for cold start)
- `💡 Tip: If using Render free tier...` (informational)

### Network Tab
Check browser Network tab:
- Login request should return 200 with token
- Dashboard requests should include `Authorization: Bearer ...` header
- First request may take 30-60s, then fast

## ⚠️ Known Behavior (Render Free Tier)

### Cold Start Issue
- Server sleeps after 15 minutes of inactivity
- First request takes 30-60 seconds to wake up
- This is NORMAL for free tier
- Subsequent requests are fast

### What We Did to Help
- Increased timeout to 60 seconds
- Added automatic retries
- Better error messages
- Tells users to wait

### Long-term Solutions
1. **Upgrade to paid plan** ($7/month) - No sleep
2. **Keep-alive service** - Ping every 10 minutes
3. **Different host** - Railway, Fly.io, AWS

## 🐛 Troubleshooting

### Still Getting Timeouts?
1. Check Render logs for errors
2. Verify backend is deployed (check commit hash)
3. Try manual restart in Render dashboard
4. Wait full 60 seconds on first request

### Still Getting 401 Errors?
1. Clear localStorage: `localStorage.clear()`
2. Check JWT_SECRET is set in Render
3. Verify ADMIN_PASSWORD matches
4. Check backend logs for login attempts

### Backend Not Responding?
1. Check Render service status
2. Look for deployment errors in logs
3. Verify MongoDB connection
4. Try "Clear build cache & deploy"

## 📞 Need Help?

Check these files:
- `LIVE_SERVER_FIX.md` - Detailed troubleshooting
- `EMAIL_TROUBLESHOOTING.md` - Email issues
- `ADMIN_SETUP.md` - Admin system docs

Check Render logs:
1. Dashboard → Your Service
2. Click "Logs" tab
3. Look for errors or warnings
4. Check for MongoDB connection success

## ✨ Expected Behavior After Fix

1. **First login after sleep**: 30-60 seconds (with retry messages)
2. **Subsequent requests**: Fast (< 1 second)
3. **No more 401 errors**: Token properly stored and sent
4. **Better error messages**: Clear instructions for users
5. **Automatic retries**: No need to manually refresh

---

**Last Updated**: December 16, 2025
**Commits**: a77e0c9 (auth fix), d5ab838 (timeout fix), 330f0b4 (docs)
