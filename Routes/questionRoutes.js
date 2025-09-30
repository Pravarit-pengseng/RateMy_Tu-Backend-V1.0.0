const express = require("express");
const router = express.Router();
const {
  createQuestion,
  getCourseQuestions,
  getQuestion,
  updateQuestion,
  deleteQuestion,
} = require("../Controllers/questionController");
const {auth} = require("../Middleware/auth");

// Questions
router.post("/question/:courseCode", auth, createQuestion); // Create
router.get("/allQuestions/:courseCode", getCourseQuestions); // Read all by course
router.get("/getQuestion/:id", getQuestion); // Read one
router.put("/updateQuestion/:id", auth, updateQuestion); // Update
router.delete("/deleteQuestion/:id", auth, deleteQuestion); // Delete

module.exports = router;
