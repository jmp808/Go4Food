const express = require("express");
const router = express.Router();
const { getAllMenus } = require("../controllers/products");

router.get("/", getAllMenus);

module.exports = router;
