
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
const router = express.Router();


router.post("/register", async(req,res)=>{
  const {name,email,password,role} = req.body;
  const hashed = await bcrypt.hash(password,10);
  const user = await User.create({name,email,password:hashed,role});
  res.json(user);
});

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
    // Find all users with role 'student', hide password, sort by newest
    const students = await User.find({ role: "student" })
      .select("-password") 
      .sort({ createdAt: -1 });

    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching students" });
  }
});

router.delete("/user/:id", protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent deleting yourself (Admin)
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot delete your own admin account." });
    }

    await User.findByIdAndDelete(req.params.id);
    
    // Optional: Also delete their exam results if you want to clean up DB
    // await Result.deleteMany({ studentId: req.params.id }); 

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});


export default router;
