const express = require("express");
const {
  getLogin,
  getSingup,
  postSignup,
  postLogin,
  logout,
  dashboard,
  createMenu,
  postCreateMenu,
  orderNotification,
  orderstatus,
  confirmOrder,
  getConfirmOrders,
  cancelOrder,
  allMenu,
} = require("./restaurant");
const is_restaurant_auth = require("../middleware/is_restaurant_auth");
const upload = require("../utils/upload");
const router = express.Router();

router.get("/login", getLogin);
router.get("/signup", getSingup);
router.post("/signup", upload.single("images"), postSignup);
router.post("/login", postLogin);
router.post("/logout", logout);

// dashboard
router.get("/dashboard", is_restaurant_auth, dashboard);
router.get("/createmenu", createMenu);
router.get("/logout", logout);

// dashboard
router.get("/dashboard", is_restaurant_auth, dashboard);
router.get("/updateorder/:id", is_restaurant_auth, orderstatus);
router.get("/ordernotification", is_restaurant_auth, orderNotification);
router.get("/confirmorders", is_restaurant_auth, getConfirmOrders);
router.post("/confirmorder", is_restaurant_auth, confirmOrder);
router.post("/cancelorder", is_restaurant_auth, cancelOrder);
router.get("/create-menu", is_restaurant_auth, createMenu);
router.post(
  "/create-menu",
  upload.array("images", 10),
  is_restaurant_auth,
  postCreateMenu
);
router.get("/allmenu", is_restaurant_auth, allMenu);

module.exports = router;
