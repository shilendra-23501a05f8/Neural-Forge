const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const jobController = require("../controllers/job.controller");

const router = express.Router();

router.post("/search", authMiddleware.authUser, jobController.retrieveAgenticJobs);

module.exports = router;
