const ReviewPost = require("../Models/ReviewPost");
const Course = require("../Models/Course");

// Recalculate avgReviewScore whenever a review is added/updated/deleted
async function updateAvgReview(courseId) {
  try {
    const stats = await ReviewPost.aggregate([
      { $match: { course: courseId } },
      {
        $group: {
          _id: "$course",
          avgReviewScore: { $avg: "$ratingScore" }
        }
      }
    ]);

    const avgScore = stats.length > 0 ? stats[0].avgScore : 0;

    await Course.findByIdAndUpdate(courseId, { avgReviewScore: avgScore });
  } catch (err) {
    console.error("Error updating avgReviewScore:", err);
  }
}

module.exports = { updateAvgReview };
