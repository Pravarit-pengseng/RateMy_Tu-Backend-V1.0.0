const QuestionComment = require("../Models/QuestionComment");

//  Create comment
exports.createComment = async (req, res) => {
  try {
    const newComment = new QuestionComment({
      questionPost: req.params.questionId,
      username: req.user.username,
      studentId: req.user.studentId, // ⭐ เพิ่ม studentId
      commentText: req.body.commentText,
    });
    const saved = await newComment.save();
    res.status(201).json({
      text: "Created new comment successful!",
      saved
    });
  } catch (err) {
    console.error("Create comment error:", err);
    res.status(500).json({ error: "Cannot create comment" });
  }
};

//  Get all comments for a question
exports.getComments = async (req, res) => {
  try {
    const comments = await QuestionComment.find({
      questionPost: req.params.questionId
    }).sort({ createdAt: -1 });
    res.json({
      text: "Get all comments successful!",
      comments
    });
  } catch (err) {
    res.status(500).json({ error: "Cannot fetch comments" });
  }
};

//  Get single comment
exports.getComment = async (req, res) => {
  try {
    const comment = await QuestionComment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    res.json({
      text: "Get the comment successful!",
      comment
    });
  } catch (err) {
    res.status(500).json({ error: "Cannot fetch comment" });
  }
};

//  Update comment
exports.updateComment = async (req, res) => {
  try {
    const currentUser = req.user;
    const comment = await QuestionComment.findById(req.params.id);

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

    const updated = await QuestionComment.findByIdAndUpdate(
      req.params.id,
      { commentText: req.body.commentText },
      { new: true }
    );

    res.json({
      text: "Updated the comment successful!",
      updated
    });
  } catch (err) {
    console.error("Update comment error:", err);
    res.status(500).json({ error: "Cannot update comment" });
  }
};

//  Delete comment
exports.deleteComment = async (req, res) => {
  try {
    const currentUser = req.user;
    const comment = await QuestionComment.findById(req.params.id);

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

    await QuestionComment.findByIdAndDelete(req.params.id);

    res.json({ message: "Deleted the comment successful!" });
  } catch (err) {
    console.error("Delete comment error:", err);
    res.status(500).json({ error: "Cannot delete comment" });
  }
};