const userModel = require("../models/user.models");
const jwt = require("jsonwebtoken");
const BlackListModel  = require("../models/BlackList.model")


const userRegisterController = async (req,res)=>{
   
    const {email , password , name} = req.body;
    const isExists = await userModel.findOne({
        email:email
    })
    if(isExists){
       return res.status(422).json({
            status :"Failed",
            message : "User Already Exits With this Email"
        })
    }
    const user = await userModel.create({
        email,password,name
    })

   res.status(201).json({
    user:{
        _id : user._id,
        email : user.email,
        name : user.name
    },
   })
} 

const userloginController = async (req, res) => {
    const { email, password } = req.body;

    const user = await userModel
        .findOne({ email })
        .select("+password");

    if (!user) {
        return res.status(401).json({
            status: "Failed",
            message: "No account on this email. Please Register first."
        });
    }

    const validPassword = await user.passwordCompare(password);

    if (!validPassword) {
        return res.status(401).json({
            status: "Failed",
            message: "Invalid Password"
        });
    }
    const token = jwt.sign({userId:user._id},process.env.jwt_secret,{expiresIn :'2h'})
    res.cookie("token",token)

    res.status(200).json({
        user: {
            _id: user._id,
            email: user.email,
            name: user.name
        },
        token
    });
};


const userLogoutController = async (req, res) => {
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
    console.log(token)

    if (!token) {
        return res.status(403).json({
            status: "Failed", 
            message: "Please Login First"
        });
    }
    res.clearCookie("token", {
        httpOnly: true,
        secure: true,
        sameSite: "strict"
    });


    await  BlackListModel.create({
        token
    }) 


    return res.status(200).json({
        status: "Success",
        message: "User Logout Successful" 
    });
};


module.exports = {
    userRegisterController,
    userloginController,
    userLogoutController
}
