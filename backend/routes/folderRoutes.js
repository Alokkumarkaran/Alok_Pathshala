import express from "express";
import ExamFolder from "../models/ExamFolder.js";
import Test from "../models/Test.js";
import Question from "../models/Question.js";
import Result from "../models/Result.js";
import Notification from "../models/Notification.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Helper to ensure a default folder exists if needed
const getOrCreateDefaultFolder = async (userId) => {
  let defaultFolder = await ExamFolder.findOne({ title: "General Assessments" });
  if (!defaultFolder) {
    defaultFolder = await ExamFolder.create({
      title: "General Assessments",
      description: "Default folder for general practice tests and practice exams.",
      categoryIcon: "folder",
      createdBy: userId,
      isActive: true,
    });
  }
  return defaultFolder;
};

// ✅ ADMIN: Create Exam Folder (supports both POST / and POST /create)
router.post(["/", "/create"], protect, adminOnly, async (req, res) => {
  try {
    const { title, description, categoryIcon } = req.body;
    if (!title) {
      return res.status(400).json({ message: "Folder title is required" });
    }

    const folder = await ExamFolder.create({
      title,
      description: description || "",
      categoryIcon: categoryIcon || "folder",
      createdBy: req.user._id,
      isActive: true,
    });

    try {
      await Notification.create({
        type: "test",
        title: "New Exam Folder Created",
        message: `Admin created folder: '${folder.title}'`,
        link: "/admin/folders",
        isRead: false,
      });
    } catch (err) {
      console.error("Notification trigger error:", err);
    }

    res.status(201).json(folder);
  } catch (error) {
    console.error("Create Folder Error:", error);
    res.status(500).json({ message: "Error creating exam folder", error: error.message });
  }
});

// ✅ ADMIN & STUDENT: Get All Exam Folders (supports both GET / and GET /all)
router.get(["/", "/all"], protect, async (req, res) => {
  try {
    let folders = await ExamFolder.find({ isActive: true }).sort({ createdAt: -1 });

    // If no folders exist, auto-create default folder
    if (folders.length === 0) {
      const defaultFolder = await getOrCreateDefaultFolder(req.user._id);
      folders = [defaultFolder];
    }

    // Attach counts for sets and tests without a folderId
    const defaultFolder = folders.find((f) => f.title === "General Assessments") || folders[0];

    const folderDataList = await Promise.all(
      folders.map(async (folder) => {
        let setQuery = { folderId: folder._id, isActive: true };
        
        // If this is the default folder, also include legacy tests without folderId
        if (defaultFolder && folder._id.toString() === defaultFolder._id.toString()) {
          setQuery = {
            $or: [
              { folderId: folder._id, isActive: true },
              { folderId: { $exists: false }, isActive: true },
              { folderId: null, isActive: true },
            ],
          };
        }

        const sets = await Test.find(setQuery).select("_id title setName questions duration totalMarks passingMarks");
        
        let totalQuestions = 0;
        sets.forEach((set) => {
          totalQuestions += (set.questions && set.questions.length) || 0;
        });

        return {
          ...folder.toObject(),
          totalSets: sets.length,
          totalQuestions,
          sets,
        };
      })
    );

    res.json(folderDataList);
  } catch (error) {
    console.error("Fetch Folders Error:", error);
    res.status(500).json({ message: "Error fetching exam folders" });
  }
});

// ✅ ADMIN & STUDENT: Get Sets inside a specific Exam Folder
router.get("/:folderId/sets", protect, async (req, res) => {
  try {
    const { folderId } = req.params;
    const folder = await ExamFolder.findById(folderId);
    if (!folder) {
      return res.status(404).json({ message: "Exam folder not found" });
    }

    let setQuery = { folderId: folder._id, isActive: true };

    // Handle legacy tests for default folder
    if (folder.title === "General Assessments") {
      setQuery = {
        $or: [
          { folderId: folder._id, isActive: true },
          { folderId: { $exists: false }, isActive: true },
          { folderId: null, isActive: true },
        ],
      };
    }

    const sets = await Test.find(setQuery).sort({ createdAt: 1 });

    res.json({
      folder,
      sets,
    });
  } catch (error) {
    console.error("Fetch Folder Sets Error:", error);
    res.status(500).json({ message: "Error fetching folder sets" });
  }
});

// ✅ ADMIN: Update Exam Folder
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const { title, description, categoryIcon, isActive } = req.body;
    const folder = await ExamFolder.findByIdAndUpdate(
      req.params.id,
      { title, description, categoryIcon, isActive },
      { new: true }
    );
    if (!folder) return res.status(404).json({ message: "Folder not found" });
    res.json(folder);
  } catch (error) {
    res.status(500).json({ message: "Error updating folder" });
  }
});

// ✅ ADMIN: Delete Exam Folder (Cascading delete folder, sets, questions, and results)
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const folder = await ExamFolder.findById(req.params.id);
    if (!folder) return res.status(404).json({ message: "Folder not found" });

    // Find all tests under this folder
    const tests = await Test.find({ folderId: folder._id });
    const testIds = tests.map((t) => t._id);

    if (testIds.length > 0) {
      // Cascading delete all questions and results under these tests
      await Question.deleteMany({ testId: { $in: testIds } });
      await Result.deleteMany({ testId: { $in: testIds } });
      await Test.deleteMany({ folderId: folder._id });
    }

    await ExamFolder.findByIdAndDelete(req.params.id);

    try {
      await Notification.create({
        type: "system",
        title: "Exam Folder Deleted",
        message: `Admin deleted folder '${folder.title}' and all associated test sets.`,
        link: "/admin/folders",
        isRead: false,
      });
    } catch (err) {
      console.error("Notification fail", err);
    }

    res.json({ message: "Exam folder and all associated sets, questions, and results deleted successfully" });
  } catch (error) {
    console.error("Folder deletion error:", error);
    res.status(500).json({ message: "Error deleting folder" });
  }
});

export default router;
