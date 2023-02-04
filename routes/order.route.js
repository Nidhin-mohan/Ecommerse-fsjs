const express = require("express");
const router = express.Router();

const {} = require("../controllers/coupon.controller");
const { createOrder, getOneOrder, getLoggedInOrders, adminDeleteOrder, adminUpdateOrder, admingetAllOrders } = require("../controllers/order.controller");
const { isLoggedIn, customRole } = require("../middlewares/auth.middleware");
const { ADMIN } = require("../utils/authRoles");


router.route("/order/create").post(isLoggedIn, createOrder);
router.route("/order/:id").get(isLoggedIn, getOneOrder);
router.route("/myorder").get(isLoggedIn, getLoggedInOrders);

//admin routes
router
  .route("/admin/orders")
  .get(isLoggedIn, customRole(ADMIN), admingetAllOrders);
router
  .route("/admin/order/:id")
  .put(isLoggedIn, customRole(ADMIN), adminUpdateOrder)
  .delete(isLoggedIn, customRole(ADMIN), adminDeleteOrder);


module.exports = router;
