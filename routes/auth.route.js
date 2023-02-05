const express = require("express");
const router = express.Router();

const { signUp, login, logout, forgotPassword, resetPassword, getProfile, adminAllUser, admingetOneUser, adminUpdateOneUserDetails, adminDeleteOneUser } = require("../controllers/auth.controller")
const { isLoggedIn, customRole } = require("../middlewares/auth.middleware");
const { ADMIN } = require("../utils/authRoles");

router.route("/signup").post(signUp);
router.route("/login").post(login);
router.route("/logout").get(isLoggedIn, logout);
router.route("/password/forgot").post(forgotPassword);
router.route("/password/:resetToken").post(resetPassword);
router.route("/profile").get(isLoggedIn,  getProfile);

//admin routes

router.route("/admin/users").get(isLoggedIn, customRole(ADMIN), adminAllUser);
router
  .route("/admin/users/:id")
  .get(isLoggedIn, customRole(ADMIN), admingetOneUser)
  .put(isLoggedIn, customRole(ADMIN), adminUpdateOneUserDetails)
  .delete(isLoggedIn, customRole(ADMIN), adminDeleteOneUser);
  


module.exports = router;