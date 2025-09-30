const mongoose = require("mongoose");

const reviewPostSubtSchema = new mongoose.Schema(
  {
    courseCode: { type: String, text: true }, // รหัสวิชา
    username: { type: String, text: true }, // ชื่อบัญชีผู้ใช้
    // teacher: { type: mongoose.Schema.Types.String, ref: "Course"}, // ชื่ออาจารย์
    postText: { type: String, text: true },
    // ratingScore: { type: Number, required: true, min: 1, max: 5 }, // คะแนนรีวิว (หลัก)
    section: { type: String, text: true }, // เซค
    semester: { type: String, text: true }, // ภาคเรียน
    academicYear: { type: String, text: true }, // ปีการศึกษา
    grade: { type: String, text: true }, // เกรด

    // คะแนนย่อย
    starRating: { type: Number, min: 1, max: 5 }, // คะแนนรูปแบบดาว
    homeworkScore: { type: Number, min: 1, max: 100, default :0 }, // คะแนนของงานบ้านการบ้าน
    interestScore: { type: Number, min: 1, max: 100, default :0 }, // คะแนนของความน่าสนใจ
    teachingScore: { type: Number, min: 1, max: 100, default :0 }, // คะแนนการสอนของอาจารย์

    like: { type: Number, default: 0 }, // ชอบ
    disLike: { type: Number, default: 0 }, // ไม่ชอบ
  },
  { timestamps: true }
);

module.exports = mongoose.model("ReviewPost", reviewPostSubtSchema);
