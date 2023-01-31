const express = require("express");
const router = express.Router();

const { isLoggedIn } = require("../middlewares/auth.middleware");
const { createCollection, updateCollection, deleteCollection, getAllCollections } = require("../controllers/collection.controller");


//user routes
router.route("/all").get(getAllCollections);


//admin routes
router.route("/create").post(createCollection);
router.route("/update/:id").put(updateCollection);
router.route("/delete/:id").delete(deleteCollection);



module.exports = router;