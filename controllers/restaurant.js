const express = require("express");
const { auth } = require("../controllers/restaurant");
const router = express.Router();

router.get("/login", auth);

module.exports = router;
