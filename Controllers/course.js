const Course = require("../Models/Course");
exports.read = async (req, res) => {
  try {
    const id = req.params.id;
    const course = await Course.findOne({ _id: id }).exec();
    res.send(course);
  } catch (err) {
    console.log(err);
    res.status(500).send("server Error");
  }
};

exports.list = async (req, res) => {
  try {
    const course = await Course.find({}).exec();
    res.send(course);
  } catch (err) {
    console.log(err);
    res.status(500).send("server Error");
  }
};
exports.create = async (req, res) => {
  try {
    console.log(req.body);
    const course = await Course(req.body).save();
    res.send(course);
  } catch (err) {
    console.log(err);
    res.status(500).send("server Error");
  }
};
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const update = await Course
      .findOneAndUpdate({ _id: id }, req.body, { new: true })
      .exec();
    res.send(update);
  } catch (err) {
    console.log(err);
    res.status(500).send("server Error");
  }
};
exports.remove = async (req, res) => {
  try {
    const id = req.params.id;
    const removed = await Course.findOneAndDelete({ _id: id }).exec();
    res.send(removed);
  } catch (err) {
    console.log(err);
    res.status(500).send("server Error");
  }
};

// const handleQuery = async (req, res, query) => {
//   try {
//     let course = await Course.find({ $text: { $search: query } });

//     if (course.length === 0) {
//       course = await Course.find({
//         $or: [
//           { code: { $regex: query, $options: "i" } },
//           { name: { $regex: query, $options: "i" } },
//           { teacher: { $regex: query, $options: "i" } },
//         ],
//       });
//     }

//     res.send(course);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Server Error");
//   }
// };


// //search 
// exports.searchFillters = async (req, res) => {
//   const { query } = req.body;
//   if (query) {
//     console.log("query", query);
//     await handleQuery(req, res, query);
//   }
// };
