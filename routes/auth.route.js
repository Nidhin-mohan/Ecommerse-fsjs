const express = require("express");
const router = express.Router();

const { signUp, login, logout, forgotPassword, resetPassword } = require("../controllers/auth.controller")

router.route("/signup").post(signUp);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/password/forgot").post(forgotPassword);
router.route("/password/reset/:resetToken").post(resetPassword);





// router.route("/test").get(test);



module.exports = router;