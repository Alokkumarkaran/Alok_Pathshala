
import mongoose from "mongoose";
const testSchema = new mongoose.Schema({
  title: String,
  duration: Number,
  totalMarks: Number,
  passingMarks: Number,
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref:"Question"}],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref:"User" },
  isActive: { type: Boolean, default:true }
},{ timestamps:true });
export default mongoose.model("Test", testSchema);
