const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const morgan = require("morgan");
const app = express();


//for swagger documentation
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));


//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "*" }));
app.use(cookieParser());

//morgan logger
app.use(morgan("tiny"));

//import all routes
const user = require("./routes/auth.route");
const collection = require("./routes/collection.route");
const product = require("./routes/product.route");
const coupon = require("./routes/coupon.route");
const order = require("./routes/order.route");

//router middleware
app.use("/api/v1/auth", user);
app.use("/api/v1", collection);
app.use("/api/v1", product);
app.use("/api/v1", coupon);
app.use("/api/v1", order);

module.exports=  app;
