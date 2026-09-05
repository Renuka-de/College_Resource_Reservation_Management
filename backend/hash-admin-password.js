// Create a new admin user in the students collection.
require("dotenv").config();
const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");

async function createAdmin() {
  const [name, email, plainPassword] = process.argv.slice(2);

  if (!name || !email || !plainPassword) {
    throw new Error('Usage: node hash-admin-password.js "Admin Name" admin@example.com password');
  }

  if (plainPassword.length < 6) {
    throw new Error("Password must be at least 6 characters long");
  }

  const normalizedEmail = email.toLowerCase().trim();
  const client = new MongoClient(process.env.MONGO_URI || "mongodb://localhost:27017");
  
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");
    
    const db = client.db("CRMS");
    const usersCollection = db.collection("students");

    const existingUser = await usersCollection.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw new Error(`A user with ${normalizedEmail} already exists`);
    }

    const hashedPassword = await bcrypt.hash(plainPassword, 12);
    const result = await usersCollection.insertOne({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log("✅ New admin user created with ID:", result.insertedId);
    
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await client.close();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run the script
console.log("🚀 Creating admin user...");
createAdmin()
  .then(() => {
    console.log("✅ Admin creation completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Admin creation failed:", error);
    process.exit(1);
  }); 