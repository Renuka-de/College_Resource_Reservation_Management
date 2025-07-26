//backend/routes/auth.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");

// Rate limiting for auth endpoints
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // limit each IP to 30 login attempts per windowMs
  message: { message: "Too many login attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 registration attempts per windowMs
  message: { message: "Too many registration attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Input validation middleware
const validateRegistration = (req, res, next) => {
  const { name, email, password, role } = req.body;
  
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }
  
  if (name.trim().length < 2) {
    return res.status(400).json({ message: "Name must be at least 2 characters long" });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters long" });
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Please provide a valid email address" });
  }
  
  if (!["admin", "User"].includes(role)) {
    return res.status(400).json({ message: "Invalid role specified" });
  }
  
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Please provide a valid email address" });
  }
  
  next();
};

module.exports = (db) => {
  const usersCollection = db.collection("students");

  router.post("/register", registerLimiter, validateRegistration, async (req, res) => {
    try {
      const { name, email, password, role } = req.body;

      // Check if user already exists
      const existingUser = await usersCollection.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user object
      const user = {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await usersCollection.insertOne(user);
      
      // Remove password from response
      delete user.password;
      user._id = result.insertedId;

      res.status(201).json({ 
        message: "User registered successfully", 
        userId: result.insertedId 
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Internal server error during registration" });
    }
  });

  router.post("/login", loginLimiter, validateLogin, async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log("Login attempt for email:", email);
      console.log("Rate limit headers:", {
        'X-RateLimit-Limit': res.getHeader('X-RateLimit-Limit'),
        'X-RateLimit-Remaining': res.getHeader('X-RateLimit-Remaining'),
        'X-RateLimit-Reset': res.getHeader('X-RateLimit-Reset')
      });

      // Find user by email
      const user = await usersCollection.findOne({ email: email.toLowerCase() });
      if (!user) {
        console.log("User not found for email:", email);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      console.log("User found:", { id: user._id, email: user.email, role: user.role });
      console.log("Password field exists:", !!user.password);
      console.log("Password field type:", typeof user.password);

      // Check if password is already hashed (starts with $2b$)
      const isPasswordHashed = user.password && user.password.startsWith('$2b$');
      
      let isPasswordValid = false;
      
      if (isPasswordHashed) {
        // Password is already hashed, use bcrypt.compare
        console.log("Password is hashed, using bcrypt.compare");
        isPasswordValid = await bcrypt.compare(password, user.password);
      } else {
        // Password is plain text (legacy user), compare directly
        console.log("Password is plain text, comparing directly");
        isPasswordValid = password === user.password;
        
        // If login successful, hash the password for future use
        if (isPasswordValid) {
          console.log("Legacy user login successful, hashing password for future use");
          const saltRounds = 12;
          const hashedPassword = await bcrypt.hash(password, saltRounds);
          await usersCollection.updateOne(
            { _id: user._id },
            { $set: { password: hashedPassword, updatedAt: new Date() } }
          );
          console.log("Password hashed and updated in database");
        }
      }

      if (!isPasswordValid) {
        console.log("Password validation failed");
        return res.status(401).json({ message: "Invalid credentials" });
      }

      console.log("Password validation successful");

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user._id, 
          email: user.email, 
          role: user.role 
        },
        process.env.JWT_SECRET || "your-secret-key-change-in-production",
        { expiresIn: "24h" }
      );

      // Update last login
      await usersCollection.updateOne(
        { _id: user._id },
        { $set: { lastLogin: new Date(), updatedAt: new Date() } }
      );

      // Remove password from response
      const userResponse = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        lastLogin: new Date()
      };

      console.log("Login successful for user:", user.email);

      res.json({ 
        message: "Login successful", 
        user: userResponse,
        token 
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error during login" });
    }
  });

  // Verify token endpoint
  router.get("/verify", async (req, res) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }

      const decoded = jwt.verify(
        token, 
        process.env.JWT_SECRET || "your-secret-key-change-in-production"
      );

      const user = await usersCollection.findOne({ _id: decoded.userId });
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      const userResponse = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      };

      res.json({ user: userResponse });
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired" });
      }
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({ message: "Invalid token" });
      }
      console.error("Token verification error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Rate limit status endpoint
  router.get("/rate-limit-status", (req, res) => {
    res.json({
      message: "Rate limit status",
      headers: {
        'X-RateLimit-Limit': res.getHeader('X-RateLimit-Limit'),
        'X-RateLimit-Remaining': res.getHeader('X-RateLimit-Remaining'),
        'X-RateLimit-Reset': res.getHeader('X-RateLimit-Reset')
      }
    });
  });

  // Debug endpoint to check user data (for development only)
  router.get("/debug/:email", async (req, res) => {
    try {
      const { email } = req.params;
      
      const user = await usersCollection.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Return safe debug info without exposing password
      const debugInfo = {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        hasPassword: !!user.password,
        passwordLength: user.password ? user.password.length : 0,
        isPasswordHashed: user.password ? user.password.startsWith('$2b$') : false,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };

      res.json(debugInfo);
    } catch (error) {
      console.error("Debug endpoint error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return router;
};