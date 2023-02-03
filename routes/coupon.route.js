const express = require("express");
const router = express.Router();

const { createCoupon } = require("../controllers/coupon.controller");
const { isLoggedIn, customRole } = require("../middlewares/auth.middleware");
const { ADMIN } = require("../utils/authRoles");

router.route("/coupon").post(isLoggedIn, customRole(ADMIN), createCoupon )

module.exports = router;
