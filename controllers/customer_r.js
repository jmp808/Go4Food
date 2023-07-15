const {
  login,
  signup,
  postSignup,
  postLogin,
  getDash,
  logout,
  getCart,
  addToCart,
  getOrders,
  removeFromCart,
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
router.get("/cart", is_customer, getCart);
router.post("/cart", is_customer, addToCart);
router.get("/orders", is_customer, getOrders);
router.post("/remove-from-cart", is_customer, removeFromCart);

module.exports = router;
