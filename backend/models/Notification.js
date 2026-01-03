import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  type: { 
    type: String, 
    required: true,
    enum: ['test', 'student', 'result', 'system'] 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String, default: '#' }, 
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Notification', NotificationSchema);