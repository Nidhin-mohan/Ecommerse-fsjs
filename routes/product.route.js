const express = require("express");
const router = express.Router();

const { isLoggedIn } = require("../middlewares/auth.middleware");
const { addProduct, getAllProducts, getProductById } = require("../controllers/product.controller")

//user routes
router.route("/all").get(getAllProducts);
router.route("/:id").get(getProductById);


//admin routes
router.route("/add").post(addProduct);



module.exports = router;