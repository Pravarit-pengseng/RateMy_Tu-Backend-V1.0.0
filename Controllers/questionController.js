const QuestionPost = require("../Models/QuestionPost");
const QuestionComment = require("../Models/QuestionComment")

exports.createQuestion = async (req, res) => {
  try {

    const newQuestion = new QuestionPost({
      courseCode: req.params.courseCode,
      username: req.user.username,
      questionText: req.body.questionText,
    });
    const saved = await newQuestion.save();
    res.status(201).json({ message: "Question Created", saved });
  } catch (err) {
    res.status(500).json({ error: "Cannot create question" });
  }
};


exports.getCourseQuestions = async (req, res) => {
  try {
    const questions = await QuestionPost.find({
      courseCode: req.params.courseCode,
    })
    res.json({ message: "Get all questions ", questions });
  } catch (err) {
    res.status(500).json({ error: "Cannot fetch questions" });
  }
};


exports.getQuestion = async (req, res) => {
  try {
    const question = await QuestionPost.findById(req.params.id)
    if (!question) return res.status(404).json({ error: "Question not found" });
    res.json({ message: "Get one question ", question });
  } catch (err) {
    res.status(500).json({ error: "Cannot fetch question" });
  }
};


exports.updateQuestion = async (req, res) => {
  try {
    const updated = await QuestionPost.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id }, 
      { questionText: req.body.questionText },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ error: "Question not found or not yours" });
    res.json({ message: "Question updated", updated });
  } catch (err) {
    res.status(500).json({ error: "Cannot update question" });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    const questionId = req.params.id;
    const currentUser = req.user;

    const question = await QuestionPost.findById(questionId);

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    const isOwner = question.username === currentUser.username;
    const isAdmin = currentUser.role === 'admin' || currentUser.isAdmin === true;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        error: "You don't have permission to delete this question"
      });
    }


    await QuestionPost.findByIdAndDelete(questionId);

    await QuestionComment.deleteMany({ questionPost: questionId });

    res.json({
      message: "Question deleted successfully",
      deletedBy: isAdmin ? "admin" : "owner"
    });

  } catch (err) {
    console.error("Delete question error:", err);
    res.status(500).json({ error: "Cannot delete question" });
  }
};