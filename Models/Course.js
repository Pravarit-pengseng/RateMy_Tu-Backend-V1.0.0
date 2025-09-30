const mongoose = require("mongoose");
const Review = require("./ReviewPost");
const courseSchema = mongoose.Schema(
  {
    courseCode: {
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
    avgReviewScore: {
      type: Number,
      defualt: 0,
    },
  },
  { timestamps: true }
);

// Method to update avg score after review changes
courseSchema.statics.updateAvgScore = async function (courseCode) {
  const result = await Review.aggregate([
    { $match: { courseCode: courseCode } },  // match courseCode
    {
      $group: {
        _id: "$courseCode",                   // group by courseCode
        avgScore: { $avg: "$starRating" }     // calculate average
      }
    }
  ]);

  const avgScore = result.length > 0 ? result[0].avgScore : 0;

  // update the matching course
  await this.findOneAndUpdate(
    { courseCode: courseCode },         // match by code field in Course
    { avgReviewScore: avgScore }
  );

  console.log("AVGSCORE for", courseCode, ":", avgScore);
};


//search
courseSchema.index({ courseCode: "text", name: "text", teacher: "text" });
courseSchema.index({ popularity: -1 });
module.exports = mongoose.model("Course", courseSchema);
