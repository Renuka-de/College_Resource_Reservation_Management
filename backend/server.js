//backend/server.js
require("dotenv").config();
const express = require("express");
const { MongoClient } = require("mongodb");
const cors=require("cors");
const app = express();
app.use(express.json());
//app.use(cors());
const authRoutes = require("./routes/auth");
const resourceRoutes = require("./routes/resources");
const reservationRoutes = require("./routes/reservations");
app.use(cors({ origin: "http://localhost:3000" }));

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

        const db = client.db("CRMS"); // ✅ Fix applied

        app.use("/api/auth", authRoutes(db));
        app.use("/api/resources", resourceRoutes(db));
        app.use("/api/reservations", reservationRoutes(db));
    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err);
    }
}

run().catch(console.dir);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
