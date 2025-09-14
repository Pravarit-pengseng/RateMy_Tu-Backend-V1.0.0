const express = require("express");
const router = express.Router();
const {
  getSearchHistory,
  searchCourses,
  saveSearchHistory,
  deleteSearchHistory,
  getPopularSearches,
  increasePopularity,
} = require("../Controllers/searchController");

// Routes
router.get("/history", getSearchHistory);
router.post("/search", searchCourses);
router.post("/history", saveSearchHistory);
router.delete("/history/:historyId", deleteSearchHistory);
router.get("/popular", getPopularSearches);

// route สำหรับเพิ่ม popularity ตอน user click
router.post("/popularity/:courseId", increasePopularity);

module.exports = router;
