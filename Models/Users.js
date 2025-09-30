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
      // unique: true,
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
      default: 0 // always store 2 decimals
    },
    faculty: { type: String,default:"" },
    major: { type: String,default:"" },
    bio: { type: String,default:"" },
    profileImg: { type: String,default:"" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("users", UserSchema);
