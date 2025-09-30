const express = require("express");
const router = express.Router();
const { auth } = require("../Middleware/auth");
const {
  createComment,
  getComments,
  getComment,
  updateComment,
  deleteComment,
} = require("../Controllers/commentReview");

// CRUD for comments
router.post("/reviewComment/:reviewId", auth, createComment);   // Create comment
router.get("/allReviewComment/:reviewId", getComments);           // Get all comments for review
router.get("/getReviewComment/:commentId",auth, getComment);           // Get single comment
router.put("/updateReviewComment/:commentId", auth, updateComment);         // Update comment
router.delete("/deleteReviewComment/:commentId", auth, deleteComment);      // Delete comment

module.exports = router;
