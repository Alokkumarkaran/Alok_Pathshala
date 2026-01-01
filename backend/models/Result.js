import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    testId: { type: mongoose.Schema.Types.ObjectId, ref: "Test", required: true },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    wrongAnswers: { type: Number, default: 0 },

    // ✅ ADD THIS FIELD TO FIX THE ERROR
    answers: [
      {
        questionId: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: "Question", // This allows .populate("answers.questionId") to work
          required: true 
        },
        selectedIndex: { 
          type: Number, // Stores the index (0, 1, 2, 3) of the selected option
          required: true 
        }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Result", resultSchema);