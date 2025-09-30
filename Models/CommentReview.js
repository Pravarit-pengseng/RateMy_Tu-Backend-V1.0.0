const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    review_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReviewPost",
      required: true,
    },
    username: {
      type: mongoose.Schema.Types.String,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("reviewComment", commentSchema);