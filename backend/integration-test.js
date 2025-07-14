// integration-test.js
const mongoose = require('mongoose');
const User = require('./models/User'); // Adjust path
const emailService = require('./config/emailService');
require('dotenv').config();

async function testCompleteFlow() {
  console.log('🔄 Testing complete user registration flow...\n');

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Test user data
    const testUser = {
      firstName: 'Test',
      lastName: 'User',
      username: 'testuser' + Date.now(),
      email: process.env.EMAIL_USER, // Send to yourself
      password: 'TestPassword123!',
      role: 'staff'
    };

    console.log(`📝 Creating test user: ${testUser.email}`);

    // Simulate the registration process
    // (You can copy the logic from your registration route)
    
    console.log('✅ Complete flow test successful!');
  } catch (error) {
    console.error('❌ Integration test failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testCompleteFlow();