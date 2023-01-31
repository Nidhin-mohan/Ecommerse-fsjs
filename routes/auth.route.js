const express = require("express");
const router = express.Router();

const { signUp, login, logout, forgotPassword, resetPassword, getProfile } = require("../controllers/auth.controller")
const { isLoggedIn } = require("../middlewares/auth.middleware")

router.route("/signup").post(signUp);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/password/forgot").post(forgotPassword);
router.route("/password/reset/:resetToken").post(resetPassword);
router.route("/profile").get(isLoggedIn,  getProfile);





// router.route("/test").get(test);



module.exports = router;