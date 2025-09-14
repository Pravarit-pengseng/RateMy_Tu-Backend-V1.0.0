const express = require("express");
const router = express.Router();
const { read, list, create, update, remove } = require("../Controllers/course");

const { currentUser } = require("../Controllers/auth");

//middleware
const { auth, adminCheck } = require("../Middleware/auth");

router.get("/course", list); 
//one course
router.get("/course/:id", read);
router.post("/course", auth,adminCheck,currentUser, create);
router.put("/course/:id", auth,adminCheck,currentUser, update);
router.delete("/course/:id", auth,adminCheck,currentUser, remove);

module.exports = router;
