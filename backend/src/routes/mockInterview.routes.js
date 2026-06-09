const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const mockInterviewController = require("../controllers/mockInterview.controller");
const { upload } = require("../middlewares/file.middleware");

router.post("/start", authMiddleware.authUser, mockInterviewController.startInterview);
router.post("/:id/answer", authMiddleware.authUser, upload.single("audio"), mockInterviewController.submitAnswer);
router.post("/:id/finish", authMiddleware.authUser, mockInterviewController.finishInterview);
router.get("/history", authMiddleware.authUser, mockInterviewController.getHistory);
router.get("/:id", authMiddleware.authUser, mockInterviewController.getInterviewDetail);

module.exports = router;
