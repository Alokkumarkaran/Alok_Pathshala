import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import authRoutes from "./routes/auth.js";
import testRoutes from "./routes/test.js";
import User from "./models/User.js";
import examRoutes from "./routes/exam.js";

dotenv.config(); // This loads the variables from .env
const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB Connected");

    // 🔹 SECURE AUTO CREATE ADMIN (SEED)
    // Get credentials from Environment Variables
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    // Check if variables are set
    if (!adminEmail || !adminPassword) {
      console.warn("⚠️ Admin credentials not found in .env. Skipping admin creation.");
    } else {
      const adminExists = await User.findOne({ email: adminEmail });

      if (!adminExists) {
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        await User.create({
          name: "Admin",
          email: adminEmail,
          password: hashedPassword,
          role: "admin",
        });

        console.log("✅ Admin user created automatically");
      } else {
        console.log("ℹ️ Admin already exists");
      }
    }
  })
  .catch((err) => console.error("❌ MongoDB Error:", err));

app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/exam", examRoutes);

app.listen(5000, () =>
  console.log("🚀 Server running on http://localhost:5000")
);