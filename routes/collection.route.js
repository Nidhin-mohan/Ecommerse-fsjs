const express = require("express");
const router = express.Router();

const { isLoggedIn, customRole } = require("../middlewares/auth.middleware");
const { createCollection, updateCollection, deleteCollection, getAllCollections } = require("../controllers/collection.controller");
const { ADMIN } = require("../utils/authRoles");


//user routes
router.route("/collections").get(isLoggedIn, customRole(ADMIN) ,getAllCollections);


//admin routes
router.route("/collection").post(isLoggedIn, customRole(ADMIN), createCollection);
router.route("/collection/:id")
.put(isLoggedIn, customRole(ADMIN), updateCollection)
.delete(isLoggedIn, customRole(ADMIN), deleteCollection);



module.exports = router;