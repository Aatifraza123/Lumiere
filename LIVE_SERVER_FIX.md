# Fix 401 Error on Live Server

## Issue
Admin dashboard showing 401 (Unauthorized) errors on live server after authentication changes.

## Quick Fix Steps

### 1. Deploy Latest Changes
The fix has been pushed to GitHub. Deploy the latest code to your live server (Render/Heroku).

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

## Contact Support

If issue persists:
1. Check server logs for specific error messages
2. Verify MongoDB connection is working
3. Test with `/api/health` endpoint
4. Check if JWT_SECRET is properly set
