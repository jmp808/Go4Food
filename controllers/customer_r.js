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
  buyNow,
  paymentBuyNow,
  trackOrder,
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
router.get("/trackorder", is_customer, trackOrder);
router.post("/remove-from-cart", is_customer, removeFromCart);

router.post("/buyNow", is_customer, buyNow);
router.post("/payment", is_customer, paymentBuyNow);

module.exports = router;
