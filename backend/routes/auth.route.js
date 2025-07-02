const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User.js");
const router = express.Router();

// POST login - Enhanced to support email or username
router.post("/login", async (req, res) => {
  try {
    console.log("POST /api/auth/login");
    console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);
    
    const { username, email, password } = req.body;
    const loginIdentifier = email || username; // Support both email and username

    // Validate input
    if (!loginIdentifier || !password) {
      return res
        .status(400)
        .json({ message: "Email/Username and password are required" });
    }

    // Find User by email or username
    const user = await User.findOne({
      $or: [
        { email: loginIdentifier },
        { username: loginIdentifier }
      ]
    });

    if (!user) {
      console.log("User not found:", loginIdentifier);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Use the new comparePassword method from User model
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log("Invalid password for user:", loginIdentifier);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if JWT_Secret exists before creating token
    if (!process.env.JWT_SECRET) {
      console.log('JWT_SECRET is missing from environment variables');
      return res.status(500).json({ message: 'Server configuration error'});
    }

    // Create Token - Include role in JWT payload
    const token = jwt.sign(
      { 
        userId: user._id, 
        username: user.username,
        role: user.role // Added role to token payload
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    console.log("User logged in successfully:", user.username, "Role:", user.role);
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log("Login error:", error.message);
    res.status(500).json({
      message: "Login error",
      error: error.message,
    });
  }
});

// POST register - Enhanced to include email
router.post("/register", async (req, res) => {
  try {
    console.log("POST /api/auth/register");
    const { username, email, password, role } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Username, email, and password are required" });
    }

    // Check if user exists (by username or email)
    const existingUser = await User.findOne({
      $or: [
        { username: username },
        { email: email }
      ]
    });

    if (existingUser) {
      const field = existingUser.username === username ? 'Username' : 'Email';
      return res.status(400).json({ 
        message: `${field} already exists` 
      });
    }

    // Create user (password will be hashed automatically by the pre('save') middleware)
    const user = new User({ 
      username, 
      email, 
      password,
      role: role || 'admin' // Default to admin as per your schema
    });
    
    await user.save();

    console.log("User registered successfully:", username, "Email:", email);
    res.status(201).json({
      message: "User created successfully",
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email,
        role: user.role 
      },
    });
  } catch (error) {
    console.log("Registration error:", error.message);
    
    // Handle mongoose validation errors nicely
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: "Validation error",
        errors: validationErrors
      });
    }

    res.status(400).json({
      message: "Registration error",
      error: error.message,
    });
  }
});

// GET verify token - NEW ENDPOINT
router.get("/verify", async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log("Token verified for user:", user.username);
    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Token verification error:', error.message);
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;