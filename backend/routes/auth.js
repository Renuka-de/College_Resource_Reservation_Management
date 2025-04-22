//backend/routes/auth.js
const express = require("express");
const router = express.Router();

module.exports = (db) => {
  const usersCollection = db.collection("students");

  router.post("/register", async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const result = await usersCollection.insertOne({ name, email, password, role });
    res.status(201).json({ message: "User registered", userId: result.insertedId });
  });

  router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const user = await usersCollection.findOne({ email, password });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Send user details along with role
    res.json({ message: "Login successful", user });
  });

  return router;
};