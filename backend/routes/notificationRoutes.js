import express from 'express';
import { getNotifications, markAsRead, deleteNotification } from '../controllers/notificationController.js';
// 👇 CHANGE THIS LINE to match your authMiddleware.js exports
import { protect, adminOnly } from '../middleware/authMiddleware.js'; 

const router = express.Router();

// Apply 'protect' (to verify token) AND 'adminOnly' (to verify role)
router.get('/', protect, adminOnly, getNotifications);
router.put('/:id/read', protect, adminOnly, markAsRead);
router.delete('/:id', protect, adminOnly, deleteNotification);

export default router;