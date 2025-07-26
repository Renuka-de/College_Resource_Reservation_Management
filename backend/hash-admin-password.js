// Script to hash admin password for specific user
require("dotenv").config();
const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");

async function hashAdminPassword() {
  const client = new MongoClient(process.env.MONGO_URI || "mongodb://localhost:27017");
  
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");
    
    const db = client.db("CRMS");
    const usersCollection = db.collection("students");
    
    const adminEmail = "shiyamaladevijegan@gmail.com";
    const plainPassword = "sham123";
    
    console.log(`🔍 Looking for admin user: ${adminEmail}`);
    
    // Find the admin user
    const user = await usersCollection.findOne({ email: adminEmail });
    
    if (!user) {
      console.log("❌ Admin user not found. Creating new admin user...");
      
      // Hash the password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
      
      // Create new admin user
      const newAdmin = {
        name: "Muthulakshmi",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await usersCollection.insertOne(newAdmin);
      console.log("✅ New admin user created with ID:", result.insertedId);
      
    } else {
      console.log("✅ Admin user found:", {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isPasswordHashed: user.password ? user.password.startsWith('$2b$') : false
      });
      
      // Check if password is already hashed
      if (user.password && user.password.startsWith('$2b$')) {
        console.log("✅ Password is already hashed");
        return;
      }
      
      // Hash the plain text password
      console.log("🔐 Hashing plain text password...");
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
      
      // Update the user with hashed password
      await usersCollection.updateOne(
        { _id: user._id },
        { 
          $set: { 
            password: hashedPassword,
            updatedAt: new Date(),
            passwordMigrated: true
          } 
        }
      );
      
      console.log("✅ Admin password hashed and updated successfully");
    }
    
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await client.close();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run the script
console.log("🚀 Starting admin password hash...");
hashAdminPassword()
  .then(() => {
    console.log("✅ Admin password hash completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Admin password hash failed:", error);
    process.exit(1);
  }); 