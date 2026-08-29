import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import authRoutes from "./routes/auth.js";
import testRoutes from "./routes/test.js";
import User from "./models/User.js";
import examRoutes from "./routes/exam.js";
import notificationRoutes from './routes/notificationRoutes.js';
import folderRoutes from "./routes/folderRoutes.js";

dotenv.config(); // This loads the variables from .env
const app = express();


const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "https://alokpathshala.vercel.app",
];

if (process.env.CLIENT_URL) {
  process.env.CLIENT_URL.split(",").forEach((url) => {
    const trimmed = url.trim();
    if (trimmed && !allowedOrigins.includes(trimmed)) {
      allowedOrigins.push(trimmed);
    }
  });
}

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like Postman, mobile apps, server-to-server)
      if (!origin) return callback(null, true);

      const cleanOrigin = origin.replace(/\/$/, "");

      // Check explicit allowed origins (includes production domain & CLIENT_URL)
      if (allowedOrigins.includes(cleanOrigin)) {
        return callback(null, true);
      }

      // Allow any localhost / 127.0.0.1 origin (any port) for local development
      if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(cleanOrigin)) {
        return callback(null, true);
      }

      // Allow Alok Pathshala Vercel preview deployments (*alok*pathshala*.vercel.app)
      if (/^https:\/\/alok-?pathshala.*\.vercel\.app$/.test(cleanOrigin)) {
        return callback(null, true);
      }

      console.warn(`⚠️ CORS blocked request from origin: ${origin}`);
      callback(null, false);
    },
    credentials: true,
  })
);

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
app.use('/api/notifications', notificationRoutes);
app.use("/api/folders", folderRoutes);

app.listen(5000, () =>
  console.log("🚀 Server running on http://localhost:5000")
);