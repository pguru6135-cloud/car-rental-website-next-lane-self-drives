const nodemailer = require('nodemailer')
const { format } = require('date-fns')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

exports.sendBookingConfirmation = async (user, booking, car) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return

  const pickupFormatted = format(new Date(booking.pickupDate), 'dd MMM yyyy, hh:mm aa')
  const returnFormatted = format(new Date(booking.returnDate), 'dd MMM yyyy, hh:mm aa')

  const getHtml = (title, subtitle, extraContent = '') => `
    <!DOCTYPE html>
    <html>
    <head><style>
      body { font-family: 'DM Sans', Arial, sans-serif; background: #0d0d1a; color: #f1f1f1; margin: 0; padding: 20px; }
      .container { max-width: 600px; margin: 0 auto; }
      .header { background: linear-gradient(135deg, #1a1a2e, #0d0d1a); border: 1px solid rgba(249,115,22,0.3); border-radius: 16px; padding: 32px; text-align: center; margin-bottom: 24px; }
      .logo { font-size: 28px; font-weight: bold; color: #f97316; letter-spacing: 4px; }
      .tagline { color: rgba(255,255,255,0.4); font-size: 12px; letter-spacing: 3px; margin-top: 4px; }
      .card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 24px; margin-bottom: 16px; }
      .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
      .row:last-child { border-bottom: none; }
      .label { color: rgba(255,255,255,0.4); font-size: 13px; }
      .value { color: #fff; font-size: 13px; font-weight: 600; }
      .total-row { background: rgba(249,115,22,0.1); border-radius: 8px; padding: 12px 16px; display: flex; justify-content: space-between; margin-top: 8px; }
      .total-label { color: #fff; font-weight: bold; }
      .total-value { color: #f97316; font-size: 20px; font-weight: bold; }
      .footer { text-align: center; color: rgba(255,255,255,0.2); font-size: 12px; margin-top: 32px; }
      a { color: #f97316; text-decoration: none; }
    </style></head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">NEXT LANE</div>
          <div class="tagline">SELF DRIVES</div>
          <h2 style="color:#f97316; margin:16px 0 4px;">${title}</h2>
          <p style="color:rgba(255,255,255,0.5); margin:0;">${subtitle}</p>
        </div>

        <div class="card">
          <h3 style="color:#f97316; margin:0 0 16px; font-size:14px; letter-spacing:2px; text-transform:uppercase;">Booking Details</h3>
          <div class="row"><span class="label">Booking ID</span><span class="value">#${booking._id.toString().slice(-8).toUpperCase()}</span></div>
          <div class="row"><span class="label">Car</span><span class="value">${car.name}</span></div>
          <div class="row"><span class="label">Customer</span><span class="value">${booking.name}</span></div>
          <div class="row"><span class="label">Pickup</span><span class="value">${pickupFormatted}</span></div>
          <div class="row"><span class="label">Return</span><span class="value">${returnFormatted}</span></div>
          <div class="row"><span class="label">Location</span><span class="value">${booking.pickupLocation}</span></div>
          <div class="total-row">
            <span class="total-label">Total Amount</span>
            <span class="total-value">₹${booking.totalAmount.toLocaleString('en-IN')}</span>
          </div>
        </div>

        ${extraContent}

        <div class="footer">
          <p>© ${new Date().getFullYear()} Next Lane Self Drives, Tirupur</p>
          <p><a href="https://www.instagram.com/next_lane_self_drives">@next_lane_self_drives</a></p>
        </div>
      </div>
    </body>
    </html>
  `

  const customerExtra = `
    <div class="card">
      <h3 style="color:#f97316; margin:0 0 12px; font-size:14px; letter-spacing:2px; text-transform:uppercase;">Next Steps</h3>
      <p style="color:rgba(255,255,255,0.6); font-size:14px; margin:0 0 8px;">1. Complete payment via Google Pay</p>
      <p style="color:rgba(255,255,255,0.6); font-size:14px; margin:0 0 8px;">2. Send payment screenshot to WhatsApp: <a href="https://wa.me/919342179459">+91 93421 79459</a></p>
      <p style="color:rgba(255,255,255,0.6); font-size:14px; margin:0;">3. We'll confirm your booking within 15 minutes</p>
    </div>
  `

  const adminExtra = `
    <div class="card" style="border: 1px solid #f97316;">
      <h3 style="color:#f97316; margin:0 0 12px; font-size:14px; letter-spacing:2px; text-transform:uppercase;">Admin Action Required</h3>
      <p style="color:rgba(255,255,255,0.6); font-size:14px; margin:0 0 8px;">• Check WhatsApp for payment confirmation.</p>
      <p style="color:rgba(255,255,255,0.6); font-size:14px; margin:0;">• Update booking status in Admin Panel.</p>
    </div>
  `

  // 1. Send to Customer
  const customerEmail = transporter.sendMail({
    from: `"Next Lane" <${process.env.EMAIL_USER}>`,
    to: booking.email,
    subject: `🚗 Booking Reserved – ${car.name} | Next Lane`,
    html: getHtml('Booking Reserved! 🚗', 'Complete payment to confirm your ride', customerExtra),
  }).catch(console.error)

  // 2. Send to Admin
  const adminEmail = transporter.sendMail({
    from: `"Next Lane System" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    subject: `🔔 NEW BOOKING: ${booking.name} - ${car.name}`,
    html: getHtml('New Booking Received! 🔔', 'A customer is waiting for confirmation', adminExtra),
  }).catch(console.error)

  await Promise.all([customerEmail, adminEmail])
}

exports.sendPaymentSuccessEmail = async (user, booking, car) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return

  const pickupFormatted = format(new Date(booking.pickupDate), 'dd MMM yyyy, hh:mm aa')
  const returnFormatted = format(new Date(booking.returnDate), 'dd MMM yyyy, hh:mm aa')

  const getHtml = (title, subtitle, extraContent = '') => `
    <!DOCTYPE html>
    <html>
    <head><style>
       body { font-family: 'DM Sans', Arial, sans-serif; background: #0d0d1a; color: #f1f1f1; margin: 0; padding: 20px; }
      .container { max-width: 600px; margin: 0 auto; }
      .header { background: linear-gradient(135deg, #1a1a2e, #0d0d1a); border: 1px solid #10b981; border-radius: 16px; padding: 32px; text-align: center; margin-bottom: 24px; }
      .logo { font-size: 28px; font-weight: bold; color: #f97316; letter-spacing: 4px; }
      .tagline { color: rgba(255,255,255,0.4); font-size: 12px; letter-spacing: 3px; margin-top: 4px; }
      .card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 24px; margin-bottom: 16px; }
      .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
      .row:last-child { border-bottom: none; }
      .label { color: rgba(255,255,255,0.4); font-size: 13px; }
      .value { color: #fff; font-size: 13px; font-weight: 600; }
      .total-row { background: rgba(16,185,129,0.1); border-radius: 8px; padding: 12px 16px; display: flex; justify-content: space-between; margin-top: 8px; }
      .total-label { color: #fff; font-weight: bold; }
      .total-value { color: #10b981; font-size: 20px; font-weight: bold; }
      .footer { text-align: center; color: rgba(255,255,255,0.2); font-size: 12px; margin-top: 32px; }
      .success-badge { display: inline-block; background: #10b981; color: #fff; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 16px; }
      a { color: #f97316; text-decoration: none; }
    </style></head>
    <body>
      <div class="container">
        <div class="header" style="border: 1px solid rgba(16,185,129,0.3);">
          <div class="logo">NEXT LANE</div>
          <div class="tagline">SELF DRIVES</div>
          <div style="margin-top: 20px;"><span class="success-badge">Confirmed</span></div>
          <h2 style="color:#10b981; margin:8px 0 4px;">${title}</h2>
          <p style="color:rgba(255,255,255,0.5); margin:0;">${subtitle}</p>
        </div>

        <div class="card">
          <h3 style="color:#10b981; margin:0 0 16px; font-size:14px; letter-spacing:2px; text-transform:uppercase;">Confirmed Trip Details</h3>
          <div class="row"><span class="label">Booking ID</span><span class="value">#${booking._id.toString().slice(-8).toUpperCase()}</span></div>
          <div class="row"><span class="label">Car</span><span class="value">${car.name}</span></div>
          <div class="row"><span class="label">Customer</span><span class="value">${booking.name}</span></div>
          <div class="row"><span class="label">Pickup</span><span class="value">${pickupFormatted}</span></div>
          <div class="row"><span class="label">Return</span><span class="value">${returnFormatted}</span></div>
          <div class="row"><span class="label">Location</span><span class="value">${booking.pickupLocation}</span></div>
          <div class="total-row">
            <span class="total-label">Amount Paid</span>
            <span class="total-value">₹${booking.totalAmount.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div class="card">
           <h3 style="color:#10b981; margin:0 0 12px; font-size:14px; letter-spacing:2px; text-transform:uppercase;">Important Info</h3>
           <p style="color:rgba(255,255,255,0.6); font-size:14px; margin:0 0 8px;">• Carry your original driving license.</p>
           <p style="color:rgba(255,255,255,0.6); font-size:14px; margin:0 0 8px;">• Reach the startup point 15 mins early.</p>
           <p style="color:rgba(255,255,255,0.6); font-size:14px; margin:0;">• Need help? WhatsApp us at +91 93421 79459</p>
        </div>

        <div class="footer">
          <p>© ${new Date().getFullYear()} Next Lane Self Drives, Tirupur</p>
          <p>Have a safe and enjoyable journey!</p>
        </div>
      </div>
    </body>
    </html>
  `

  await transporter.sendMail({
    from: `"Next Lane" <${process.env.EMAIL_USER}>`,
    to: booking.email,
    subject: `✅ Payment Verified – Your ride for ${car.name} is confirmed!`,
    html: getHtml('Payment Confirmed! ✅', 'Your ride is officially ready for pickup'),
  }).catch(console.error)
}
