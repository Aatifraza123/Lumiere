# Admin System Setup Guide

## Overview
The admin system now uses a separate `Admin` model with enhanced security features and role-based permissions.

## Admin Roles

### 1. Super Admin
- Full access to all features
- Can create, edit, and delete other admins
- Can manage all permissions
- Cannot be deleted by other admins

### 2. Admin
- Full access to content management (halls, services, bookings, blog, etc.)
- Cannot manage other admins
- Can be customized with specific permissions

### 3. Manager
- Limited access based on assigned permissions
- Typically for operational tasks
- Cannot manage admins

## Features

### Security Features
- Password hashing with bcrypt
- JWT token authentication
- Account locking after 5 failed login attempts (2 hours)
- Login attempt tracking
- Last login timestamp

### Permission System
Each admin has granular permissions for:
- **Halls**: view, create, edit, delete
- **Services**: view, create, edit, delete
- **Bookings**: view, create, edit, delete
- **Blog**: view, create, edit, delete
- **Gallery**: view, create, edit, delete
- **Testimonials**: view, create, edit, delete
- **Contact**: view, reply, delete
- **Subscribers**: view, sendNewsletter, delete
- **Users**: view, edit, delete
- **Admins**: view, create, edit, delete (super-admin only)

## Setup Instructions

### 1. Create Super Admin

Run the following command to create the first super admin:

```bash
cd backend
npm run create-super-admin
```

This will create a super admin with:
- Email: `admin@lumiere.com` (or from `SUPER_ADMIN_EMAIL` env variable)
- Password: `Admin@123` (or from `SUPER_ADMIN_PASSWORD` env variable)

### 2. Environment Variables

Add these to your `.env` file (optional):

```env
SUPER_ADMIN_EMAIL=admin@lumiere.com
SUPER_ADMIN_PASSWORD=YourSecurePassword123
SUPER_ADMIN_PHONE=9999999999
```

### 3. Login

Use the admin login endpoint:

```
POST /api/admin-auth/login
Content-Type: application/json

{
  "email": "admin@lumiere.com",
  "password": "Admin@123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "data": {
    "_id": "admin_id",
    "name": "Super Admin",
    "email": "admin@lumiere.com",
    "role": "super-admin",
    "permissions": { ... }
  }
}
```

## API Endpoints

### Authentication

#### Login
```
POST /api/admin-auth/login
Body: { email, password }
```

#### Get Profile
```
GET /api/admin-auth/profile
Headers: Authorization: Bearer {token}
```

#### Update Profile
```
PUT /api/admin-auth/profile
Headers: Authorization: Bearer {token}
Body: { name, phone, currentPassword, newPassword }
```

### Admin Management (Super Admin Only)

#### Create Admin
```
POST /api/admin-auth/create
Headers: Authorization: Bearer {token}
Body: { name, email, password, phone, role, permissions }
```

#### Get All Admins
```
GET /api/admin-auth/admins
Headers: Authorization: Bearer {token}
```

#### Update Admin
```
PUT /api/admin-auth/admins/:id
Headers: Authorization: Bearer {token}
Body: { name, phone, role, permissions, isActive }
```

#### Delete Admin
```
DELETE /api/admin-auth/admins/:id
Headers: Authorization: Bearer {token}
```

## Frontend Integration

Update your frontend admin login to use the new endpoint:

```javascript
// Old
const response = await api.post('/admin/login', { password });

// New
const response = await api.post('/admin-auth/login', { email, password });
```

Store the token and use it for authenticated requests:

```javascript
localStorage.setItem('adminToken', response.data.token);
```

## Migration from Old System

The old admin login system in `/api/admin/login` still works for backward compatibility, but it's recommended to migrate to the new system.

### Steps to Migrate:

1. Run `npm run create-super-admin` to create the first admin
2. Update frontend to use `/api/admin-auth/login`
3. Test the new login flow
4. Create additional admins as needed
5. Remove old admin login code from `admin.routes.js` (optional)

## Security Best Practices

1. **Change Default Password**: Always change the default password after first login
2. **Use Strong Passwords**: Minimum 6 characters (recommended 12+)
3. **Limit Super Admins**: Only create super admin accounts when necessary
4. **Regular Audits**: Review admin accounts and permissions regularly
5. **Monitor Login Attempts**: Check for suspicious login activity
6. **Use HTTPS**: Always use HTTPS in production

## Troubleshooting

### Account Locked
If an account is locked due to failed login attempts:
- Wait 2 hours for automatic unlock
- Or manually update the database to reset `loginAttempts` and remove `lockUntil`

### Forgot Password
Currently, password reset must be done manually by a super admin or through database access.

### Permission Issues
If an admin cannot access certain features:
1. Check their role
2. Verify their permissions in the database
3. Ensure they're using the correct token

## Database Schema

```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  role: 'super-admin' | 'admin' | 'manager',
  permissions: {
    halls: { view, create, edit, delete },
    services: { view, create, edit, delete },
    // ... other permissions
  },
  isActive: Boolean,
  lastLogin: Date,
  loginAttempts: Number,
  lockUntil: Date,
  createdBy: ObjectId (ref: Admin),
  createdAt: Date,
  updatedAt: Date
}
```
