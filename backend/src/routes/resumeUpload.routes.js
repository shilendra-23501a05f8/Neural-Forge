const express = require("express");
const Router = express.Router();
const { upload } = require("../middlewares/file.middleware");
const { resumeUpload, getUserResumes, deleteUserResume } = require("../controllers/resumeUpload.controller");
const authMiddleware = require("../middlewares/auth.middleware");

Router.post("/", upload.single("resume"), authMiddleware.authUser, resumeUpload);
Router.get("/", authMiddleware.authUser, getUserResumes);
Router.delete("/:id", authMiddleware.authUser, deleteUserResume);

module.exports = Router;