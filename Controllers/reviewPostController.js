const Review = require("../Models/ReviewPost");
const Course = require("../Models/Course");

// Create review
exports.createReview = async (req, res) => {
  try {
    const { courseCode } = req.params;
    const review = new Review({
      ...req.body,
      username: req.user.username,
      courseCode: courseCode,
    });
    const saved = await review.save();
    //  Update avg score after adding review
    await Course.updateAvgScore(saved.courseCode);

    res.status(201).json(saved);
  } catch (err) {
    console.error("ERROR:", err);
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
    const updated = await Review.findOneAndUpdate(
      { _id: req.params.postId, user: req.user._id },
      req.body,
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ error: "Review not found or not yours" });

    //  Update avg score after editing review
    await Course.updateAvgScore(updated.courseCode);

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Cannot update review" });
  }
};

// Delete review
exports.deleteReview = async (req, res) => {
  try {
    const removed = await Review.findOneAndDelete({
      _id: req.params.postId,
      user: req.user._id,
    });

    if (!removed)
      return res.status(404).json({ error: "Review not found or not yours" });

    //  Update avg score after deleting review
    await Course.updateAvgScore(removed.courseCode);

    res.json({ message: "Review deleted", removed });
  } catch (err) {
    res.status(500).json({ error: "Cannot delete review" });
  }
};
