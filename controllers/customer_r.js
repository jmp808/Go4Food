const {
  login,
  signup,
  postSignup,
  postLogin,
  getDash,
  logout,
} = require("./customer");
const express = require("express");
const is_customer = require("../middleware/is_customer");

const router = express.Router();

router.get("/login", login);
router.get("/signup", signup);
router.post("/signup", postSignup);
router.post("/login", postLogin);
router.post("/logout", logout);

router.get("/dashboard", is_customer, getDash);

module.exports = router;
