import User from "../models/User.js";
import Notification from "../models/Notification.js";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// @desc    Register new user
export const register = async (req, res) => {
  // 👇 LOUD DEBUG LOGS START
  console.log("🔥🔥 REGISTER ENDPOINT HIT 🔥🔥");
  console.log("Received Data:", req.body); 
  // 👆 LOUD DEBUG LOGS END

  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log("❌ Registration Failed: User already exists");
      return res.status(400).json({ message: "User already exists" });
    }

    // Default to 'student' if role is missing, and force lowercase
    const assignedRole = role ? role.toLowerCase() : "student";
    console.log(`ℹ️ Assigned Role: '${assignedRole}'`); // Debug Log

    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
    });

    if (user) {
      console.log("✅ User Created in DB:", user._id);

      // 👇 NOTIFICATION LOGIC (Simplified for debugging)
      // We removed the strict 'if' check temporarily to see if it fires at all
      try {
          console.log("🚀 Attempting to create notification...");
          
          await Notification.create({
            type: 'student',
            title: 'New Student Registered',
            message: `${user.name} (${assignedRole}) joined.`,
            link: '/admin/students',
            isRead: false
          });
          
          console.log("✅✅✅ NOTIFICATION SUCCESS! Check DB now.");
      } catch (notifError) {
          console.error("❌❌❌ NOTIFICATION ERROR:", notifError);
      }

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Server Error during Register:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};