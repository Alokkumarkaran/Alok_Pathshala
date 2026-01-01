import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Test",
    required: true,
  },
  question: String,
  options: [
    {
      text: String,
      isCorrect: Boolean,
    },
  ],
});

export default mongoose.model("Question", questionSchema);
