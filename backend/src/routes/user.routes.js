const express = require('express');
const userController = require("../controllers/user.controller");
const authmiddleware = require("../middlewares/auth.middleware")

const router = express.Router();

router.post("/register",userController.userRegisterController);
router.post("/login",userController.userloginController);
router.post("/logout",userController.userLogoutController);
router.get("/get-me",authmiddleware.authUser,userController.getUserController)


module.exports = router