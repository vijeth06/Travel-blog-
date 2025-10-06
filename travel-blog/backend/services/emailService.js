const nodemailer = require('nodemailer');

// Free Gmail SMTP configuration
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail', // Free Gmail SMTP
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail address
      pass: process.env.EMAIL_PASS  // Your Gmail App Password (not regular password)
    }
  });
};

// Send welcome email (FREE)
const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Travel Blog" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: 'Welcome to Travel Blog! 🌍',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2196F3;">Welcome to Travel Blog, ${userName}! 🎉</h1>
          
          <p>Thank you for joining our travel community! We're excited to have you on board.</p>
          
          <h2>What you can do now:</h2>
          <ul>
            <li>📝 Share your travel stories and experiences</li>
            <li>🗺️ Discover amazing travel packages</li>
            <li>💬 Connect with fellow travelers</li>
            <li>❤️ Like and comment on posts</li>
            <li>📱 Share content on social media</li>
          </ul>
          
          <p>Start exploring and sharing your adventures!</p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Quick Tips:</h3>
            <p>• Complete your profile to connect with other travelers</p>
            <p>• Upload a profile picture to personalize your account</p>
            <p>• Follow your favorite travel bloggers</p>
          </div>
          
          <p>Happy travels! ✈️</p>
          <p>The Travel Blog Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully');
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};

// Send comment notification (FREE)
const sendCommentNotification = async (authorEmail, authorName, commenterName, blogTitle, commentContent) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Travel Blog" <${process.env.EMAIL_USER}>`,
      to: authorEmail,
      subject: `New comment on your post: ${blogTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2196F3;">New Comment on Your Post! 💬</h1>
          
          <p>Hi ${authorName},</p>
          
          <p><strong>${commenterName}</strong> commented on your post "<strong>${blogTitle}</strong>":</p>
          
          <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #2196F3; margin: 20px 0;">
            <p style="margin: 0; font-style: italic;">"${commentContent}"</p>
          </div>
          
          <p>
            <a href="${process.env.FRONTEND_URL}" 
               style="background: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              View Comment
            </a>
          </p>
          
          <p>Keep the conversation going!</p>
          <p>The Travel Blog Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Comment notification sent successfully');
  } catch (error) {
    console.error('Error sending comment notification:', error);
  }
};

// Send newsletter (FREE - up to Gmail's daily limits)
const sendNewsletter = async (subscribers, subject, content) => {
  try {
    const transporter = createTransporter();
    
    // Send in batches to avoid rate limits (Gmail allows ~500 emails/day for free)
    const batchSize = 50;
    
    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      
      const mailOptions = {
        from: `"Travel Blog Newsletter" <${process.env.EMAIL_USER}>`,
        bcc: batch.map(sub => sub.email), // Use BCC for privacy
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #2196F3; color: white; padding: 20px; text-align: center;">
              <h1>Travel Blog Newsletter 📧</h1>
            </div>
            
            <div style="padding: 20px;">
              ${content}
            </div>
            
            <div style="background: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
              <p>You're receiving this because you subscribed to Travel Blog newsletter.</p>
              <p>
                <a href="${process.env.FRONTEND_URL}/unsubscribe" style="color: #666;">
                  Unsubscribe
                </a>
              </p>
            </div>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      
      // Add delay between batches to respect rate limits
      if (i + batchSize < subscribers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log(`Newsletter sent to ${subscribers.length} subscribers`);
  } catch (error) {
    console.error('Error sending newsletter:', error);
  }
};

// Send booking confirmation (FREE)
const sendBookingConfirmation = async (userEmail, userName, bookingDetails) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Travel Blog Bookings" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Booking Confirmation - ${bookingDetails.packageTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4CAF50;">Booking Confirmed! ✅</h1>
          
          <p>Hi ${userName},</p>
          
          <p>Your booking has been confirmed! Here are the details:</p>
          
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Booking Details:</h3>
            <p><strong>Package:</strong> ${bookingDetails.packageTitle}</p>
            <p><strong>Booking ID:</strong> ${bookingDetails.bookingId}</p>
            <p><strong>Travel Dates:</strong> ${bookingDetails.startDate} to ${bookingDetails.endDate}</p>
            <p><strong>Travelers:</strong> ${bookingDetails.numberOfTravelers}</p>
            <p><strong>Total Amount:</strong> $${bookingDetails.totalAmount}</p>
          </div>
          
          <p>We'll send you more details closer to your travel date.</p>
          
          <p>Have a wonderful trip! 🌟</p>
          <p>The Travel Blog Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Booking confirmation sent successfully');
  } catch (error) {
    console.error('Error sending booking confirmation:', error);
  }
};

// Generic email sending function for new features
const sendEmail = async ({ to, subject, template, data, html }) => {
  try {
    const transporter = createTransporter();
    
    let emailHtml = html;
    
    // If template is provided, generate HTML based on template type
    if (template && data) {
      emailHtml = generateEmailTemplate(template, data);
    }
    
    const mailOptions = {
      from: `"Travel Blog" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: emailHtml
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return result;

  } catch (error) {
    console.error('Send email error:', error);
    throw new Error('Failed to send email');
  }
};

// Generate email templates for new features
const generateEmailTemplate = (template, data) => {
  const baseStyle = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; text-align: center;">Travel Blog</h1>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
  `;
  
  const baseEnd = `
      </div>
      <div style="text-align: center; margin-top: 20px; color: #666;">
        <p>Happy Travels! 🌍</p>
        <p><small>Travel Blog Team</small></p>
      </div>
    </div>
  `;

  switch (template) {
    case 'group-join-notification':
      return `${baseStyle}
        <h2 style="color: #333;">New Member Joined Your Group Trip! 🎉</h2>
        <p>Hi ${data.organizerName},</p>
        <p><strong>${data.participantName}</strong> has joined your group trip: <strong>${data.groupTitle}</strong></p>
        <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Package:</strong> ${data.packageTitle}</p>
          <p><strong>Current Participants:</strong> ${data.currentParticipants}/${data.maxParticipants}</p>
        </div>
        <p>You can manage your group and communicate with members through your dashboard.</p>
        ${baseEnd}`;

    case 'group-booking-confirmed':
      return `${baseStyle}
        <h2 style="color: #4CAF50;">Group Trip Booking Confirmed! ✅</h2>
        <p>Hi ${data.userName},</p>
        <p>Great news! Your participation in the group trip has been confirmed.</p>
        <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Trip:</strong> ${data.groupTitle}</p>
          <p><strong>Package:</strong> ${data.packageTitle}</p>
          <p><strong>Organizer:</strong> ${data.organizerName}</p>
        </div>
        <p>Next steps and payment information will be shared soon. Stay tuned!</p>
        ${baseEnd}`;

    case 'group-booking-cancelled':
      return `${baseStyle}
        <h2 style="color: #f44336;">Group Trip Cancelled ❌</h2>
        <p>Hi ${data.userName},</p>
        <p>Unfortunately, the group trip has been cancelled by the organizer.</p>
        <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Trip:</strong> ${data.groupTitle}</p>
          <p><strong>Reason:</strong> ${data.reason}</p>
          <p><strong>Organizer:</strong> ${data.organizerName}</p>
        </div>
        <p>Any payments made will be refunded according to our cancellation policy.</p>
        ${baseEnd}`;

    case 'group-announcement':
      return `${baseStyle}
        <h2 style="color: #2196F3;">Group Trip Announcement 📢</h2>
        <p>Hi ${data.userName},</p>
        <p>New announcement for your group trip: <strong>${data.groupTitle}</strong></p>
        <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2196F3;">
          <p>${data.announcement}</p>
        </div>
        <p><small>From: ${data.organizerName}</small></p>
        ${baseEnd}`;

    default:
      return `${baseStyle}
        <p>You have a new notification from Travel Blog.</p>
        ${baseEnd}`;
  }
};

module.exports = {
  sendWelcomeEmail,
  sendCommentNotification,
  sendNewsletter,
  sendBookingConfirmation,
  sendEmail
};
