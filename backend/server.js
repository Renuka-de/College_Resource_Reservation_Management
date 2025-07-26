//backend/server.js
require("dotenv").config();
const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const app = express();

// Security middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs (increased from 100)
  message: { message: "Too many requests from this IP, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(globalLimiter);

// CORS configuration
app.use(cors({ 
  origin: "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Import routes
const authRoutes = require("./routes/auth");
const resourceRoutes = require("./routes/resources");
const reservationRoutes = require("./routes/reservations");
const userRoutes = require('./routes/user.js');
const { sendReminderEmails } = require("./utils/cronJob");

// Check if MONGO_URI is defined
if (!process.env.MONGO_URI) {
    console.error(" MONGO_URI is not defined. Check your .env file.");
    process.exit(1);
}

const client = new MongoClient(process.env.MONGO_URI);

async function run() {
    try {
        await client.connect();
        console.log("✅ MongoDB Connected");

        const db = client.db("CRMS"); 

        app.use("/api/auth", authRoutes(db));
        app.use("/api/resources", resourceRoutes(db));
        app.use("/api/reservations", reservationRoutes(db));
        app.use('/api/user', userRoutes(db)); 
       
        sendReminderEmails();  

    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err);
    }
}


run().catch(console.dir);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
