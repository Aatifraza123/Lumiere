import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter dynamically to ensure env vars are loaded
const createTransporter = () => {
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = parseInt(process.env.SMTP_PORT) || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    console.warn('⚠️  SMTP credentials not configured');
    return null;
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465, // true for 465, false for other ports
    auth: {
      user: smtpUser.trim(),
      pass: smtpPass.trim()
    },
    tls: {
      rejectUnauthorized: false // Allow self-signed certificates
    }
  });
};

// Verify transporter connection
const verifyTransporter = async (transporter) => {
  try {
    await transporter.verify();
    console.log('✅ SMTP server connection verified');
    return true;
  } catch (error) {
    console.error('❌ SMTP server connection failed:', error.message);
    console.error('❌ SMTP verification error details:', {
      code: error.code,
      command: error.command,
      response: error.response
    });
    return false;
  }
};

export const sendEmail = async (options) => {
  try {
    // Check if SMTP is configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      const errorMsg = 'SMTP credentials not configured. Email sending skipped.';
      console.warn(`⚠️  ${errorMsg}`);
      console.warn('⚠️  Environment variables checked:', {
        SMTP_USER: process.env.SMTP_USER ? 'SET' : 'NOT SET',
        SMTP_PASS: process.env.SMTP_PASS ? 'SET' : 'NOT SET',
        SMTP_HOST: process.env.SMTP_HOST || 'default (smtp.gmail.com)',
        SMTP_PORT: process.env.SMTP_PORT || 'default (587)',
        NODE_ENV: process.env.NODE_ENV || 'not set'
      });
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Email would be sent to:', options.email);
        console.log('📧 Subject:', options.subject);
        return { messageId: 'dev-mode' }; // Allow to continue in development
      }
      throw new Error(errorMsg);
    }

    // Validate SMTP_USER is a valid email (not admin@lumiere.com which doesn't exist)
    const smtpUser = process.env.SMTP_USER;
    if (!smtpUser || !smtpUser.trim()) {
      throw new Error('SMTP_USER is not configured');
    }

    // Warn if SMTP_USER is set to admin@lumiere.com (invalid email)
    if (smtpUser.toLowerCase().includes('admin@lumiere.com')) {
      console.error('❌ WARNING: SMTP_USER is set to admin@lumiere.com which is not a valid email address.');
      console.error('❌ Please set SMTP_USER to a valid Gmail address (e.g., razaaatif658@gmail.com)');
      throw new Error('SMTP_USER is set to an invalid email address. Please use a valid Gmail address.');
    }

    // Create transporter dynamically
    const transporter = createTransporter();
    if (!transporter) {
      throw new Error('Failed to create email transporter. Check SMTP configuration.');
    }

    // Verify connection (only log, don't fail if verification fails)
    const isVerified = await verifyTransporter(transporter);
    if (!isVerified) {
      console.warn('⚠️  SMTP connection verification failed, but attempting to send email anyway...');
    }

    const mailOptions = {
      from: `${process.env.SMTP_FROM || 'Lumière Events'} <${smtpUser.trim()}>`,
      to: options.email.trim(),
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: process.env.ADMIN_EMAIL || smtpUser.trim() // Set reply-to to admin email
    };

    if (options.attachments) {
      mailOptions.attachments = options.attachments;
      console.log(`📎 Attachments: ${options.attachments.length} file(s)`);
    }

    console.log(`📧 Sending email to: ${options.email}`);
    console.log(`📧 From: ${mailOptions.from}`);
    console.log(`📧 Subject: ${options.subject}`);
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    console.log('✅ Email response:', {
      messageId: info.messageId,
      response: info.response
    });
    return info;
  } catch (error) {
    console.error('❌ Email error:', error);
    console.error('❌ Email error details:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    
    // Log environment variables (without sensitive data)
    console.error('❌ SMTP Configuration Status:', {
      SMTP_HOST: process.env.SMTP_HOST || 'NOT SET',
      SMTP_PORT: process.env.SMTP_PORT || 'NOT SET',
      SMTP_USER: process.env.SMTP_USER ? `${process.env.SMTP_USER.substring(0, 3)}***` : 'NOT SET',
      SMTP_PASS: process.env.SMTP_PASS ? 'SET' : 'NOT SET',
      ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'NOT SET',
      NODE_ENV: process.env.NODE_ENV || 'NOT SET'
    });
    
    throw error;
  }
};

export const sendOTPEmail = async (email, otp) => {
  // Check if email configuration exists
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('⚠️  SMTP credentials not configured. Email sending skipped.');
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 OTP for development:', otp);
      return; // Allow to continue in development
    }
    throw new Error('Email configuration missing');
  }

  const subject = 'Email Verification OTP - Lumière Events';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #D4AF37 0%, #FFD700 100%); color: #000; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 30px; background: #f9f9f9; }
        .otp-box { background: white; padding: 30px; margin: 20px 0; border-radius: 10px; text-align: center; border: 2px solid #D4AF37; }
        .otp-code { font-size: 36px; font-weight: bold; color: #D4AF37; letter-spacing: 10px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .warning { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; color: #856404; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Lumière Events</h1>
          <p style="margin: 0; font-size: 18px;">Email Verification</p>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>Thank you for registering with Lumière Events. Please use the following OTP to verify your email address:</p>
          <div class="otp-box">
            <p style="margin: 0 0 10px 0; color: #666;">Your Verification Code</p>
            <div class="otp-code">${otp}</div>
            <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">This code will expire in 10 minutes</p>
          </div>
          <div class="warning">
            <strong>⚠️ Security Notice:</strong> Never share this OTP with anyone. Our team will never ask for your OTP.
          </div>
          <p>If you didn't request this code, please ignore this email.</p>
          <p>Best regards,<br>Lumière Events Team</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Lumière Events. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `Your OTP for email verification is: ${otp}. This code will expire in 10 minutes.`;

  return sendEmail({
    email,
    subject,
    html,
    text
  });
};

export const sendBookingConfirmation = async (booking, user, invoicePath = null) => {
  // Validate that we have a valid customer email
  if (!user || !user.email || !user.email.trim()) {
    console.error('❌ Cannot send booking confirmation: No customer email provided');
    throw new Error('Customer email is required for booking confirmation');
  }

  // Prevent sending customer emails to admin address
  const adminEmail = process.env.ADMIN_EMAIL || 'razaaatif658@gmail.com';
  if (user.email.trim().toLowerCase() === adminEmail.toLowerCase()) {
    console.error('❌ Cannot send booking confirmation: Customer email matches admin email');
    throw new Error('Customer email cannot be the same as admin email');
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(user.email.trim())) {
    console.error('❌ Cannot send booking confirmation: Invalid email format');
    throw new Error('Invalid customer email format');
  }

  console.log('📧 Sending booking confirmation to customer:', user.email);
  console.log('📧 Customer name:', user.name);

  const subject = `Booking Confirmation - ${booking.invoiceNumber} | Lumière Events`;
  const paymentStatusText = booking.paymentStatus === 'paid' 
    ? 'Paid' 
    : booking.paymentStatus === 'partial' 
    ? 'Partially Paid' 
    : 'Pending Payment';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #D4AF37 0%, #FFD700 100%); color: #000; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 30px; background: #f9f9f9; }
        .booking-details { background: white; padding: 20px; margin: 15px 0; border-radius: 10px; border: 1px solid #e0e0e0; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { font-weight: bold; color: #666; }
        .detail-value { color: #333; }
        .total-amount { font-size: 20px; font-weight: bold; color: #D4AF37; margin-top: 15px; padding-top: 15px; border-top: 2px solid #D4AF37; }
        .status-badge { display: inline-block; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; }
        .status-confirmed { background: #d4edda; color: #155724; }
        .status-pending { background: #fff3cd; color: #856404; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .invoice-note { background: #e7f3ff; padding: 15px; border-radius: 5px; margin: 15px 0; color: #004085; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">Lumière Events</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px;">Booking Confirmed!</p>
        </div>
        <div class="content">
          <p>Dear ${user.name},</p>
          <p>Thank you for choosing Lumière Events! Your booking has been confirmed. Please find the details below:</p>
          
          <div class="booking-details">
            <h3 style="margin-top: 0; color: #D4AF37;">Booking Details</h3>
            <div class="detail-row">
              <span class="detail-label">Invoice Number:</span>
              <span class="detail-value">${booking.invoiceNumber}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Event Name:</span>
              <span class="detail-value">${booking.eventName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Event Type:</span>
              <span class="detail-value">${booking.eventType.charAt(0).toUpperCase() + booking.eventType.slice(1)}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Venue:</span>
              <span class="detail-value">${booking.hallId?.name || 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Location:</span>
              <span class="detail-value">${booking.hallId?.location || 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date:</span>
              <span class="detail-value">${new Date(booking.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Time:</span>
              <span class="detail-value">${booking.startTime} - ${booking.endTime}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Number of Guests:</span>
              <span class="detail-value">${booking.guestCount}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Base Price:</span>
              <span class="detail-value">₹${booking.basePrice.toLocaleString('en-IN')}</span>
            </div>
            ${booking.slotPrice > 0 ? `
            <div class="detail-row">
              <span class="detail-label">Time Slot:</span>
              <span class="detail-value">₹${booking.slotPrice.toLocaleString('en-IN')}</span>
            </div>
            ` : ''}
            ${booking.addonsTotal > 0 ? `
            <div class="detail-row">
              <span class="detail-label">Add-ons:</span>
              <span class="detail-value">₹${booking.addonsTotal.toLocaleString('en-IN')}</span>
            </div>
            ` : ''}
            <div class="detail-row">
              <span class="detail-label">Tax (18% GST):</span>
              <span class="detail-value">₹${booking.tax.toLocaleString('en-IN')}</span>
            </div>
            <div class="total-amount">
              <div class="detail-row">
                <span class="detail-label">Total Amount:</span>
                <span class="detail-value">₹${booking.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div class="detail-row">
              <span class="detail-label">Payment Status:</span>
              <span class="status-badge ${booking.paymentStatus === 'paid' ? 'status-confirmed' : 'status-pending'}">${paymentStatusText}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Booking Status:</span>
              <span class="status-badge ${booking.status === 'confirmed' ? 'status-confirmed' : 'status-pending'}">${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</span>
            </div>
          </div>

          ${invoicePath ? `
          <div class="invoice-note">
            <strong>📄 Invoice Attached:</strong> Please find your invoice PDF attached to this email.
          </div>
          ` : ''}

          ${booking.paymentStatus !== 'paid' ? `
          <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; color: #856404;">
            <strong>⚠️ Payment Pending:</strong> Please complete your payment before the event date. You can pay through your dashboard or contact us for assistance.
          </div>
          ` : ''}

          <p>If you have any questions or need to make changes to your booking, please don't hesitate to contact us.</p>
          <p>We look forward to making your event memorable!</p>
          <p>Best regards,<br><strong>Lumière Events Team</strong></p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Lumière Events. All rights reserved.</p>
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const attachments = [];
  if (invoicePath) {
    attachments.push({
      filename: `invoice-${booking.invoiceNumber}.pdf`,
      path: invoicePath
    });
  }

  return sendEmail({
    email: user.email.trim(),
    subject,
    html,
    attachments: attachments.length > 0 ? attachments : undefined
  });
};

// Send admin notification email with customer booking details
export const sendAdminBookingNotification = async (booking, customer) => {
  const adminEmail = process.env.ADMIN_EMAIL || 'razaaatif658@gmail.com';
  
  // Validate admin email
  if (!adminEmail || !adminEmail.trim()) {
    console.error('❌ Cannot send admin notification: No admin email configured');
    throw new Error('Admin email is not configured');
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(adminEmail.trim())) {
    console.error('❌ Cannot send admin notification: Invalid admin email format');
    throw new Error('Invalid admin email format');
  }

  console.log('📧 Sending admin notification to:', adminEmail);
  const subject = `New Booking Received - ${booking.invoiceNumber} | Lumière Events`;
  
  // Debug: Log what we received
  console.log('📧 sendAdminBookingNotification called');
  console.log('📧 Customer parameter received:', customer);
  console.log('📧 Customer type:', typeof customer);
  console.log('📧 Customer keys:', customer ? Object.keys(customer) : 'null');
  
  // Ensure we have customer details - use customer parameter directly
  // Extract with explicit checks
  let customerName = 'N/A';
  let customerEmail = 'N/A';
  let customerPhone = 'N/A';
  
  if (customer) {
    if (customer.name) {
      customerName = String(customer.name).trim();
    }
    if (customer.email) {
      customerEmail = String(customer.email).trim();
    }
    if (customer.phone) {
      customerPhone = String(customer.phone).trim();
    } else if (customer.mobile) {
      customerPhone = String(customer.mobile).trim();
    }
  }
  
  console.log('📧 Admin notification - Extracted customer details:', {
    name: customerName,
    email: customerEmail,
    phone: customerPhone,
    'customer object': customer,
    'customer.name': customer?.name,
    'customer.email': customer?.email,
    'customer.phone': customer?.phone,
    'customer.mobile': customer?.mobile
  });
  
  // Verify values before template creation
  console.log('📧 Final values for email template:', {
    customerName: customerName,
    customerEmail: customerEmail,
    customerPhone: customerPhone,
    'customerName length': customerName.length,
    'customerPhone length': customerPhone.length,
    'customerName type': typeof customerName,
    'customerPhone type': typeof customerPhone
  });
  
  // Create HTML template with explicit variable interpolation
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #D4AF37 0%, #FFD700 100%); color: #000; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 30px; background: #f9f9f9; }
        .booking-details { background: white; padding: 20px; margin: 15px 0; border-radius: 10px; border: 1px solid #e0e0e0; }
        .customer-details { background: #e7f3ff; padding: 20px; margin: 15px 0; border-radius: 10px; border: 2px solid #004085; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { font-weight: bold; color: #666; }
        .detail-value { color: #333; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">Lumière Events</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px;">New Booking Received</p>
        </div>
        <div class="content">
          <p>Dear Admin,</p>
          <p>A new booking has been received. Please find the customer and booking details below:</p>
          
          <div class="customer-details">
            <h3 style="margin-top: 0; color: #004085;">Customer Information</h3>
            <div class="detail-row">
              <span class="detail-label">Name:</span>
              <span class="detail-value">${customerName || 'Not provided'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Email:</span>
              <span class="detail-value">${customerEmail || 'Not provided'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Phone:</span>
              <span class="detail-value">${customerPhone || 'Not provided'}</span>
            </div>
          </div>

          <div class="booking-details">
            <h3 style="margin-top: 0; color: #D4AF37;">Booking Details</h3>
            <div class="detail-row">
              <span class="detail-label">Invoice Number:</span>
              <span class="detail-value">${booking.invoiceNumber}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Event Name:</span>
              <span class="detail-value">${booking.eventName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Event Type:</span>
              <span class="detail-value">${booking.eventType.charAt(0).toUpperCase() + booking.eventType.slice(1)}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Venue:</span>
              <span class="detail-value">${booking.hallId?.name || 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Location:</span>
              <span class="detail-value">${booking.hallId?.location || 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date:</span>
              <span class="detail-value">${new Date(booking.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Time:</span>
              <span class="detail-value">${booking.startTime} - ${booking.endTime}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Number of Guests:</span>
              <span class="detail-value">${booking.guestCount}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Total Amount:</span>
              <span class="detail-value">₹${booking.totalAmount.toLocaleString('en-IN')}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Payment Status:</span>
              <span class="detail-value">${booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Booking Status:</span>
              <span class="detail-value">${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</span>
            </div>
          </div>

          <p>Please review this booking and take necessary action.</p>
          <p>Best regards,<br><strong>Lumière Events System</strong></p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Lumière Events. All rights reserved.</p>
          <p>This is an automated notification email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Log a sample of the HTML to verify interpolation
  const customerInfoStart = html.indexOf('Customer Information');
  if (customerInfoStart > -1) {
    const htmlSample = html.substring(customerInfoStart, customerInfoStart + 300);
    console.log('📧 HTML sample (Customer Information section):', htmlSample);
  }
  
  return sendEmail({
    email: adminEmail.trim(),
    subject,
    html
  });
};

// Send bulk newsletter email to all active subscribers
export const sendBulkNewsletter = async (subject, content, subscriberEmails) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('⚠️  SMTP credentials not configured. Email sending skipped.');
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Bulk newsletter would be sent to:', subscriberEmails.length, 'subscribers');
      return { sent: subscriberEmails.length, failed: 0 };
    }
    throw new Error('Email configuration missing');
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #D4AF37 0%, #FFD700 100%); color: #000; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 30px; background: #f9f9f9; }
        .newsletter-content { background: white; padding: 30px; margin: 20px 0; border-radius: 10px; border: 1px solid #e0e0e0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .unsubscribe { text-align: center; padding: 15px; margin-top: 20px; font-size: 12px; color: #999; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">Lumière Events</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px;">Newsletter</p>
        </div>
        <div class="content">
          <div class="newsletter-content">
            ${content.replace(/\n/g, '<br>')}
          </div>
          <p>Best regards,<br><strong>Lumière Events Team</strong></p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Lumière Events. All rights reserved.</p>
          <div class="unsubscribe">
            <p>You are receiving this email because you subscribed to our newsletter.</p>
            <p>To unsubscribe, please contact us or visit our website.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  let sent = 0;
  let failed = 0;
  const errors = [];

  // Send emails in batches to avoid overwhelming the SMTP server
  const batchSize = 10;
  for (let i = 0; i < subscriberEmails.length; i += batchSize) {
    const batch = subscriberEmails.slice(i, i + batchSize);
    
    await Promise.allSettled(
      batch.map(async (email) => {
        try {
          await sendEmail({
            email,
            subject,
            html
          });
          sent++;
          console.log(`✅ Newsletter sent to: ${email}`);
        } catch (error) {
          failed++;
          errors.push({ email, error: error.message });
          console.error(`❌ Failed to send to ${email}:`, error.message);
        }
      })
    );

    // Small delay between batches to avoid rate limiting
    if (i + batchSize < subscriberEmails.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return {
    sent,
    failed,
    total: subscriberEmails.length,
    errors: errors.length > 0 ? errors : undefined
  };
};


