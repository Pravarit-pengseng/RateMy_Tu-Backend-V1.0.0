const mongoose = require("mongoose");

const questionCommentSchema = new mongoose.Schema(
  {
    questionPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuestionPost",
      required: true,
    }, // FK to QuestionPost
    username: { type: String, text: true }, // FK to User
    commentText: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("QuestionComment", questionCommentSchema);
