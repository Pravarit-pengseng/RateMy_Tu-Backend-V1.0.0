const mongoose = require("mongoose");

const courseSchema = mongoose.Schema(
  {
    code: {
      type: String,
      text: true,
    },
    name: {
      type: String,
      text: true,
    },
    teacher: {
      type: String,
      text: true,
    },
    detail: String,
    popularity: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

//search
courseSchema.index({ code: "text", name: "text", teacher: "text" });
courseSchema.index({ popularity: -1 });
module.exports = mongoose.model("Course", courseSchema);
