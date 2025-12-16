# Email Troubleshooting Guide for Live Server

## Common Issues and Solutions

### Issue 1: Emails Work on Localhost but Not on Live Server

#### Causes:
1. **Environment Variables Not Set on Live Server**
2. **Gmail Security Blocking Server IP**
3. **SMTP Port Blocked by Hosting Provider**
4. **Invalid SMTP Credentials**

#### Solutions:

### 1. Verify Environment Variables on Live Server

Make sure these are set in your hosting platform (Render, Heroku, etc.):

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ADMIN_EMAIL=your-email@gmail.com
NODE_ENV=production
```

**IMPORTANT**: 
- `SMTP_USER` must be a REAL Gmail address (not admin@lumiere.com)
- `SMTP_PASS` must be a Gmail App Password (not regular password)

### 2. Generate Gmail App Password

1. Go to https://myaccount.google.com/apppasswords
2. Enable 2-Factor Authentication if not already enabled
3. Generate a new App Password for "Mail"
4. Copy the 16-character password (no spaces)
5. Set it as `SMTP_PASS` in your environment variables

### 3. Check Gmail Security Settings

1. Go to https://myaccount.google.com/security
2. Enable "Less secure app access" (if available)
3. Check "Recent security events" for blocked sign-in attempts
4. If blocked, click "Yes, it was me" to allow

### 4. Test Email Configuration

Use the admin test email endpoint:

```bash
POST /api/admin/test-email
Content-Type: application/json
Authorization: Bearer {admin_token}

{
  "email": "test@example.com"
}
```

This will:
- Verify SMTP connection
- Send a test email
- Return detailed error information

### 5. Check Server Logs

On your live server, check logs for:
- `✅ SMTP server connection verified` - Good!
- `❌ SMTP server connection failed` - Check credentials
- `❌ SMTP credentials not configured` - Set environment variables

### 6. Common Error Messages

#### "Invalid login: 535-5.7.8 Username and Password not accepted"
**Solution**: 
- Use Gmail App Password, not regular password
- Ensure SMTP_USER is correct Gmail address

#### "Connection timeout"
**Solution**:
- Check if port 587 is blocked by hosting provider
- Try port 465 with `secure: true`
- Contact hosting support

#### "SMTP credentials not configured"
**Solution**:
- Set SMTP_USER and SMTP_PASS in environment variables
- Restart server after setting variables

#### "self signed certificate in certificate chain"
**Solution**:
- Already handled with `rejectUnauthorized: false`
- If still failing, check hosting provider SSL settings

### 7. Alternative SMTP Providers

If Gmail doesn't work, try:

#### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

#### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASS=your-mailgun-password
```

#### AWS SES
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-smtp-username
SMTP_PASS=your-ses-smtp-password
```

### 8. Render-Specific Configuration

If using Render.com:

1. Go to Dashboard → Your Service → Environment
2. Add environment variables:
   - `SMTP_HOST` = `smtp.gmail.com`
   - `SMTP_PORT` = `587`
   - `SMTP_USER` = `your-email@gmail.com`
   - `SMTP_PASS` = `your-app-password`
   - `ADMIN_EMAIL` = `your-email@gmail.com`
3. Click "Save Changes"
4. Render will automatically redeploy

### 9. Debugging Steps

1. **Check if environment variables are loaded:**
```javascript
console.log('SMTP_USER:', process.env.SMTP_USER ? 'SET' : 'NOT SET');
console.log('SMTP_PASS:', process.env.SMTP_PASS ? 'SET' : 'NOT SET');
```

2. **Test SMTP connection manually:**
```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

await transporter.verify();
```

3. **Check server logs for email attempts:**
- Look for `📧 Sending email to:` messages
- Check for `✅ Email sent successfully` or `❌ Email error`

### 10. Production Checklist

Before deploying to production:

- [ ] Gmail App Password generated
- [ ] 2FA enabled on Gmail account
- [ ] Environment variables set on hosting platform
- [ ] Server restarted after setting variables
- [ ] Test email endpoint returns success
- [ ] Check server logs for SMTP connection
- [ ] Test actual booking flow
- [ ] Verify customer receives email
- [ ] Verify admin receives notification

### 11. Email Flow in Application

1. **Payment Verification** (`/api/payments/razorpay/verify`)
   - Verifies Razorpay payment
   - Updates booking status
   - Sends response to client
   - **Asynchronously** sends emails (doesn't block response)

2. **Customer Email**
   - Generates invoice PDF
   - Sends booking confirmation with invoice attachment
   - Includes all booking details

3. **Admin Email**
   - Sends notification to admin
   - Includes customer and booking details
   - No attachment (admin can view in dashboard)

### 12. Current Implementation

The email sending is now **non-blocking**:
- Payment response is sent immediately
- Emails are sent asynchronously using `setImmediate()`
- Errors are logged but don't affect payment success
- Both customer and admin emails are attempted

### 13. Monitoring Email Delivery

Check these in your logs:
```
✅ Payment verified successfully
📧 Preparing to send payment confirmation emails...
📧 Sending email to customer: customer@example.com
📄 Invoice PDF generated: /path/to/invoice.pdf
✅ Customer confirmation email sent successfully
📧 Sending admin notification with customer info: {...}
✅ Admin notification email sent successfully
```

### 14. If Emails Still Don't Work

1. **Use a dedicated email service** (SendGrid, Mailgun, AWS SES)
2. **Check hosting provider documentation** for email restrictions
3. **Contact hosting support** about SMTP port access
4. **Enable detailed logging** in production
5. **Test with different email providers**

### 15. Quick Fix for Immediate Testing

If you need emails working NOW:

1. Use your personal Gmail with App Password
2. Set environment variables on live server
3. Restart server
4. Test with `/api/admin/test-email` endpoint
5. If test works, try actual booking

### 16. Security Best Practices

- Never commit SMTP credentials to Git
- Use environment variables for all sensitive data
- Rotate App Passwords regularly
- Monitor for suspicious email activity
- Use dedicated email service for production
- Implement rate limiting for email sending

## Need Help?

If emails still don't work after following this guide:
1. Check server logs for specific error messages
2. Test SMTP connection with `/api/admin/test-email`
3. Verify environment variables are set correctly
4. Contact your hosting provider support
5. Consider using a dedicated email service
