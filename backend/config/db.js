const mongoose = require('mongoose');

  function mongoDBConnect(){
     mongoose.connect(process.env.mongo_uri)
        .then(() =>{
            console.log("MongoDB Connected");
                })
            .catch((err)=>{
                console.log("Connection Failed To DB",err);
                process.exit(1);
            })
}


module.exports = mongoDBConnect;