// routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const cloudinary = require('../Config/cloudinary');
const upload = require('../Middleware/multer'); // Middleware ที่เราสร้าง

router.put('/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // ใช้ upload_stream เพื่อส่ง buffer ไปยัง Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'mern-uploads', // ตั้งชื่อโฟลเดอร์ใน Cloudinary
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return res.status(500).json({ message: 'Error uploading file', error: error.message });
        }
        
        // ส่ง URL และ public_id กลับไปให้ client
        res.status(200).json({
          message: 'Upload successful',
          imageUrl: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    // ส่ง buffer (req.file.buffer) เข้าไปใน stream
    uploadStream.end(req.file.buffer);

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;