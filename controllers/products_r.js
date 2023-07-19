const express = require("express");
const router = express.Router();
const { getAllMenus, getMenu } = require("../controllers/products");

router.get("/", getAllMenus);
router.get("/dish/:id", getMenu);

module.exports = router;
