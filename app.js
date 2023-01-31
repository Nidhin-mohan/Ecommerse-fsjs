const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const morgan = require("morgan");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());

//morgan logger
app.use(morgan("tiny"));

//import all routes
const user = require("./routes/auth.route");
const collection = require("./routes/collection.route");


//router middleware
app.use("/api/v1/auth", user);
app.use("/api/v1/collection", collection);





// app.get('/', (req, res) => {
//     res.send("Welcome to ecommerse");
// })

module.exports=  app;
