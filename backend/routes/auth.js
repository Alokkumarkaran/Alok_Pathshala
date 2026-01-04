import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Notification from "../models/Notification.js"; // 👈 IMPORT THIS
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import Result from "../models/Result.js";

const router = express.Router();

// REGISTER ROUTE
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const assignedRole = role ? role.toLowerCase() : "student";

    const user = await User.create({ name, email, password: hashed, role: assignedRole });

    // 👇 NOTIFICATION TRIGGER (Added directly in the route)
    if (assignedRole === 'student') {
        try {
            console.log(`[TRIGGER] New Student Notification for: ${user.name}`);
            await Notification.create({
                type: 'student',
                title: 'New Student Registered',
                message: `${user.name} has joined Alok Pathshala.`,
                link: '/admin/students',
                isRead: false
            });
        } catch (error) {
            console.error("Notification Error:", error);
        }
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Registration failed" });
  }
});

// LOGIN ROUTE
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(400).json({ message: "Invalid password" });
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

router.get("/students", async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .select("-password") 
      .sort({ createdAt: -1 });

    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching students" });
  }
});

// ✅ UPDATED DELETE ROUTE (Cascading Delete)
router.delete("/user/:id", protect, adminOnly, async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot delete your own admin account." });
    }

    // 👇 2. DELETE ALL RESULTS ASSOCIATED WITH THIS STUDENT FIRST
    await Result.deleteMany({ studentId: userId });

    // 👇 3. THEN DELETE THE USER
    await User.findByIdAndDelete(userId);

    res.json({ message: "User and all associated exam data deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});



export default router;