const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        // ผู้รับ notification
        recipient: {
            type: String,
            required: true,
            index: true, // เพื่อ query เร็ว
        },

        // ผู้ทำ action
        actor: {
            type: String,
            required: true,
        },

        // ประเภทของ notification
        type: {
            type: String,
            required: true,
            enum: [
                "comment",      // มีคนคอมเมนต์โพสต์ของคุณ
                "reply",        // มีคนตอบคอมเมนต์ของคุณ
                "like",         // มีคนกด like โพสต์ของคุณ
                "dislike",      // มีคนกด dislike โพสต์ของคุณ
                "mention",      // มีคน mention คุณ
            ],
        },

        // ข้อความ notification
        message: {
            type: String,
            required: true,
        },

        // Link ไปยังโพสต์/comment
        link: {
            type: String,
            required: true,
        },

        // Reference ไปยัง post/comment (ถ้ามี)
        postId: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: "postType",
        },

        postType: {
            type: String,
            enum: ["ReviewPost", "QuestionPost"],
        },

        commentId: {
            type: mongoose.Schema.Types.ObjectId,
        },

        // สถานะ
        read: {
            type: Boolean,
            default: false,
        },

        // รูปภาพของ actor (cache)
        actorProfileImage: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true // ⭐ แก้แล้ว: ลบ expireAfterSeconds ออก
    }
);

// Index สำหรับ query notifications ของ user
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, read: 1 });

// ⭐ TTL Index - Auto delete after 30 days
notificationSchema.index(
    { createdAt: 1 },
    { expireAfterSeconds: 10 }
);

module.exports = mongoose.model("Notification", notificationSchema);