const Comment = require("../Models/CommentReview");

//  Create comment
exports.createComment = async (req, res) => {
  try {
    const comment = new Comment({
      review_id: req.params.reviewId,
      username: req.user.username,
      text: req.body.text,
    });
    const saved = await comment.save();
    res
      .status(201)
      .json({ Message: "Created comment succesfuly! ", saved: saved });
  } catch (err) {
    res.status(500).json({ error: "Cannot create comment" });
  }
};

//  Get all comments for a review
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ review_id: req.params.reviewId });
    res.json({ Message: "Get all of the comment.", comments: comments });
  } catch (err) {
    res.status(500).json({ error: "Cannot fetch comments" });
  }
};

//  Get single comment
exports.getComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    res.json({ Message: "Get one comment ", comment });
  } catch (err) {
    res.status(500).json({ error: "Cannot fetch comment" });
  }
};

//  Update comment
exports.updateComment = async (req, res) => {
  try {
    const updated = await Comment.findOneAndUpdate(
      { _id: req.params.commentId, user: req.user._id }, // only owner can edit
      { text: req.body.text },
      { new: true }
    );
    if (!updated)
      return res.status(404).json({ error: "Comment not found or not yours" });
    res.json({ Message: "Updated the comment successfuly!", updated });
  } catch (err) {
    res.status(500).json({ error: "Cannot update comment" });
  }
};

// Delete comment
exports.deleteComment = async (req, res) => {
  try {
    const removed = await Comment.findOneAndDelete({
      _id: req.params.commentId,
      user: req.user._id, // only owner can delete
    });
    if (!removed)
      return res.status(404).json({ error: "Comment not found or not yours" });
    res.json({ Message: "Comment has deleted!", removed });
  } catch (err) {
    res.status(500).json({ error: "Cannot delete comment" });
  }
};
