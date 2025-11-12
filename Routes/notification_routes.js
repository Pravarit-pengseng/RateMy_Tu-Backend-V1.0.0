const express = require("express");
const router = express.Router();
const { auth } = require("../Middleware/auth");
const Notification = require("../Models/Notification");

// ======================================
// GET USER NOTIFICATIONS
// ======================================
/**
 * @route   GET /api/notifications
 * @desc    Get all notifications for current user
 * @access  Private
 */
router.get("/notifications", auth, async (req, res) => {
    try {
        const username = req.user.username;
        const { limit = 20, page = 1, unreadOnly = false } = req.query;

        // Build query
        const query = { recipient: username };
        if (unreadOnly === "true") {
            query.read = false;
        }

        // Get notifications
        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 }) // ใหม่ไปเก่า
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        // Count unread
        const unreadCount = await Notification.countDocuments({
            recipient: username,
            read: false,
        });

        res.json({
            success: true,
            notifications,
            unreadCount,
            page: parseInt(page),
            limit: parseInt(limit),
        });
    } catch (error) {
        console.error("Get notifications error:", error);
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
});

// ======================================
// MARK NOTIFICATION AS READ
// ======================================
/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.put("/notifications/:id/read", auth, async (req, res) => {
    try {
        const username = req.user.username;
        const { id } = req.params;

        const notification = await Notification.findOne({
            _id: id,
            recipient: username, // ต้องเป็นเจ้าของ notification
        });

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        notification.read = true;
        await notification.save();

        res.json({
            success: true,
            notification,
        });
    } catch (error) {
        console.error("Mark read error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// ======================================
// MARK ALL AS READ
// ======================================
/**
 * @route   PUT /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.put("/notifications/read-all", auth, async (req, res) => {
    try {
        const username = req.user.username;

        await Notification.updateMany(
            { recipient: username, read: false },
            { $set: { read: true } }
        );

        res.json({
            success: true,
            message: "All notifications marked as read",
        });
    } catch (error) {
        console.error("Mark all read error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// ======================================
// DELETE NOTIFICATION
// ======================================
/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete notification
 * @access  Private
 */
router.delete("/notifications/:id", auth, async (req, res) => {
    try {
        const username = req.user.username;
        const { id } = req.params;

        const notification = await Notification.findOneAndDelete({
            _id: id,
            recipient: username,
        });

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        res.json({
            success: true,
            message: "Notification deleted",
        });
    } catch (error) {
        console.error("Delete notification error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// ======================================
// HELPER: CREATE NOTIFICATION
// ======================================
/**
 * สร้าง notification ใหม่
 * @param {Object} data - {recipient, actor, type, message, link, postId, postType, commentId}
 */
const createNotification = async (data) => {
    try {
        // ไม่ส่ง notification ให้ตัวเอง
        if (data.recipient === data.actor) {
            return null;
        }

        // ดึงรูป profile ของ actor (optional)
        let actorProfileImage = null;
        try {
            const User = require("../Models/User"); // ปรับตาม model ของคุณ
            const actorUser = await User.findOne({ username: data.actor });
            if (actorUser?.profileImage?.url) {
                actorProfileImage = actorUser.profileImage.url;
            }
        } catch (err) {
            // Ignore error
        }

        const notification = new Notification({
            ...data,
            actorProfileImage,
        });

        await notification.save();
        return notification;
    } catch (error) {
        console.error("Create notification error:", error);
        return null;
    }
};

// Export helper
router.createNotification = createNotification;

module.exports = router;