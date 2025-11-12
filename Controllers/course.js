const Course = require("../Models/Course");

exports.read = async (req, res) => {
  try {
    const identifier = req.params.id;
    

    let course = await Course.findOne({ courseCode: identifier }).exec();
    

    if (!course) {
      course = await Course.findOne({ _id: identifier }).exec();
    }
    
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    
    res.send(course);
  } catch (err) {
    console.log("getCourse Error:", err);
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