const express = require("express")
const app = express()
const cookieParser = require("cookie-parser");

const userRouter = require("../src/routes/user.routes");


app.use(express.json());
app.use(cookieParser());
require('dotenv').config();


app.use("/api/auth/",userRouter);


module.exports = app;