const jwt = require("jsonwebtoken");
const BlackListModel = require("../models/BlackList.model")

async function authUser(req,res,next){

    const token = req.cookies.token
    
    if(!token){
        return res.status(401).json({
            message: "Token not Provided."
        })
    }

    const blackListed = await BlackListModel.findOne({token})

    if(blackListed) {
        return res.status(401).json({
            message : "token is invalid"
        })
    }

    try{
        const decoded = jwt.verify(token,process.env.jwt_secret)
        req.user = decoded
        next()
    }
    catch(err){
        return res.status(401).json({
            message : "Invalid token."
        })
    }
}

module.exports={authUser}