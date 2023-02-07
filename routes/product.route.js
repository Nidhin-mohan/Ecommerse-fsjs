const express = require("express");
const router = express.Router();

const { isLoggedIn, customRole } = require("../middlewares/auth.middleware");
const { addProduct, getAllProducts, getProductById, addReview, deleteReview, adminDeleteOneProduct, adminUpdateProduct } = require("../controllers/product.controller");
const { ADMIN } = require("../utils/authRoles");

//user routes
router.route("/products").get(getAllProducts);
router.route("/product/:id").get(getProductById);
router
  .route("/product/review/:productId")
  .put(isLoggedIn, addReview)
  .delete(isLoggedIn, deleteReview);
 


//admin routes
router.route("/admin/product").post(isLoggedIn, customRole(ADMIN), addProduct);
router
  .route("/admin/product/:id")
  .put(isLoggedIn, customRole(ADMIN), adminUpdateProduct)
  .delete(isLoggedIn, customRole(ADMIN), adminDeleteOneProduct);



module.exports = router;