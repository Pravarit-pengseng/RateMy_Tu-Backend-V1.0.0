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

// CRUD for reviews
router.post("/postreview/:courseCode", auth, createReview); // add review
router.get("/allpostreview/:courseCode", getCourseReviews); // all reviews for course
router.get("/getpostreview/:postId", auth, getReview); // single review
router.put("/editpost/:postId", auth, updateReview); // update
router.delete("/deletepost/:postId", auth, deleteReview); // delete

module.exports = router;
