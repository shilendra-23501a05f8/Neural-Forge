const express = require("express");
const Router = express.Router();
const { generateQuizHandler, submitQuizHandler, getQuizHistoryHandler } = require("../controllers/quiz.controller");
const authMiddleware = require("../middlewares/auth.middleware");

Router.post("/generate", authMiddleware.authUser, generateQuizHandler);
Router.post("/submit", authMiddleware.authUser, submitQuizHandler);
Router.get("/history", authMiddleware.authUser, getQuizHistoryHandler);

module.exports = Router;
