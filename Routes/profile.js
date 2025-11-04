const express = require("express");
const router = express.Router();
const { currentUser } = require("../Controllers/auth");
const { auth } = require("../Middleware/auth");
const { updateProfileImg, removeProfileImg } = require("../Controllers/profile");
const User = require("../Models/Users")

// 1. ⭐️ (แก้ไข) Import จาก 'multer.js' (ไฟล์ที่ถูกต้อง)
// 2. ⭐️ (แก้ไข) ใช้ Default Import (ไม่ต้องมีวงเล็บปีกกา)
const upload = require("../Middleware/multer");

// 3. ⭐️ (แก้ไข) เรียกใช้ middleware ให้ถูกต้อง
//    ต้องเป็น upload.single('profileImage')
router.put(
  "/updateProfile/:id",
  auth,
  currentUser,
  upload.single("profileImage"), // 👈 'profileImage' ต้องตรงกับที่ Frontend (MyProfile.jsx) ใช้
  updateProfileImg
);

router.get('/profile/:username', async (req, res) => {
  try {
    const { username } = req.params;

    // หา user
    const user = await User.findOne({ username: username })
      .select('username profileImage email createdAt');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // ส่งข้อมูลกลับ
    res.status(200).json({
      success: true,
      username: user.username,
      profileImage: user.profileImage?.url || null, // ⭐ แก้ตรงนี้ - ใช้ .url เพราะ profileImage เป็น object
      email: user.email,
      createdAt: user.createdAt
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.delete("/deleteProfile/:id", auth, currentUser, removeProfileImg);

module.exports = router;