const app = require("./index")
const mongoDBConnect = require("../backend/config/db");
const main = require("../backend/src/services/ai.service")

mongoDBConnect();
app.listen(3000,() => {
    console.log("Server is running on 3000");
})