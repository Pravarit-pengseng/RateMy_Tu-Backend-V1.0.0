const User = require("../Models/Users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    //code
    // 1 checkUser
    const {
      studentId,
      username,
      password,
      role,
      gpa,
      faculty,
      major,
      bio,
      avatar,
    } = req.body;
    var user = await User.findOne({ studentId });

    if (user) {
      return res.status(400).send("This student ID already Used!!");
    }

    // 2 Encrypt
    const salt = await bcrypt.genSalt(10);
    user = new User({
      studentId,
      username,
      password,
    });

    user.password = await bcrypt.hash(password, salt);
    // 3 save
    await user.save();
    res.status(201).send("Register success!!");

    // res.send(req.body);
  } catch (err) {
    console.log(err);
    res.status(500).send("Sever error!!");
  }
};

exports.login = async (req, res) => {
  try {
    //code
    //1 check user
    const { studentId, password } = req.body;
    var user = await User.findOneAndUpdate({ studentId }, { new: true });
    console.log(user);
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        // return res.json({ status: "Password  invalid!!" }).status(400);
        return res.status(400).send("Password  invalid!!");
      }

      //2 Payload
      var payload = {
        user: {
          studentId: user.studentId,
          username: user.username,
          role: user.role,
          gpa:user.gpa,
          faculty:user.faculty,
          major:user.major,
          bio:user.bio,
          profileImg:user.profileImg
        },
      };
      // console.log("This is payload :", payload);

      //3generate token
      jwt.sign(payload, "jwtsecret", { expiresIn: "1d" }, (err, token) => {
        if (err) throw err;

        res.json({ token, payload });
        // res.json({ status: "Login success!!", token, payload });
      });
    } else {
      // return res.json({ status: "StudentID not found!!" }).status(400);
      return res.status(400).send("Student ID not found!!");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Sever error!!");
  }
};

exports.currentUser = async (req, res, next) => {
  try {
    //code
    // console.log("currentUser", req.user);
    const user = await User.findOne({ studentId: req.user.studentId })
      .select("-password")
      .exec();
    console.log("currentUser", req.user);
    // res.send(req.user)
    next();
    res.send(user);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error.");
  }
};
