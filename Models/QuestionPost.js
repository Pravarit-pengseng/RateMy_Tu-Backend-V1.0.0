const mongoose = require("mongoose");

const questionPostSchema = new mongoose.Schema(
  {
    courseCode: { type: String, required: true }, // FK to Course
    username: { type: String, text: true }, // FK to User
    questionText: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("QuestionPost", questionPostSchema);
