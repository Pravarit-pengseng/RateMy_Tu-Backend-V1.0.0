const QuestionPost = require("../Models/QuestionPost");
const QuestionComment = require("../Models/QuestionComment");

//  Create question
exports.createQuestion = async (req, res) => {
  try {
    const newQuestion = new QuestionPost({
      courseCode: req.params.courseCode,
      username: req.user.username,
      studentId: req.user.studentId, // ⭐ เพิ่ม studentId
      questionText: req.body.questionText,
    });
    const saved = await newQuestion.save();
    res.status(201).json({ message: "Question Created", saved });
  } catch (err) {
    console.error("Create question error:", err);
    res.status(500).json({ error: "Cannot create question" });
  }
};

//  Get all questions for a course
exports.getCourseQuestions = async (req, res) => {
  try {
    const questions = await QuestionPost.find({
      courseCode: req.params.courseCode,
    }).sort({ createdAt: -1 });
    res.json({ message: "Get all questions", questions });
  } catch (err) {
    res.status(500).json({ error: "Cannot fetch questions" });
  }
};

// Get single question
exports.getQuestion = async (req, res) => {
  try {
    const question = await QuestionPost.findById(req.params.id);
    if (!question) return res.status(404).json({ error: "Question not found" });
    res.json({ message: "Get one question", question });
  } catch (err) {
    res.status(500).json({ error: "Cannot fetch question" });
  }
};

//  Update question
exports.updateQuestion = async (req, res) => {
  try {
    const currentUser = req.user;
    const question = await QuestionPost.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    // ⭐ เช็คด้วย studentId แทน username
    const isOwner = question.studentId === currentUser.studentId;
    const isAdmin = currentUser.role === 'admin' || currentUser.isAdmin === true;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        error: "You don't have permission to update this question"
      });
    }

    const updated = await QuestionPost.findByIdAndUpdate(
      req.params.id,
      { questionText: req.body.questionText },
      { new: true }
    );

    res.json({ message: "Question updated", updated });
  } catch (err) {
    console.error("Update question error:", err);
    res.status(500).json({ error: "Cannot update question" });
  }
};

// Delete question
exports.deleteQuestion = async (req, res) => {
  try {
    const questionId = req.params.id;
    const currentUser = req.user;

    const question = await QuestionPost.findById(questionId);

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    // ⭐ เช็คด้วย studentId แทน username
    const isOwner = question.studentId === currentUser.studentId;
    const isAdmin = currentUser.role === 'admin' || currentUser.isAdmin === true;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        error: "You don't have permission to delete this question"
      });
    }

    await QuestionPost.findByIdAndDelete(questionId);

    // ลบ comments ทั้งหมดที่ผูกกับ Question นี้
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