// server/src/scripts/seedAdmin.js
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User"); // Ensure path is correct relative to script

const seedAdmin = async () => {
  try {
    // Connect to DB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for seeding...");

    const adminEmail = "admin@nyanmarket.com";
    
    // Check if admin exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log(`Admin user with email ${adminEmail} already exists.`);
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("Password123!", salt);

    // Create Admin
    const adminUser = new User({
      fullName: "System Admin",
      email: adminEmail,
      password: hashedPassword,
      roles: ["user", "admin"],
      isEmailVerified: true, // Assuming admins don't need OTP verification
    });

    await adminUser.save();
    console.log(`Admin user created successfully!`);
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: Password123!`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  }
};

seedAdmin();
