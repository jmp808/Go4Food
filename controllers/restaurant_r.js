const express = require("express");
const {
  getLogin,
  getSingup,
  postSignup,
  postLogin,
  logout,
  dashboard,
  createMenu,
} = require("../controllers/restaurant");
const is_restaurant_auth = require("../middleware/is_restaurant_auth");
const router = express.Router();

router.get("/login", getLogin);
router.get("/signup", getSingup);
router.post("/signup", postSignup);
router.post("/login", postLogin);
router.post("/logout", logout);

// dashboard
router.get("/dashboard", is_restaurant_auth, dashboard);
router.get("/createmenu", createMenu);

module.exports = router;
