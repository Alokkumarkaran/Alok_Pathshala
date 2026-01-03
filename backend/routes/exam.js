import express from "express";
import Question from "../models/Question.js";
import Result from "../models/Result.js";
import Test from "../models/Test.js"; // Import Test to get title
import Notification from "../models/Notification.js"; // 👈 IMPORT THIS
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ STUDENT: Submit Exam
router.post("/submit", protect, async (req, res) => {
  try {
    const { studentId, testId, answers } = req.body;

    if (!studentId || !testId || !Array.isArray(answers)) {
      return res.status(400).json({ message: "Invalid data." });
    }

    let score = 0;
    let correctCount = 0;
    let wrongCount = 0;
    const detailedAnswers = [];

    for (const ans of answers) {
      if (!ans.questionId) continue;
      const question = await Question.findById(ans.questionId);

      if (!question) {
        detailedAnswers.push({ questionId: ans.questionId, selectedIndex: -1 });
        continue;
      }

      let isCorrect = false;
      const userIndex = ans.selectedIndex;
      const validIndex = (userIndex !== undefined && userIndex !== null) ? userIndex : -1;

      if (validIndex !== -1) {
        if (question.options[validIndex]?.isCorrect === true) {
          isCorrect = true;
          score++;
          correctCount++;
        } else {
          wrongCount++;
        }
      }

      detailedAnswers.push({
        questionId: ans.questionId,
        selectedIndex: validIndex
      });
    }

    const result = await Result.create({
      studentId,
      testId,
      score,
      totalQuestions: answers.length,
      correctAnswers: correctCount,
      wrongAnswers: wrongCount,
      answers: detailedAnswers
    });

    // 👇 NOTIFICATION TRIGGER (Added here)
    try {
        const testDetails = await Test.findById(testId);
        // Use req.user.name because 'protect' middleware adds the user to req
        console.log(`[TRIGGER] Exam Submit Notification for: ${req.user.name}`);
        
        await Notification.create({
            type: 'result',
            title: 'Test Submitted',
            message: `${req.user.name} scored ${score} in '${testDetails ? testDetails.title : 'Unknown Test'}'.`,
            link: '/admin/results',
            isRead: false
        });
    } catch (notifError) {
        console.error("Notification Error:", notifError);
    }

    res.status(201).json({ 
      message: "Exam submitted successfully", 
      result 
    });

  } catch (error) {
    console.error("❌ SUBMIT ERROR:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// ... (KEEP ALL YOUR OTHER ROUTES BELOW EXACTLY AS THEY WERE) ...

router.get("/results/:studentId", protect, async (req, res) => {
  if (req.user.role !== "admin" && req.user._id.toString() !== req.params.studentId) {
    return res.status(403).json({ message: "Access denied" });
  }
  const results = await Result.find({ studentId: req.params.studentId })
    .populate("testId", "title passingMarks")
    .sort({ createdAt: -1 });
  res.json(results);
});

router.get("/admin/results", protect, adminOnly, async (req, res) => {
  const results = await Result.find()
    .populate("studentId", "name email")
    .populate("testId", "title passingMarks")
    .sort({ score: -1 });
  res.json(results);
});

router.get("/admin/leaderboard/:testId", protect, adminOnly, async (req, res) => {
  const leaderboard = await Result.find({ testId: req.params.testId })
    .populate("studentId", "name")
    .sort({ score: -1 })
    .limit(10);
  res.json(leaderboard);
});

router.get("/result/:id", async (req, res) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate("testId", "title totalMarks passingMarks")
      .populate("answers.questionId");
    if (!result) return res.status(404).json({ message: "Result not found" });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

router.get("/leaderboard/global", async (req, res) => {
  try {
    const topResults = await Result.find()
      .populate("studentId", "name")
      .populate("testId", "title")
      .sort({ score: -1 })
      .limit(5);
    res.json(topResults);
  } catch (err) {
    res.status(500).json({ message: "Error fetching leaderboard" });
  }
});

export default router;