import nodemailer from 'nodemailer';
import config from '../app/config';

export const sendEmail = async (to: string, html: string) => {
  // For development, log email to console instead of sending
  if (config.NODE_ENV === 'development') {
    console.log('\n📧 ========== EMAIL (Development Mode) ==========');
    console.log('To:', to);
    console.log('Subject: Verification Code');
    console.log('HTML Content:');
    console.log(html);
    console.log('================================================\n');
    
    // Extract verification code from HTML for easy copying
    const codeMatch = html.match(/\d{6}/);
    if (codeMatch) {
      console.log('🔑 VERIFICATION CODE:', codeMatch[0]);
      console.log('================================================\n');
    }
    
    return; // Don't actually send email in development
  }

  // Production email sending
  if (!config.email_user || !config.email_pass) {
    throw new Error(
      'Email credentials (EMAIL_USER, EMAIL_PASS) are missing in .env file'
    );
  }

  const transporter = nodemailer.createTransport({
    host: config.email_host || 'smtp.gmail.com',
    port: config.email_port || 587,
    secure: false, // Use TLS
    auth: {
      user: config.email_user,
      pass: config.email_pass,
    },
    tls: {
      rejectUnauthorized: false, // For development/testing
    },
  });

  try {
    await transporter.sendMail({
      from: `"NovaHealth" <${config.email_user}>`,
      to,
      subject: 'Verification Code - NovaHealth',
      text: 'Please verify your email using the code provided.',
      html,
    });
    console.log('✅ Email sent successfully to:', to);
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
};
