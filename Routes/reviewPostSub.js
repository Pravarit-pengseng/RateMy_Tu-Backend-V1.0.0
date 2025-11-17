const express = require("express");
const router = express.Router();
const { auth } = require("../Middleware/auth");
const {
  createReview,
  getCourseReviews,
  getReview,
  updateReview,
  deleteReview,
} = require("../Controllers/reviewPostController");
const ReviewPost = require("../Models/ReviewPost");
const Notification = require("../Models/Notification");

// ======================================
// HELPER FUNCTION - สร้าง Notification
// ======================================
const createNotification = async (data) => {
  try {
    // ไม่ส่ง notification ให้ตัวเอง
    if (data.recipient === data.actor) {
      return null;
    }

    // ดึงรูป profile ของ actor
    let actorProfileImage = null;
    try {
      const User = require("../Models/User");
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
    console.log("✅ Notification created:", data.type, "for", data.recipient);
    return notification;
  } catch (error) {
    console.error("❌ Create notification error:", error);
    return null;
  }
};

// ======================================
// LIKE REVIEW - ⭐ ใช้ studentId
// ======================================
router.post("/review/:reviewId/like", auth, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const studentId = req.user.studentId; // ⭐ ใช้ studentId
    const username = req.user.username;   // สำหรับ notification

    const review = await ReviewPost.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // ⭐ เช็คด้วย studentId
    const hasLiked = review.likedBy.includes(studentId);
    const hasDisliked = review.dislikedBy.includes(studentId);

    if (hasLiked) {
      // ยกเลิก like
      review.likedBy = review.likedBy.filter(id => id !== studentId);
      review.like = Math.max(0, review.like - 1);

      // ลบ notification
      await Notification.findOneAndDelete({
        recipient: review.username,
        actor: username,
        type: "like",
        postId: reviewId,
      });
    } else {
      // เพิ่ม like
      review.likedBy.push(studentId);
      review.like = review.like + 1;

      // สร้าง notification
      await createNotification({
        recipient: review.username,
        actor: username,
        type: "like",
        message: "liked your review",
        link: `/course/${review.courseCode}?postId=${reviewId}`,
        postId: reviewId,
        postType: "ReviewPost",
      });

      // ยกเลิก dislike (ถ้ามี)
      if (hasDisliked) {
        review.dislikedBy = review.dislikedBy.filter(id => id !== studentId);
        review.disLike = Math.max(0, review.disLike - 1);

        await Notification.findOneAndDelete({
          recipient: review.username,
          actor: username,
          type: "dislike",
          postId: reviewId,
        });
      }
    }

    await review.save();

    res.json({
      success: true,
      like: review.like,
      disLike: review.disLike,
      userReaction: hasLiked ? null : "like",
    });
  } catch (error) {
    console.error("Like error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ======================================
// DISLIKE REVIEW - ⭐ ใช้ studentId
// ======================================
router.post("/review/:reviewId/dislike", auth, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const studentId = req.user.studentId; // ⭐ ใช้ studentId
    const username = req.user.username;

    const review = await ReviewPost.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // ⭐ เช็คด้วย studentId
    const hasLiked = review.likedBy.includes(studentId);
    const hasDisliked = review.dislikedBy.includes(studentId);

    if (hasDisliked) {
      // ยกเลิก dislike
      review.dislikedBy = review.dislikedBy.filter(id => id !== studentId);
      review.disLike = Math.max(0, review.disLike - 1);

      await Notification.findOneAndDelete({
        recipient: review.username,
        actor: username,
        type: "dislike",
        postId: reviewId,
      });
    } else {
      // เพิ่ม dislike
      review.dislikedBy.push(studentId);
      review.disLike = review.disLike + 1;

      // ยกเลิก like (ถ้ามี)
      if (hasLiked) {
        review.likedBy = review.likedBy.filter(id => id !== studentId);
        review.like = Math.max(0, review.like - 1);

        await Notification.findOneAndDelete({
          recipient: review.username,
          actor: username,
          type: "like",
          postId: reviewId,
        });
      }
    }

    await review.save();

    res.json({
      success: true,
      like: review.like,
      disLike: review.disLike,
      userReaction: hasDisliked ? null : "dislike",
    });
  } catch (error) {
    console.error("Dislike error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ======================================
// GET USER REACTION - ⭐ ใช้ studentId
// ======================================
router.get("/review/:reviewId/reaction", auth, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const studentId = req.user.studentId; // ⭐ ใช้ studentId

    const review = await ReviewPost.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // ⭐ เช็คด้วย studentId
    const hasLiked = review.likedBy?.includes(studentId) || false;
    const hasDisliked = review.dislikedBy?.includes(studentId) || false;

    let userReaction = null;
    if (hasLiked) userReaction = "like";
    if (hasDisliked) userReaction = "dislike";

    res.json({
      success: true,
      userReaction,
      like: review.like || 0,
      disLike: review.disLike || 0,
    });
  } catch (error) {
    console.error("Get reaction error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
});

// ======================================
// COMMENT ON REVIEW - ⭐ เพิ่ม studentId
// ======================================
router.post("/reviewComment", auth, async (req, res) => {
  try {
    const { postId, text } = req.body;
    const username = req.user.username;
    const studentId = req.user.studentId; // ⭐ เพิ่ม studentId

    console.log("🔍 [Backend] Creating review comment:", { postId, username, studentId });

    const CommentReview = require("../Models/CommentReview");
    const comment = new CommentReview({
      review_id: postId,
      username,
      studentId, // ⭐ เพิ่ม studentId
      text,
    });
    await comment.save();
    console.log("✅ [Backend] Comment saved:", comment._id);

    // หา post owner เพื่อส่ง notification
    const post = await ReviewPost.findById(postId);

    if (post) {
      console.log("🔔 [Backend] Creating notification for:", post.username);
      
      await createNotification({
        recipient: post.username,
        actor: username,
        type: "comment",
        message: "commented on your review",
        link: `/course/${post.courseCode}?postId=${postId}`,
        postId: postId,
        postType: "ReviewPost",
        commentId: comment._id,
      });
    }

    res.json({
      success: true,
      comment,
    });
  } catch (error) {
    console.error("❌ [Backend] Create comment error:", error);
    res.status(500).json({ 
      message: "Server error",
      error: error.message 
    });
  }
});

// ======================================
// COMMENT ON QUESTION - ⭐ เพิ่ม studentId
// ======================================
router.post("/questionComment", auth, async (req, res) => {
  try {
    const { postId, text } = req.body;
    const username = req.user.username;
    const studentId = req.user.studentId; // ⭐ เพิ่ม studentId

    const QuestionComment = require("../Models/QuestionComment");
    const comment = new QuestionComment({
      questionPost: postId,
      username,
      studentId, // ⭐ เพิ่ม studentId
      commentText: text,
    });
    await comment.save();

    // หา post owner
    const QuestionPost = require("../Models/QuestionPost");
    const post = await QuestionPost.findById(postId);

    if (post) {
      console.log("🔔 [Backend] Creating notification for:", post.username);
      
      await createNotification({
        recipient: post.username,
        actor: username,
        type: "comment",
        message: "commented on your question",
        link: `/course/${post.courseCode}?postId=${postId}`,
        postId: postId,
        postType: "QuestionPost",
        commentId: comment._id,
      });
    }

    res.json({
      success: true,
      comment,
    });
  } catch (error) {
    console.error("❌ [Backend] Create comment error:", error);
    res.status(500).json({ 
      message: "Server error",
      error: error.message 
    });
  }
});

// ======================================
// CRUD for reviews
// ======================================
router.post("/postreview/:courseCode", auth, createReview);
router.get("/allpostreview/:courseCode", getCourseReviews);
router.get("/getpostreview/:postId", auth, getReview);
router.put("/editpost/:postId", auth, updateReview);
router.delete("/deletepost/:postId", auth, deleteReview);

module.exports = router;