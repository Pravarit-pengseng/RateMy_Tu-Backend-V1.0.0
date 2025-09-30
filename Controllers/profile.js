const User = require("../Models/Users");
const fs = require("fs");
const bcrypt = require("bcryptjs");

// Update profile image + user info (with password hashing)
exports.updateProfileImg = async (req, res) => {
  try {
    const id = req.params.id;
    let updateData = { ...req.body };

    // Prevent overwriting studentId
    delete updateData.studentId;

    // Handle profile image (if uploaded)
    if (req.file) {
      updateData.profileImg = `/uploads/${req.file.filename}`;
    }

    // Handle password (if provided in body)
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).select("-password"); // don’t send password back

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (err) {
    console.error("ERROR : ", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.removeProfileImg = async (req, res) => {
  try {
    const id = req.params.id;

    // find the user first
    const user = await User.findById(id).exec();
    if (!user) {
      return res.status(404).send("User not found");
    }
    console.log("USER IMAG" + user.profileImg);
    // check if user has profileImg
    if (user.profileImg) {
      const filePath = "." + user.profileImg;
      console.log("File Path :" + filePath);
      // delete file from disk
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("ERROR deleting file:", err);
        } else {
          console.log("File removed successfully!");
        }
      });

      // update DB -> set profileImg back to ""
      user.profileImg = "";
      await user.save();
    }

    res.json({ message: "Profile image removed", user });
  } catch (err) {
    console.error("ERROR: " + err);
    res.status(500).send("Server error");
  }
};
