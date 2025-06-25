const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User.model.js");
const router = express.Router();

// POST login
router.post("/login", async (req, res) => {
  try {
    console.log("POST /api/auth/login");
    console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);
    console.log("JWT_SECRET value:", process.env.JWT_SECRET ? 'LOADED' : 'MISSING')
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    // Find User
    const user = await User.findOne({ username });
    if (!user) {
      console.log("User not found:", username);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Invalid password for user:", username);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if JWT_Secret exists before creating token
    if (!process.env.JWT_SECRET) {
      console.log('JWT_SECRET is missing from enviornment variables');
      return res.status(500).json({ message: 'Server configuration error'})
    }


    // Create Token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    console.log("User logged in successfully:", username);
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
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

// POST register
router.post("/register", async (req, res) => {
  try {
    console.log("POST /api/auth/register");
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    // Check if user exist
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Create user
    const user = new User({ username, password });
    await user.save();

    console.log("User registered successfully:", username);
    res.status(201).json({
      message: "User created successfully",
      user: { id: user._id, username: user.username, role: user.role },
    });
  } catch (error) {
    console.log("Registration error:", error.message);
    res.status(400).json({
      message: "Registration error",
      error: error.message,
    });
  }
});

module.exports = router;
