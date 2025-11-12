const User = require("../Models/Users");
const bcrypt = require("bcryptjs");
const cloudinary = require("../Config/cloudinary");

const parseBoolean = (value) => {
    return /^(true|1)$/i.test(value?.toString());
}


exports.updateProfileImg = async (req, res) => {
  try {
    const id = req.params.id;
    let updateData = { ...req.body };

    delete updateData.studentId;

    if (updateData.hasOwnProperty('visibilityGpa')) {
        updateData.visibilityGpa = parseBoolean(updateData.visibilityGpa);
    }
    if (updateData.hasOwnProperty('visibilityFaculty')) {
        updateData.visibilityFaculty = parseBoolean(updateData.visibilityFaculty);
    }
    if (updateData.hasOwnProperty('visibilityMajor')) {
        updateData.visibilityMajor = parseBoolean(updateData.visibilityMajor);
    }

    const shouldRemoveImage = parseBoolean(updateData.removeProfileImage);
    delete updateData.removeProfileImage;

    if (shouldRemoveImage) {
      const user = await User.findById(id);
      if (user && user.profileImage && user.profileImage.publicId) {
        try {
            await cloudinary.uploader.destroy(user.profileImage.publicId);
             console.log("Cloudinary image deleted:", user.profileImage.publicId);
        } catch (cloudinaryError) {
             console.error("Cloudinary delete error (but continuing):", cloudinaryError);
        }
      }
      updateData.profileImage = { url: "", publicId: null };

    } else if (req.file) {
      const user = await User.findById(id);
      if (user && user.profileImage && user.profileImage.publicId) {
        cloudinary.uploader.destroy(user.profileImage.publicId, (err, result) => {
           if (err) console.error("Cloudinary old image delete error:", err);
           else console.log("Cloudinary old image deleted (async):", user.profileImage.publicId);
        });
      }


      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'profile_images' },
          (error, result) => {
            if (error) {
                 console.error("Cloudinary upload stream error:", error);
                 return reject(error);
            }
            console.log("Cloudinary upload successful:", result.public_id);
            resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });

      updateData.profileImage = {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      };
    }

    if (updateData.hasOwnProperty('password')) {
      if (updateData.password && updateData.password.trim() !== "") {
          const salt = await bcrypt.genSalt(10);
          updateData.password = await bcrypt.hash(updateData.password, salt);
          console.log("Password updated for user:", id);
      } else {
          delete updateData.password;
          console.log("Password field was empty, not updating password for user:", id);
      }
    }



     console.log("Attempting to update user:", id, "with data:", updateData);
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true } 
    ).select("-password"); 

    if (!updatedUser) {
       console.error("User not found during update:", id);
      return res.status(404).json({ message: "User not found" });
    }
     console.log("User updated successfully:", updatedUser._id);

    res.status(200).json(updatedUser); 

  } catch (err) {
    console.error("Update profile controller ERROR : ", err);
    res.status(500).json({ message: "Server error", error: err.message, stack: process.env.NODE_ENV === 'development' ? err.stack : undefined });
  }
};





exports.removeProfileImg = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id).exec();
    if (!user) { return res.status(404).send("User not found"); }

    if (user.profileImage && user.profileImage.publicId) {
      try {
        await cloudinary.uploader.destroy(user.profileImage.publicId);
         console.log("Cloudinary image deleted (direct API):", user.profileImage.publicId);
      } catch (cloudinaryError) {
         console.error("Cloudinary delete error (direct API, but continuing):", cloudinaryError);
      }

      user.profileImage = { url: "", publicId: null };
      const savedUser = await user.save();
      savedUser.password = undefined;
      res.status(200).json(savedUser);
    } else {
       console.log("No profile image to remove (direct API) for user:", id);
      res.status(400).json({ message: "No profile image to remove." });
    }
  } catch (err) {
    console.error("Remove profile image controller ERROR: " + err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
