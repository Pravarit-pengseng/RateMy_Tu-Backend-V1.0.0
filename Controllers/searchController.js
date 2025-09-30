const Course = require("../Models/Course");
const SearchHistory = require("../Models/SearchHistory");

// ###############################  Get  search history #########################
exports.getSearchHistory = async (req, res) => {
  try {
    const history = await SearchHistory.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .select("searchTerm createdAt");

    res.json(history);
  } catch (error) {
    console.error("Get search history error:", error);
    res.status(500).json({
      error: "Failed to fetch search history",
      message: error.message,
    });
  }
};

//########################## ฟังก์ชันค้นหาอย่างเดียว #########################
exports.searchCourses = async (req, res) => {
  try {
    const query = req.query.q || req.body.searchTerm || "";

    let results = await Course.find({
      $or: [
        { courseCode: { $regex: query, $options: "i" } },
        { name: { $regex: query, $options: "i" } },
        { teacher: { $regex: query, $options: "i" } },
      ],
    }).limit(5);



    // normalize popularity
    const maxPopularity = await Course.findOne().sort({ popularity: -1 });

    if (maxPopularity && maxPopularity.popularity > 10) {
      await Course.updateMany({ popularity: { $gt: 0 } }, [
        {
          $set: {
            popularity: { $round: [{ $divide: ["$popularity", 10] }, 2] },
          },
        },
      ]);
    }

    res.json(results);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).send("Server Error");
  }
};

//######################################### ฟังก์ชันบันทึกประวัติ ##########################
exports.saveSearchHistory = async (req, res) => {
  try {
    const { searchTerm } = req.body;
    if (!searchTerm) {
      return res.status(400).json({ error: "searchTerm is required" });
    }

    const existingSearch = await SearchHistory.findOne({
      searchTerm: { $regex: new RegExp(`^${searchTerm}$`, "i") },
    });

    if (existingSearch) {
      existingSearch.createdAt = new Date();
      await existingSearch.save();
    } else {
      await new SearchHistory({ searchTerm }).save();
      console.log(searchTerm);
    }

    // เก็บประวัติแค่ 10 อันล่าสุด
    const total = await SearchHistory.countDocuments();
    if (total > 10) {
      const oldest = await SearchHistory.find()
        .sort({ createdAt: 1 })
        .limit(total - 10);
      await SearchHistory.deleteMany({
        _id: { $in: oldest.map((e) => e._id) },
      });
    }

    res.json({ message: "Search history saved successfully" });
  } catch (err) {
    console.error("Save search history error:", err);
    res.status(500).json({ error: "Failed to save search history" });
  }
};

// ####################################### Delete search history item ###############################
exports.deleteSearchHistory = async (req, res) => {
  try {
    const { historyId } = req.params;
    await SearchHistory.findOneAndDelete({
      _id: historyId,
    });

    res.json({ message: "Search history item deleted successfully" });
  } catch (error) {
    console.error("Delete search history error:", error);
    res.status(500).json({
      error: "Failed to delete search history",
      message: error.message,
    });
  }
};

// ###################################### get popular searches #################################
exports.getPopularSearches = async (req, res) => {
  try {
    const results = await Course.find()
      .sort({ popularity: -1 })
      .limit(5);

    res.json(results);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ###################################### increase popularity when user clicks #################################
exports.increasePopularity = async (req, res) => {
  try {
    const { courseId } = req.params;

    await Course.findByIdAndUpdate(courseId, {
      $inc: { popularity: 1 },
    });

    res.json({ message: "Popularity increased" });
  } catch (error) {
    console.error("Increase popularity error:", error);
    res.status(500).json({ error: "Failed to increase popularity" });
  }
};
