const QuestionComment = require("../Models/QuestionComment");

//  Create comment
exports.createComment = async (req, res) => {
  try {
    const newComment = new QuestionComment({
      questionPost: req.params.questionId,
      username: req.user.username,
      commentText: req.body.commentText,
    });
    const saved = await newComment.save();
    res.status(201).json({text:"Created new comment succesful!",saved});
  } catch (err) {
    res.status(500).json({ error: "Cannot create comment" });
  }
};

//  Get all comments for a question
exports.getComments = async (req, res) => {
  try {
    const comments = await QuestionComment.find({ questionPost: req.params.questionId })
    res.json({text:"Get all  comments succesful!",comments});
  } catch (err) {
    res.status(500).json({ error: "Cannot fetch comments" });
  }
};

//  Get single comment
exports.getComment = async (req, res) => {
  try {
    const comment = await QuestionComment.findById(req.params.id)
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    res.json({text:"Get the comment succesful!",comment});
  } catch (err) {
    res.status(500).json({ error: "Cannot fetch comment" });
  }
};

//  Update comment
exports.updateComment = async (req, res) => {
  try {
    const updated = await QuestionComment.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id }, // only owner can edit
      { commentText: req.body.commentText },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Comment not found or not yours" });
    res.json({text:"Updated the comment succesful!",updated});
  } catch (err) {
    res.status(500).json({ error: "Cannot update comment" });
  }
};

//  Delete comment
exports.deleteComment = async (req, res) => {
  try {
    const removed = await QuestionComment.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!removed) return res.status(404).json({ error: "Comment not found or not yours" });
    res.json({ message: "Deleted the comment sucessful!", removed });
  } catch (err) {
    res.status(500).json({ error: "Cannot delete comment" });
  }
};
