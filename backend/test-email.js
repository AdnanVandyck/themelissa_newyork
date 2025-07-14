// ===========================================
// EMAIL SERVICE TEST SCRIPT
// ===========================================

const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmailService() {
  console.log('🔄 Testing Gmail SMTP with App Password...\n');

  // Validate environment variables
  if (!process.env.EMAIL_USER) {
    console.error('❌ ERROR: EMAIL_USER not found in environment variables');
    console.log('Please add EMAIL_USER=your-gmail@gmail.com to your .env file');
    return;
  }

  if (!process.env.EMAIL_APP_PASSWORD) {
    console.error('❌ ERROR: EMAIL_APP_PASSWORD not found in environment variables');
    console.log('Please add EMAIL_APP_PASSWORD=your-16-char-password to your .env file');
    return;
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 20000,
    rateLimit: 5,
    tls: {
      rejectUnauthorized: true,
      minVersion: 'TLSv1.2'
    }
  });

  try {
    // Test 1: Verify SMTP connection
    console.log('📡 Testing SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!\n');

    // Test 2: Send actual test email
    console.log('📧 Sending test email...');
    
    const testEmail = {
      from: `"The Melissa NYC Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to yourself
      subject: '✅ Email Service Test - The Melissa NYC',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Email Test</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2c3e50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none; }
            .success { background: #d4edda; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { background: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 5px 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏢 The Melissa NYC</h1>
              <p>Email Service Test</p>
            </div>
            <div class="content">
              <div class="success">
                <strong>✅ Success!</strong> Your Gmail SMTP configuration is working correctly.
              </div>
              <h2>Test Results:</h2>
              <ul>
                <li><strong>SMTP Server:</strong> smtp.gmail.com:587</li>
                <li><strong>Authentication:</strong> App Password ✅</li>
                <li><strong>Timestamp:</strong> ${new Date().toLocaleString()}</li>
                <li><strong>From:</strong> ${process.env.EMAIL_USER}</li>
                <li><strong>Status:</strong> Email service ready for production!</li>
              </ul>
              <p>Your email verification system for The Melissa NYC is now ready to send verification emails to users.</p>
            </div>
            <div class="footer">
              <p>This is an automated test email from The Melissa NYC email service.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
The Melissa NYC Email Service Test

✅ SUCCESS! Your Gmail SMTP configuration is working correctly.

Test Results:
- SMTP Server: smtp.gmail.com:587
- Authentication: App Password ✅
- Timestamp: ${new Date().toLocaleString()}
- From: ${process.env.EMAIL_USER}
- Status: Email service ready for production!

Your email verification system is now ready to send emails to users.
      `
    };

    const info = await transporter.sendMail(testEmail);
    
    console.log('✅ Test email sent successfully!');
    console.log(`📧 Message ID: ${info.messageId}`);
    console.log(`📬 Check your inbox at: ${process.env.EMAIL_USER}`);
    console.log(`🎯 Accepted: ${info.accepted.join(', ')}`);
    
    if (info.rejected.length > 0) {
      console.log(`❌ Rejected: ${info.rejected.join(', ')}`);
    }

    console.log('\n🎉 EMAIL SERVICE TEST COMPLETED SUCCESSFULLY!');
    console.log('Your Gmail SMTP is ready for The Melissa NYC email verification system.');

  } catch (error) {
    console.error('\n❌ EMAIL SERVICE TEST FAILED!');
    console.error('Error details:', error.message);
    
    // Provide specific troubleshooting
    if (error.code === 'EAUTH') {
      console.log('\n🔧 TROUBLESHOOTING:');
      console.log('1. Double-check your Gmail app password is correct');
      console.log('2. Ensure 2-Factor Authentication is enabled on Gmail');
      console.log('3. Verify EMAIL_USER is your exact Gmail address');
      console.log('4. Make sure EMAIL_APP_PASSWORD has no spaces');
      console.log('5. Try generating a new app password');
    } else if (error.code === 'ECONNECTION') {
      console.log('\n🔧 TROUBLESHOOTING:');
      console.log('1. Check your internet connection');
      console.log('2. Verify firewall settings allow port 587');
      console.log('3. Try disabling antivirus email protection temporarily');
    } else {
      console.log('\n🔧 TROUBLESHOOTING:');
      console.log('1. Check all environment variables are set correctly');
      console.log('2. Verify your Gmail account is in good standing');
      console.log('3. Try creating a new app password');
    }
  } finally {
    // Close the transporter
    transporter.close();
  }
}

// ===========================================
// ENVIRONMENT VALIDATION
// ===========================================

function validateEnvironment() {
  console.log('🔍 Validating environment configuration...\n');
  
  const requiredVars = ['EMAIL_USER', 'EMAIL_APP_PASSWORD'];
  const missingVars = [];
  
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    } else {
      console.log(`✅ ${varName}: ${varName === 'EMAIL_APP_PASSWORD' ? '****hidden****' : process.env[varName]}`);
    }
  });
  
  if (missingVars.length > 0) {
    console.error(`\n❌ Missing environment variables: ${missingVars.join(', ')}`);
    console.log('\nPlease add these to your .env file:');
    missingVars.forEach(varName => {
      console.log(`${varName}=your-value-here`);
    });
    return false;
  }
  
  console.log('\n✅ Environment validation passed!\n');
  return true;
}

// ===========================================
// RUN THE TEST
// ===========================================

async function runTest() {
  console.log('🚀 The Melissa NYC Email Service Test\n');
  console.log('==========================================\n');
  
  if (validateEnvironment()) {
    await testEmailService();
  }
  
  console.log('\n==========================================');
  console.log('Test completed. Check the results above.');
}

// Execute the test
runTest().catch(error => {
  console.error('Unexpected error:', error);
});

// ===========================================
// EXPORT FOR USE IN OTHER FILES
// ===========================================

module.exports = {
  testEmailService,
  validateEnvironment
};