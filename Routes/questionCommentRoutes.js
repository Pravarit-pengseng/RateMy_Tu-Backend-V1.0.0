const express = require("express");
const router = express.Router();
const {
  createComment,
  getComments,
  getComment,
  updateComment,
  deleteComment,
} = require("../Controllers/questionCommentController");
const { auth } = require("../Middleware/auth");

// Comments
router.post("/questionComment/:questionId", auth, createComment); // Create
router.get("/allQuestionComment/:questionId", getComments); // Read all by question
router.get("/getQuestioncomment/:id", getComment); // Read one
router.put("/updateQuestioncomment/:id", auth, updateComment); // Update
router.delete("/deleteQuestioncomment/:id", auth, deleteComment); // Delete

module.exports = router;
