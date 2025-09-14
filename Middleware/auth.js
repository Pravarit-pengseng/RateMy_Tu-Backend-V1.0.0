const jwt =require('jsonwebtoken')
const User = require('../Models/Users')


exports.auth = async (req,res,next) =>{
    try{
        //code
        const token =req.headers["authtoken"]
        if(!token){
            return res.status(401).send("No token")
        }
        const decode = jwt.verify(token,'jwtsecret')
        req.user = decode.user
        next();
    }catch (err) {
        //err
        console.log(err)
        res.send('Token Invalid').status(500)
    }
}



exports.adminCheck = async(req,res,next)=>{
    try{
        // console.log(req.user.studentId)
        const userAdmin =  await User.findOne({studentId:req.user.studentId})
        .select('-password')
        .exec()
        if (userAdmin.role !== 'admin'){
            res.status(403).send('Admin Access Denied !!! ')
        }else{
            next();
        }


    }catch(err){
        console.log(err)
        res.status(403).send('Admin Access Denied !!! ')
    }
}