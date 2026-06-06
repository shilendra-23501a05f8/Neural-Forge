const mongoose = require("mongoose")

const BlackListSchema = new mongoose.Schema({
    token:{
        type:String,
        required : true,
        unique : true
    }
},{timestamps:true})


BlackListSchema.index({createdAt:1},{expire :60*60*24*3})

const BlackListModel = mongoose.model('BlackListToken',BlackListSchema); 

 module.exports = BlackListModel