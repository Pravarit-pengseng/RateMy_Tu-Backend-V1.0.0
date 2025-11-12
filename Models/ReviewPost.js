const mongoose = require("mongoose");

const reviewPostSubtSchema = new mongoose.Schema(
  {
    courseCode: { type: String, text: true }, // รหัสวิชา
    username: { type: String, text: true }, // ชื่อบัญชีผู้ใช้
    postText: { type: String, text: true },
    section: { type: String, text: true }, // เซค
    semester: { type: String, text: true }, // ภาคเรียน
    academicYear: { type: String, text: true }, // ปีการศึกษา
    grade: { type: String, text: true }, // เกรด

    // คะแนนย่อย
    starRating: { type: Number, min: 1, max: 5 }, // คะแนนรูปแบบดาว
    homeworkScore: { type: Number, min: 1, max: 100, default: 0 },
    interestScore: { type: Number, min: 1, max: 100, default: 0 },
    teachingScore: { type: Number, min: 1, max: 100, default: 0 },
    gradeDistribution: { type: String, default: "" },
    gradecut: { type: String, text: true },

    like: { type: Number, default: 0 }, // จำนวนคนที่ชอบ
    disLike: { type: Number, default: 0 }, // จำนวนคนที่ไม่ชอบ

    // ⭐ เพิ่มใหม่: เก็บ username ของคนที่กด like/dislike
    likedBy: {
      type: [String],
      default: []
    }, // array ของ username ที่กด like
    dislikedBy: {
      type: [String],
      default: []
    }, // array ของ username ที่กด dislike
  },
  { timestamps: true }
);

module.exports = mongoose.model("ReviewPost", reviewPostSubtSchema);