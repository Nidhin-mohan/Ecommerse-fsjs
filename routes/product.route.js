const express = require("express");
const router = express.Router();

const { isLoggedIn, customRole } = require("../middlewares/auth.middleware");
const { addProduct, getAllProducts, getProductById } = require("../controllers/product.controller");
const { ADMIN } = require("../utils/authRoles");

//user routes
router.route("/products").get(getAllProducts);
router.route("/product/:id").get(getProductById);


//admin routes
router.route("/product").post(isLoggedIn, customRole(ADMIN), addProduct);



module.exports = router;