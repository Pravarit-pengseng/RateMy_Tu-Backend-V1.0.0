const express = require("express")
const router = express.Router()
const { currentUser } = require('../Controllers/auth')
const { auth } = require("../Middleware/auth");
const{updateProfileImg,removeProfileImg} = require("../Controllers/profile")
const{upload} = require("../Middleware/upload")


router.put('/updateProfile/:id',auth,currentUser,upload,updateProfileImg)
router.delete('/deleteProfile/:id',auth,currentUser,removeProfileImg)

module.exports = router