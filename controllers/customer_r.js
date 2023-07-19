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
  buyNowSingle,
  trackOrder,
  cancelOrder,
  dishDetails,
  profile,
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

router.post("/buynow", is_customer, buyNow);
router.post("/buynowsingle", is_customer, buyNowSingle);
router.post("/payment", is_customer, paymentBuyNow);

router.get("/trackorder/:id", is_customer, trackOrder);
router.post("/cancelorder", is_customer, cancelOrder);
router.get("/dishdetails", is_customer, dishDetails);

module.exports = router;
