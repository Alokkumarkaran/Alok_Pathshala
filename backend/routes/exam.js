import express from "express";
import Question from "../models/Question.js";
import Result from "../models/Result.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();


// ✅ STUDENT: Submit Exam (Fixed for Validation Error)
router.post("/submit", protect, async (req, res) => {
  try {
    const { studentId, testId, answers } = req.body;

    if (!studentId || !testId || !Array.isArray(answers)) {
      return res.status(400).json({ message: "Invalid data. Missing studentId, testId, or answers." });
    }

    let score = 0;
    let correctCount = 0;
    let wrongCount = 0;
    const detailedAnswers = [];

    // Loop through answers
    for (const ans of answers) {
      if (!ans.questionId) continue;

      const question = await Question.findById(ans.questionId);

      // Handle Deleted Questions Gracefully
      if (!question) {
        detailedAnswers.push({
          questionId: ans.questionId,
          selectedIndex: -1 // Default to -1 (Skipped) if question missing
        });
        continue;
      }

      // Check correctness
      let isCorrect = false;
      const userIndex = ans.selectedIndex;

      // ✅ FIX: Check if userIndex is a valid number (0 or greater)
      // If userIndex is undefined/null, treat it as skipped (-1)
      const validIndex = (userIndex !== undefined && userIndex !== null) ? userIndex : -1;

      if (validIndex !== -1) {
        // Only verify correctness if not skipped
        if (question.options[validIndex]?.isCorrect === true) {
          isCorrect = true;
          score++;
          correctCount++;
        } else {
          wrongCount++;
        }
      }

      // Add to list for DB
      detailedAnswers.push({
        questionId: ans.questionId,
        selectedIndex: validIndex // ✅ Always sending a number (-1 for skipped)
      });
    }

    // Save Result
    const result = await Result.create({
      studentId,
      testId,
      score,
      totalQuestions: answers.length,
      correctAnswers: correctCount,
      wrongAnswers: wrongCount,
      answers: detailedAnswers
    });

    res.status(201).json({ 
      message: "Exam submitted successfully", 
      result 
    });

  } catch (error) {
    console.error("❌ SUBMIT ERROR:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// ... Keep your other routes (GET /results, etc.) ...


// ✅ STUDENT: View own results
router.get("/results/:studentId", protect, async (req, res) => {
  if (req.user.role !== "admin" && req.user._id.toString() !== req.params.studentId) {
    return res.status(403).json({ message: "Access denied" });
  }

  const results = await Result.find({ studentId: req.params.studentId })
    .populate("testId", "title passingMarks")
    .sort({ createdAt: -1 });

  res.json(results);
});

// ✅ ADMIN: All results
router.get("/admin/results", protect, adminOnly, async (req, res) => {
  const results = await Result.find()
    .populate("studentId", "name email")
    .populate("testId", "title passingMarks")
    .sort({ score: -1 });

  res.json(results);
});

// ✅ ADMIN: Leaderboard
router.get("/admin/leaderboard/:testId", protect, adminOnly, async (req, res) => {
  const leaderboard = await Result.find({ testId: req.params.testId })
    .populate("studentId", "name")
    .sort({ score: -1 })
    .limit(10);

  res.json(leaderboard);
});

// ✅ NEW ROUTE: Get Single Detailed Result (for Analysis)
router.get("/result/:id", async (req, res) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate("testId", "title totalMarks passingMarks") // Get Test Details
      .populate("answers.questionId"); // Get Question Text & Options

    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    res.json(result);
  } catch (error) {
    console.error("Error fetching result:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Get Global Top 5 Students
router.get("/leaderboard/global", async (req, res) => {
  try {
    const topResults = await Result.find()
      .populate("studentId", "name") // Get student name
      .populate("testId", "title")   // Get test name
      .sort({ score: -1 })           // Highest score first
      .limit(5);                     // Only top 5
      
    res.json(topResults);
  } catch (err) {
    res.status(500).json({ message: "Error fetching leaderboard" });
  }
});

export default router;