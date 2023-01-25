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


//router middleware
app.use("/api/v1", user);





// app.get('/', (req, res) => {
//     res.send("Welcome to ecommerse");
// })

module.exports=  app;
