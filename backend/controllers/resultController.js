import Result from "../models/Result.js";
import Test from "../models/Test.js";
import Notification from "../models/Notification.js";

// Submit Test
export const submitTest = async (req, res) => {
  try {
    const { testId, answers, score, totalMarks } = req.body;
    const studentId = req.user._id;

    const test = await Test.findById(testId);
    if (!test) return res.status(404).json({ message: "Test not found" });

    const result = await Result.create({
      student: studentId,
      test: testId,
      answers,
      score,
      totalMarks,
    });

    // 👇 NOTIFICATION TRIGGER
    try {
      console.log(`[TRIGGER] Creating result notification for: ${req.user.name}`);
      await Notification.create({
        type: 'result',
        title: 'Test Submitted',
        message: `${req.user.name} scored ${score}/${totalMarks} in '${test.title}'.`,
        link: '/admin/results',
        isRead: false
      });
      console.log("[SUCCESS] Result notification saved!");
    } catch (error) {
      console.error("[ERROR] Notification failed:", error);
    }

    res.status(201).json(result);
  } catch (error) {
    console.error("Submit Error:", error);
    res.status(500).json({ message: "Failed to submit test" });
  }
};

// Get All Results (Admin)
export const getAllResults = async (req, res) => {
  try {
    const results = await Result.find()
      .populate("student", "name email")
      .populate("test", "title")
      .sort({ createdAt: -1 });
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Get My Results (Student)
export const getMyResults = async (req, res) => {
  try {
    const results = await Result.find({ student: req.user._id })
      .populate("test", "title")
      .sort({ createdAt: -1 });
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};