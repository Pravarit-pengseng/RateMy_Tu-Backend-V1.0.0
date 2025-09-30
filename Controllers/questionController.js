const QuestionPost = require("../Models/QuestionPost");
// ✅ Create question
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

// ✅ Get all questions for a course
exports.getCourseQuestions = async (req, res) => {
  try {
    const questions = await QuestionPost.find({
      courseCode: req.params.courseCode,
    })
      // .populate("user", "username")
      // .sort({ createdAt: -1 });
    res.json({ message: "Get all questions ", questions });
  } catch (err) {
    res.status(500).json({ error: "Cannot fetch questions" });
  }
};

// ✅ Get single question
exports.getQuestion = async (req, res) => {
  try {
    const question = await QuestionPost.findById(req.params.id)
    // .populate(
    //   "user",
    //   "username"
    // );
    if (!question) return res.status(404).json({ error: "Question not found" });
    res.json({ message: "Get one question ", question });
  } catch (err) {
    res.status(500).json({ error: "Cannot fetch question" });
  }
};

// ✅ Update question
exports.updateQuestion = async (req, res) => {
  try {
    const updated = await QuestionPost.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id }, // only owner can edit
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

// ✅ Delete question
exports.deleteQuestion = async (req, res) => {
  try {
    const removed = await QuestionPost.findOneAndDelete({
      _id: req.params.id,
      username: req.user.username,
    });
    if (!removed)
      return res.status(404).json({ error: "Question not found or not yours" });
    res.json({ message: "Question deleted", removed });
  } catch (err) {
    res.status(500).json({ error: "Cannot delete question" });
  }
};
