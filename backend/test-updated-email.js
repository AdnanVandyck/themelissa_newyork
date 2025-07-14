// test-updated-email.js
const path = require('path');
require('dotenv').config(); // Load environment variables

const emailService = require('./config/emailService');

// Enhanced environment validation
function validateEnvironment() {
  console.log('🔍 Environment Variables Check:\n');
  
  const requiredVars = {
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_APP_PASSWORD: process.env.EMAIL_APP_PASSWORD,
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173'
  };

  let allPresent = true;
  
  for (const [key, value] of Object.entries(requiredVars)) {
    if (value) {
      if (key === 'EMAIL_APP_PASSWORD') {
        console.log(`✅ ${key}: ${'*'.repeat(value.length)} (${value.length} characters)`);
      } else {
        console.log(`✅ ${key}: ${value}`);
      }
    } else {
      console.log(`❌ ${key}: NOT SET`);
      allPresent = false;
    }
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  if (!allPresent) {
    console.log('❌ Missing required environment variables!');
    console.log('Please check your .env file contains:');
    console.log('EMAIL_USER=themelissanyc@gmail.com');
    console.log('EMAIL_APP_PASSWORD=your16characterapppassword');
    console.log('FRONTEND_URL=https://themelissanyc.com');
    return false;
  }
  
  return true;
}

async function testUpdatedEmailService() {
  console.log('🚀 The Melissa NYC - Email Service Test\n');
  console.log('='.repeat(60) + '\n');

  // Validate environment first
  if (!validateEnvironment()) {
    console.log('Test aborted due to missing environment variables.');
    return;
  }

  console.log('🧪 Testing updated email service...\n');

  try {
    // Wait for email service to initialize
    console.log('⏳ Waiting for email service to initialize...');
    
    // Wait up to 10 seconds for the service to be ready
    let attempts = 0;
    const maxAttempts = 20; // 10 seconds (500ms * 20)
    
    while (!emailService.isConfigured && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 500));
      attempts++;
    }
    
    if (!emailService.isConfigured) {
      console.log('❌ Email service failed to initialize within 10 seconds');
      return;
    }
    
    console.log('✅ Email service initialized successfully!\n');

    // Test 1: Connection Test
    console.log('📡 Step 1: Testing SMTP connection...');
    const connectionTest = await emailService.testConnection();
    console.log('Connection result:', connectionTest);
    
    if (!connectionTest.success) {
      console.log('❌ Connection test failed. Cannot proceed with email tests.');
      console.log('Please check your Gmail App Password configuration.');
      return;
    }
    
    console.log('✅ SMTP connection successful!\n');

    // Test 2: Verification Email
    console.log('📧 Step 2: Testing verification email...');
    const mockUser = {
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      email: process.env.EMAIL_USER, // Send to yourself
      role: 'staff',
      createdAt: new Date()
    };

    const verificationResult = await emailService.sendVerificationEmail(mockUser, 'test-token-123');
    console.log('Verification email result:', {
      success: verificationResult.success,
      messageId: verificationResult.messageId || 'N/A',
      error: verificationResult.error || 'None'
    });

    if (verificationResult.success) {
      console.log('✅ Verification email sent successfully!');
    } else {
      console.log('❌ Verification email failed:', verificationResult.error);
    }

    console.log(''); // Add spacing

    // Test 3: Welcome Email
    console.log('🎉 Step 3: Testing welcome email...');
    const welcomeResult = await emailService.sendWelcomeEmail(mockUser);
    console.log('Welcome email result:', {
      success: welcomeResult.success,
      messageId: welcomeResult.messageId || 'N/A',
      error: welcomeResult.error || 'None'
    });

    if (welcomeResult.success) {
      console.log('✅ Welcome email sent successfully!');
    } else {
      console.log('❌ Welcome email failed:', welcomeResult.error);
    }

    console.log(''); // Add spacing

    // Test 4: Admin Notification Email
    console.log('🔔 Step 4: Testing admin notification email...');
    const adminNotificationResult = await emailService.sendNewUserNotification(
      process.env.EMAIL_USER, // Send to yourself as admin
      mockUser
    );
    console.log('Admin notification result:', {
      success: adminNotificationResult.success,
      messageId: adminNotificationResult.messageId || 'N/A',
      error: adminNotificationResult.error || 'None'
    });

    if (adminNotificationResult.success) {
      console.log('✅ Admin notification email sent successfully!');
    } else {
      console.log('❌ Admin notification email failed:', adminNotificationResult.error);
    }

    console.log('\n' + '='.repeat(60));

    // Summary
    const allTests = [connectionTest, verificationResult, welcomeResult, adminNotificationResult];
    const successfulTests = allTests.filter(test => test.success).length;
    const totalTests = allTests.length;

    console.log(`\n📊 Test Summary: ${successfulTests}/${totalTests} tests passed`);

    if (successfulTests === totalTests) {
      console.log('🎉 ALL TESTS PASSED!');
      console.log('✅ Your email service is ready for production!');
      console.log('📬 Check your inbox for the test emails.');
    } else {
      console.log('⚠️ Some tests failed. Please check the errors above.');
    }

    console.log('\n📧 Email Templates Tested:');
    console.log('  • User verification email');
    console.log('  • Welcome email after verification');
    console.log('  • Admin notification email');

    console.log('\n🔗 Next Steps:');
    console.log('  1. Check your email inbox for test messages');
    console.log('  2. Integrate the updated email service into your app');
    console.log('  3. Test the full registration → verification → approval flow');

  } catch (error) {
    console.error('\n❌ Unexpected error during testing:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Add error handling for unhandled promises
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Run the test
testUpdatedEmailService().catch(error => {
  console.error('Test execution error:', error);
  process.exit(1);
});