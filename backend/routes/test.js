import express from "express";
import Test from "../models/Test.js";
import Question from "../models/Question.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ ADMIN: Create Test
router.post("/create", protect, adminOnly, async (req, res) => {
  const test = await Test.create(req.body);
  res.json(test);
});

// ✅ ADMIN: Add Question
router.post("/add-question", protect, adminOnly, async (req, res) => {
  const { testId, question, options } = req.body;

  if (!testId || !question || !options) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const q = await Question.create({ testId, question, options });
  res.json(q);
});

// ✅ ADMIN: Get all tests
router.get("/admin/all", protect, adminOnly, async (req, res) => {
  const tests = await Test.find().sort({ createdAt: -1 });
  res.json(tests);
});

// ✅ ADMIN: Delete test
router.delete("/:id", protect, adminOnly, async (req, res) => {
  const testId = req.params.id;

  const deletedTest = await Test.findByIdAndDelete(testId);
  if (!deletedTest) {
    return res.status(404).json({ message: "Test not found" });
  }

  await Question.deleteMany({ testId });
  res.json({ message: "Test deleted successfully" });
});

// ✅ STUDENT: Get active tests
router.get("/student/all", protect, async (req, res) => {
  const tests = await Test.find({ isActive: true }).select(
    "title duration totalMarks passingMarks"
  );
  res.json(tests);
});

// ✅ STUDENT: Get questions for test
router.get("/:testId/questions", protect, async (req, res) => {
  const questions = await Question.find({ testId: req.params.testId })
    .select("-options.isCorrect");

  res.json(questions);
});

// ✅ ADMIN: Bulk Upload Questions with selected Test
router.post("/bulk-upload", protect, adminOnly, async (req, res) => {
  const { testId, questions } = req.body;

  if (!testId || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ message: "Invalid request data" });
  }

  try {
    const formattedQuestions = questions.map((q) => ({
      testId,
      question: q.question,
      options: q.options,
    }));

    await Question.insertMany(formattedQuestions);

    res.json({
      message: "Questions uploaded successfully",
      count: formattedQuestions.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Bulk upload failed" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }
    res.json(test);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});




export default router;
