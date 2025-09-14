const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    //user data structure
    studentId: String,
    username: String,
    password: {
      type: String,
    },
    role: {
      type: String,
      default: "user",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("user", userSchema);



