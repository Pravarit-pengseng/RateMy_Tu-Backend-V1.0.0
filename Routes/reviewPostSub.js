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
// LIKE REVIEW (with notification)
// ======================================
router.post("/review/:reviewId/like", auth, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const username = req.user.username;

    const review = await ReviewPost.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const hasLiked = review.likedBy.includes(username);
    const hasDisliked = review.dislikedBy.includes(username);

    if (hasLiked) {
      // ยกเลิก like
      review.likedBy = review.likedBy.filter(u => u !== username);
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
      review.likedBy.push(username);
      review.like = review.like + 1;

      // สร้าง notification
      await createNotification({
        recipient: review.username,
        actor: username,
        type: "like",
        message: "liked your review",
        link: `/course/${review.courseCode}?postId=${reviewId}`,  // ⭐ เพิ่ม postId
        postId: reviewId,
        postType: "ReviewPost",
      });

      // ยกเลิก dislike (ถ้ามี)
      if (hasDisliked) {
        review.dislikedBy = review.dislikedBy.filter(u => u !== username);
        review.disLike = Math.max(0, review.disLike - 1);

        // ลบ notification dislike
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
// DISLIKE REVIEW (with notification)
// ======================================
router.post("/review/:reviewId/dislike", auth, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const username = req.user.username;

    const review = await ReviewPost.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const hasLiked = review.likedBy.includes(username);
    const hasDisliked = review.dislikedBy.includes(username);

    if (hasDisliked) {
      // ยกเลิก dislike
      review.dislikedBy = review.dislikedBy.filter(u => u !== username);
      review.disLike = Math.max(0, review.disLike - 1);

      // ลบ notification (ถ้าต้องการ)
      await Notification.findOneAndDelete({
        recipient: review.username,
        actor: username,
        type: "dislike",
        postId: reviewId,
      });
    } else {
      // เพิ่ม dislike
      review.dislikedBy.push(username);
      review.disLike = review.disLike + 1;

      // สร้าง notification (optional - คอมเมนต์ออกถ้าไม่ต้องการ notify dislike)
      // await createNotification({
      //   recipient: review.username,
      //   actor: username,
      //   type: "dislike",
      //   message: "disliked your review",
      //   link: `/course/${review.courseCode}`,
      //   postId: reviewId,
      //   postType: "ReviewPost",
      // });

      // ยกเลิก like (ถ้ามี)
      if (hasLiked) {
        review.likedBy = review.likedBy.filter(u => u !== username);
        review.like = Math.max(0, review.like - 1);

        // ลบ notification like
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
// GET USER REACTION
// ======================================
router.get("/review/:reviewId/reaction", auth, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const username = req.user.username;

    const review = await ReviewPost.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // ตรวจสอบว่า user กด like หรือ dislike หรือไม่
    const hasLiked = review.likedBy?.includes(username) || false;
    const hasDisliked = review.dislikedBy?.includes(username) || false;

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
// COMMENT ON REVIEW (with notification)
// ======================================
router.post("/reviewComment", auth, async (req, res) => {
  try {
    const { postId, text } = req.body;
    const username = req.user.username;

    console.log("📝 [Backend] Creating review comment:", { postId, username });

    // ⭐ ใช้ CommentReview model ที่มีอยู่แล้ว
    const CommentReview = require("../Models/CommentReview");
    const comment = new CommentReview({
      review_id: postId,  // ⭐ ใช้ review_id ตาม schema  
      username,
      text,
    });
    await comment.save();
    console.log("✅ [Backend] Comment saved:", comment._id);

    // หา post owner เพื่อส่ง notification
    const post = await ReviewPost.findById(postId);

    if (post) {
      console.log("🔔 [Backend] Creating notification for:", post.username);
      
      await createNotification({
        recipient: post.username,        // เจ้าของโพสต์
        actor: username,                 // คนคอมเมนต์
        type: "comment",
        message: "commented on your review",
        link: `/course/${post.courseCode}?postId=${postId}`,  // ⭐ เพิ่ม postId
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
    console.error("❌ [Backend] Error details:", error.message);
    res.status(500).json({ 
      message: "Server error",
      error: error.message 
    });
  }
});

// ======================================
// COMMENT ON QUESTION (with notification)
// ======================================
router.post("/questionComment", auth, async (req, res) => {
  try {
    const { postId, text } = req.body;
    const username = req.user.username;

    // สร้าง comment
    const QuestionComment = require("../Models/QuestionComment");
    const comment = new QuestionComment({
      questionPost: postId,  // ⭐ แก้ให้ตรงกับ schema
      username,
      commentText: text,     // ⭐ แก้ให้ตรงกับ schema
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
        link: `/course/${post.courseCode}?postId=${postId}`,  // ⭐ เพิ่ม postId
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
    console.error("❌ [Backend] Error details:", error.message);
    res.status(500).json({ 
      message: "Server error",
      error: error.message 
    });
  }
});

// ======================================
// CRUD for reviews
// ======================================
router.post("/postreview/:courseCode", auth, createReview); // add review
router.get("/allpostreview/:courseCode", getCourseReviews); // all reviews for course
router.get("/getpostreview/:postId", auth, getReview); // single review
router.put("/editpost/:postId", auth, updateReview); // update
router.delete("/deletepost/:postId", auth, deleteReview); // delete

module.exports = router;