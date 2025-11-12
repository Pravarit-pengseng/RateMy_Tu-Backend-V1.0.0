const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },
    gpa: {
      type: Number,
      set: (v) => parseFloat(parseFloat(v).toFixed(2)),
      default: 0,
    },
    faculty: { type: String, default: "" },
    major: { type: String, default: "" },
    bio: { type: String, default: "" },
    profileImage: {
      url: {
        type: String,
        default: "", // หรือใส่ URL รูป default ของคุณ
      },
      publicId: {
        type: String,
        default: null,
      },
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    // Visibility fields
    visibilityGpa: { type: Boolean, default: true },
    visibilityFaculty: { type: Boolean, default: true },
    visibilityMajor: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("users", UserSchema);
