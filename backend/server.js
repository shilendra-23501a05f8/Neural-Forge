const app = require("./index")
const mongoDBConnect = require("../backend/config/db");

mongoDBConnect();
app.listen(3000,() => {
    console.log("Server is running on 3000");
})