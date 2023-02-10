const express = require("express");
const router = express.Router();

const { createCoupon, deactivateCoupon, deleteCoupon, getAllCoupons } = require("../controllers/coupon.controller");
const { isLoggedIn, customRole } = require("../middlewares/auth.middleware");
const { ADMIN } = require("../utils/authRoles");

router.route("/coupon")
.post(isLoggedIn, customRole(ADMIN), createCoupon )
router
  .route("/coupon/deactive/:couponId")
  .put(isLoggedIn, customRole(ADMIN), deactivateCoupon);
router
  .route("/coupon/:couponId")
  .delete(isLoggedIn, customRole(ADMIN), deleteCoupon);
router
  .route("/coupons")
  .get(isLoggedIn, customRole(ADMIN), getAllCoupons);

module.exports = router;
