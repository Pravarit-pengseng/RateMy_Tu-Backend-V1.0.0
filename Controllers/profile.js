// const User = require("../Models/Users");
// const fs = require("fs");
// const bcrypt = require("bcryptjs");

// // Update profile image + user info (with password hashing)
// exports.updateProfileImg = async (req, res) => {
//   try {
//     const id = req.params.id;
//     let updateData = { ...req.body };

//     // Prevent overwriting studentId
//     delete updateData.studentId;

//     // Handle profile image (if uploaded)
//     if (req.file) {
//       updateData.profileImg = `/uploads/${req.file.filename}`;
//     }

//     // Handle password (if provided in body)
//     if (updateData.password) {
//       const salt = await bcrypt.genSalt(10);
//       updateData.password = await bcrypt.hash(updateData.password, salt);
//     }

//     const updatedUser = await User.findByIdAndUpdate(
//       id,
//       { $set: updateData },
//       { new: true }
//     ).select("-password"); // don’t send password back

//     if (!updatedUser) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.json({ message: "Profile updated successfully", user: updatedUser });
//   } catch (err) {
//     console.error("ERROR : ", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// exports.removeProfileImg = async (req, res) => {
//   try {
//     const id = req.params.id;

//     // find the user first
//     const user = await User.findById(id).exec();
//     if (!user) {
//       return res.status(404).send("User not found");
//     }
//     console.log("USER IMAG" + user.profileImg);
//     // check if user has profileImg
//     if (user.profileImg) {
//       const filePath = "." + user.profileImg;
//       console.log("File Path :" + filePath);
//       // delete file from disk
//       fs.unlink(filePath, (err) => {
//         if (err) {
//           console.error("ERROR deleting file:", err);
//         } else {
//           console.log("File removed successfully!");
//         }
//       });

//       // update DB -> set profileImg back to ""
//       user.profileImg = "";
//       await user.save();
//     }

//     res.json({ message: "Profile image removed", user });
//   } catch (err) {
//     console.error("ERROR: " + err);
//     res.status(500).send("Server error");
//   }
// };

const User = require("../Models/Users");
const bcrypt = require("bcryptjs");
const cloudinary = require("../Config/cloudinary");

// Helper function to parse boolean strings
const parseBoolean = (value) => {
    // Returns true for 'true', '1', true. Returns false otherwise.
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

    // ⭐️ 1. ตรวจสอบสัญญาณ 'removeProfileImage' จาก FormData
    const shouldRemoveImage = parseBoolean(updateData.removeProfileImage);
    // ลบ key นี้ออกจาก updateData เพื่อไม่ให้บันทึกลง DB โดยไม่จำเป็น
    delete updateData.removeProfileImage;

    // ⭐️ 2. Logic การจัดการรูปภาพใหม่
    if (shouldRemoveImage) {
      // --- กรณีต้องการลบ ---
      const user = await User.findById(id);
      if (user && user.profileImage && user.profileImage.publicId) {
        // รอให้การลบเสร็จสิ้น (Best Practice)
        try {
            await cloudinary.uploader.destroy(user.profileImage.publicId);
             console.log("Cloudinary image deleted:", user.profileImage.publicId);
        } catch (cloudinaryError) {
             console.error("Cloudinary delete error (but continuing):", cloudinaryError);
             // อาจจะ log error แต่ทำงานต่อ เพราะ DB update สำคัญกว่า
        }
      }
      // ตั้งค่า profileImage ให้เป็นค่าว่างใน updateData
      updateData.profileImage = { url: "", publicId: null };
      // ไม่ต้องสนใจ req.file ถ้าส่งมาพร้อมกัน (ลบสำคัญกว่า)

    } else if (req.file) {
      // --- กรณีต้องการอัปโหลด (และไม่ได้สั่งลบ) ---
      const user = await User.findById(id);
      if (user && user.profileImage && user.profileImage.publicId) {
        // ลบรูปเก่า (ไม่ต้องรอ)
        cloudinary.uploader.destroy(user.profileImage.publicId, (err, result) => {
           if (err) console.error("Cloudinary old image delete error:", err);
           else console.log("Cloudinary old image deleted (async):", user.profileImage.publicId);
        });
      }

      // อัปโหลดรูปใหม่
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'profile_images' }, // ตั้งชื่อ folder ให้สื่อความหมาย
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

      // ตั้งค่า profileImage ใหม่ใน updateData
      updateData.profileImage = {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      };
    }
    // --- กรณีไม่มี action (shouldRemoveImage=false และไม่มี req.file) ---
    // ไม่ต้องทำอะไร updateData จะไม่มี key 'profileImage'
    // ทำให้ Mongoose ไม่แก้ไข field นี้ ใช้ค่าเดิมใน DB ต่อไป

    // Handle password update
    if (updateData.hasOwnProperty('password')) { // ตรวจสอบว่ามี key 'password' มาหรือไม่
      if (updateData.password && updateData.password.trim() !== "") { // ตรวจสอบว่าไม่ null/undefined และไม่เป็นสตริงว่าง
          const salt = await bcrypt.genSalt(10);
          updateData.password = await bcrypt.hash(updateData.password, salt);
          console.log("Password updated for user:", id);
      } else {
          // ถ้า password เป็นสตริงว่าง ให้ลบออกจาก updateData เพื่อไม่ให้อัปเดต
          delete updateData.password;
          console.log("Password field was empty, not updating password for user:", id);
      }
    }


    // Update user in MongoDB
     console.log("Attempting to update user:", id, "with data:", updateData);
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true } // เพิ่ม runValidators และ {new: true} สำคัญมาก
    ).select("-password"); // ไม่ส่ง password กลับ

    if (!updatedUser) {
       console.error("User not found during update:", id);
      return res.status(404).json({ message: "User not found" });
    }
     console.log("User updated successfully:", updatedUser._id);

    res.status(200).json(updatedUser); // ส่งข้อมูลที่อัปเดตแล้วกลับไป

  } catch (err) {
    console.error("Update profile controller ERROR : ", err);
    // ส่ง error ที่ละเอียดขึ้นกลับไป (ถ้าอยู่ใน development mode)
    res.status(500).json({ message: "Server error", error: err.message, stack: process.env.NODE_ENV === 'development' ? err.stack : undefined });
  }
};


//============================================
// ลบรูปโปรไฟล์ (Controller นี้ไม่ได้ใช้โดยตรงจากปุ่มลบใน MyProfile แล้ว)
//============================================
exports.removeProfileImg = async (req, res) => {
  // (โค้ดเดิมยังคงอยู่ เผื่อใช้เรียก API โดยตรง)
  try {
    const id = req.params.id;
    const user = await User.findById(id).exec();
    if (!user) { return res.status(404).send("User not found"); }

    if (user.profileImage && user.profileImage.publicId) {
      // ⭐️ เพิ่ม await และ try...catch สำหรับการลบ
      try {
        await cloudinary.uploader.destroy(user.profileImage.publicId);
         console.log("Cloudinary image deleted (direct API):", user.profileImage.publicId);
      } catch (cloudinaryError) {
         console.error("Cloudinary delete error (direct API, but continuing):", cloudinaryError);
         // อาจจะ log error แต่ทำงานต่อ
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

