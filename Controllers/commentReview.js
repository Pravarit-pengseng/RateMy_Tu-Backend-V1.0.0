const Comment = require("../Models/CommentReview");

//  Create comment
exports.createComment = async (req, res) => {
  try {
    const comment = new Comment({
      review_id: req.params.reviewId,
      username: req.user.username,
      studentId: req.user.studentId, // ⭐ เพิ่ม studentId
      text: req.body.text,
    });
    const saved = await comment.save();
    res.status(201).json({
      Message: "Created comment successfully!",
      saved: saved
    });
  } catch (err) {
    console.error("Create comment error:", err);
    res.status(500).json({ error: "Cannot create comment" });
  }
};

//  Get all comments for a review
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ review_id: req.params.reviewId })
      .sort({ createdAt: -1 });
    res.json({
      Message: "Get all of the comment.",
      comments: comments
    });
  } catch (err) {
    res.status(500).json({ error: "Cannot fetch comments" });
  }
};

//  Get single comment
exports.getComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    res.json({ Message: "Get one comment", comment });
  } catch (err) {
    res.status(500).json({ error: "Cannot fetch comment" });
  }
};

//  Update comment
exports.updateComment = async (req, res) => {
  try {
    const currentUser = req.user;
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    // ⭐ เช็คด้วย studentId แทน user._id
    const isOwner = comment.studentId === currentUser.studentId;
    const isAdmin = currentUser.role === 'admin' || currentUser.isAdmin === true;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        error: "You don't have permission to update this comment"
      });
    }

    const updated = await Comment.findByIdAndUpdate(
      req.params.commentId,
      { text: req.body.text },
      { new: true }
    );

    res.json({ Message: "Updated the comment successfully!", updated });
  } catch (err) {
    console.error("Update comment error:", err);
    res.status(500).json({ error: "Cannot update comment" });
  }
};

// Delete comment
exports.deleteComment = async (req, res) => {
  try {
    const currentUser = req.user;
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    // ⭐ เช็คด้วย studentId แทน user._id
    const isOwner = comment.studentId === currentUser.studentId;
    const isAdmin = currentUser.role === 'admin' || currentUser.isAdmin === true;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        error: "You don't have permission to delete this comment"
      });
    }

    await Comment.findByIdAndDelete(req.params.commentId);

    res.json({ Message: "Comment has been deleted!" });
  } catch (err) {
    console.error("Delete comment error:", err);
    res.status(500).json({ error: "Cannot delete comment" });
  }
};