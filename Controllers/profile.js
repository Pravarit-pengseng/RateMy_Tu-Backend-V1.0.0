const User = require("../Models/Users");
const bcrypt = require("bcryptjs");
const cloudinary = require("../Config/cloudinary");

// ⭐ Import models ที่ต้อง update username
const ReviewPost = require("../Models/ReviewPost");
const QuestionPost = require("../Models/QuestionPost");
const CommentReview = require("../Models/CommentReview");
const QuestionComment = require("../Models/QuestionComment");

// Helper function to parse boolean strings
const parseBoolean = (value) => {
    return /^(true|1)$/i.test(value?.toString());
}

//============================================
// อัปเดตโปรไฟล์ (รวม Cloudinary Upload/Delete)
//============================================
exports.updateProfileImg = async (req, res) => {
  try {
    const id = req.params.id;
    let updateData = { ...req.body };

    // Prevent overwriting studentId
    delete updateData.studentId;

    // Convert Visibility Strings to Booleans
    if (updateData.hasOwnProperty('visibilityGpa')) {
        updateData.visibilityGpa = parseBoolean(updateData.visibilityGpa);
    }
    if (updateData.hasOwnProperty('visibilityFaculty')) {
        updateData.visibilityFaculty = parseBoolean(updateData.visibilityFaculty);
    }
    if (updateData.hasOwnProperty('visibilityMajor')) {
        updateData.visibilityMajor = parseBoolean(updateData.visibilityMajor);
    }

    // ⭐ เช็คว่ามีการเปลี่ยน username หรือไม่
    const currentUser = await User.findById(id);
    const oldUsername = currentUser ? currentUser.username : null;
    const newUsername = updateData.username;
    const isUsernameChanged = oldUsername && newUsername && oldUsername !== newUsername;

    console.log("🔄 [Update Profile] Username change detected:", {
      old: oldUsername,
      new: newUsername,
      changed: isUsernameChanged
    });

    // ตรวจสอบสัญญาณ 'removeProfileImage' จาก FormData
    const shouldRemoveImage = parseBoolean(updateData.removeProfileImage);
    delete updateData.removeProfileImage;

    // Logic การจัดการรูปภาพใหม่
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

    // Handle password update
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

    // Update user in MongoDB
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

    // ⭐⭐⭐ ถ้ามีการเปลี่ยน username -> ต้อง update ทุก posts/comments
    if (isUsernameChanged) {
      console.log("🔄 [Cascading Update] Updating username in all posts/comments...");
      
      try {
        // 1. Update ReviewPosts
        const reviewUpdate = await ReviewPost.updateMany(
          { username: oldUsername },
          { $set: { username: newUsername } }
        );
        console.log(`✅ Updated ${reviewUpdate.modifiedCount} review posts`);

        // 2. Update QuestionPosts
        const questionUpdate = await QuestionPost.updateMany(
          { username: oldUsername },
          { $set: { username: newUsername } }
        );
        console.log(`✅ Updated ${questionUpdate.modifiedCount} question posts`);

        // 3. Update ReviewComments
        const reviewCommentUpdate = await CommentReview.updateMany(
          { username: oldUsername },
          { $set: { username: newUsername } }
        );
        console.log(`✅ Updated ${reviewCommentUpdate.modifiedCount} review comments`);

        // 4. Update QuestionComments
        const questionCommentUpdate = await QuestionComment.updateMany(
          { username: oldUsername },
          { $set: { username: newUsername } }
        );
        console.log(`✅ Updated ${questionCommentUpdate.modifiedCount} question comments`);

        // 5. ⭐ Update like/dislike arrays in ReviewPosts
        const likeUpdate = await ReviewPost.updateMany(
          { 
            $or: [
              { likedBy: oldUsername },
              { dislikedBy: oldUsername }
            ]
          },
          [
            {
              $set: {
                likedBy: {
                  $map: {
                    input: "$likedBy",
                    as: "user",
                    in: { $cond: [{ $eq: ["$$user", oldUsername] }, newUsername, "$$user"] }
                  }
                },
                dislikedBy: {
                  $map: {
                    input: "$dislikedBy",
                    as: "user",
                    in: { $cond: [{ $eq: ["$$user", oldUsername] }, newUsername, "$$user"] }
                  }
                }
              }
            }
          ]
        );
        console.log(`✅ Updated ${likeUpdate.modifiedCount} review reactions`);

        console.log("✅ [Cascading Update] All posts/comments updated successfully!");

      } catch (cascadeError) {
        console.error("❌ [Cascading Update] Error updating posts/comments:", cascadeError);
        // ไม่ throw error เพราะ user profile update สำเร็จแล้ว
        // แค่ log warning
      }
    }

    res.status(200).json(updatedUser);

  } catch (err) {
    console.error("Update profile controller ERROR : ", err);
    res.status(500).json({ 
      message: "Server error", 
      error: err.message, 
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
  }
};

//============================================
// ลบรูปโปรไฟล์
//============================================
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