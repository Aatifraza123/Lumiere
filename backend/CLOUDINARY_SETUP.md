# Cloudinary Setup Guide

## Problem
If you see this error:
```
Unknown API key your-cloudinary-api-key
```

It means Cloudinary credentials are not configured. The app will automatically use **local file storage** as a fallback.

## Solution Options

### Option 1: Use Cloudinary (Recommended for Production)

1. **Sign up for Cloudinary** (Free tier available):
   - Go to https://cloudinary.com/users/register/free
   - Create a free account

2. **Get Your Credentials**:
   - Login to Cloudinary Dashboard: https://cloudinary.com/console
   - Go to **Settings** → **Security**
   - Copy these values:
     - Cloud Name
     - API Key
     - API Secret

3. **Add to `.env` file**:
   ```env
   CLOUDINARY_CLOUD_NAME=your-actual-cloud-name
   CLOUDINARY_API_KEY=your-actual-api-key
   CLOUDINARY_API_SECRET=your-actual-api-secret
   ```

4. **Restart the server**:
   ```bash
   npm run dev
   ```

### Option 2: Use Local Storage (Current Fallback)

The app automatically uses local storage if Cloudinary is not configured:
- Images are saved to `backend/uploads/` folder
- Images are accessible at `http://localhost:5000/uploads/filename.jpg`
- **Note**: Local storage is fine for development, but not recommended for production

### Option 3: Use Image URLs Directly

You can also paste image URLs directly in the form:
- Use any public image URL (e.g., from Unsplash, Imgur, etc.)
- No upload needed
- Works immediately

## Current Status

Check your server logs:
- ✅ `Cloudinary storage configured` - Cloudinary is working
- ⚠️ `Cloudinary not configured. Using local storage` - Using fallback

## Troubleshooting

### Images not showing?
- Check if `uploads` folder exists in `backend/` directory
- Verify image URL is accessible
- Check browser console for 404 errors

### Want to switch from local to Cloudinary?
1. Add Cloudinary credentials to `.env`
2. Restart server
3. Existing images will still work (they're stored in database)

### Want to switch from Cloudinary to local?
1. Remove Cloudinary credentials from `.env` (or set to placeholder values)
2. Restart server
3. New uploads will use local storage










