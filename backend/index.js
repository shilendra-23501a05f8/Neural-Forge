require('dotenv').config(); // Antigravity: Load environment variables first to ensure API keys are populated
const express = require("express")
const app = express()
const cookieParser = require("cookie-parser");

const userRouter = require("./src/routes/user.routes");
const interviewRouter = require("./src/routes/interview.routes");

app.use(express.json());
app.use(cookieParser());



app.use("/api/auth/",userRouter);
app.use("/api/interview/",interviewRouter);


module.exports = app;