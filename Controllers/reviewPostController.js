const Review = require("../Models/ReviewPost");
const Course = require("../Models/Course");
const Comment = require("../Models/CommentReview");

// Create review
exports.createReview = async (req, res) => {
  try {
    const { courseCode } = req.params;
    const review = new Review({
      ...req.body,
      username: req.user.username,
      studentId: req.user.studentId, // ⭐ เพิ่ม studentId
      courseCode: courseCode,
    });
    const saved = await review.save();
    
    // Update avg score after adding review
    await Course.updateAvgScore(saved.courseCode);

    res.status(201).json(saved);
  } catch (err) {
    console.error("Create review error:", err);
    res.status(500).json({ error: "Cannot create review" });
  }
};

// Read all reviews of a course
exports.getCourseReviews = async (req, res) => {
  try {
    const { courseCode } = req.params;

    const reviews = await Review.find({ courseCode: courseCode })
      .sort({ createdAt: -1 });

    if (!reviews || reviews.length === 0) {
      return res
        .status(404)
        .json({ error: "No reviews found for this course" });
    }

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: "Cannot fetch reviews: " + err });
  }
};

// Read single review
exports.getReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.postId);
    if (!review) return res.status(404).json({ error: "Review not found" });
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: "Cannot fetch review" });
  }
};

// Update review
exports.updateReview = async (req, res) => {
  try {
    const currentUser = req.user;
    const review = await Review.findById(req.params.postId);

    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    // ⭐ เช็คด้วย studentId แทน username
    const isOwner = review.studentId === currentUser.studentId;
    const isAdmin = currentUser.role === 'admin' || currentUser.isAdmin === true;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        error: "You don't have permission to update this review"
      });
    }

    const updated = await Review.findByIdAndUpdate(
      req.params.postId,
      req.body,
      { new: true }
    );

    // Update avg score after editing review
    await Course.updateAvgScore(updated.courseCode);

    res.json(updated);
  } catch (err) {
    console.error("Update review error:", err);
    res.status(500).json({ error: "Cannot update review" });
  }
};

// Delete review
exports.deleteReview = async (req, res) => {
  try {
    const currentUser = req.user;
    const review = await Review.findById(req.params.postId);

    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    // ⭐ เช็คด้วย studentId แทน username
    const isOwner = review.studentId === currentUser.studentId;
    const isAdmin = currentUser.role === 'admin' || currentUser.isAdmin === true;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        error: "You don't have permission to delete this review"
      });
    }

    await Review.findByIdAndDelete(req.params.postId);

    // ลบ comments ทั้งหมดที่ผูกกับ Review นี้
    await Comment.deleteMany({ review_id: review._id });

    // Update avg score after deleting review
    await Course.updateAvgScore(review.courseCode);

    res.json({
      message: "Review deleted",
      deletedBy: isAdmin ? "admin" : "owner"
    });
  } catch (err) {
    console.error("Delete review error:", err);
    res.status(500).json({ error: "Cannot delete review" });
  }
};