const express = require("express");
const router = express.Router();

const { signUp, test } = require("../controllers/auth.controller")

router.route("/signup").post(signUp);




router.route("/test").get(test);



module.exports = router;