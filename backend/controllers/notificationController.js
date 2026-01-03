import Notification from '../models/Notification.js';

// GET all notifications
export const getNotifications = async (req, res) => {
  try {
    console.log("[DEBUG] Fetching notifications for Admin..."); 
    
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(50);
      
    console.log(`[DEBUG] Found ${notifications.length} notifications.`);

    res.json(notifications);
  } catch (error) {
    console.error("[ERROR] Fetch failed:", error);
    res.status(500).json({ message: "Error fetching notifications" });
  }
};

// MARK AS READ
export const markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true });
  } catch (error) {
    console.error("[ERROR] Mark Read failed:", error);
    res.status(500).json({ message: "Error updating notification" });
  }
};

// DELETE Notification (This was missing causing your crash)
export const deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error("[ERROR] Delete failed:", error);
    res.status(500).json({ message: "Error deleting notification" });
  }
};