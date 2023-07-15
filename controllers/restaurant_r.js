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
} = require("./restaurant");
const is_restaurant_auth = require("../middleware/is_restaurant_auth");
const upload = require("../utils/upload");
const router = express.Router();

router.get("/login", getLogin);
router.get("/signup", getSingup);
router.post("/signup", postSignup);
router.post("/login", postLogin);
router.post("/logout", logout);

// dashboard
router.get("/dashboard", is_restaurant_auth, dashboard);
router.get("/createmenu", createMenu);
router.get("/logout", logout);

// dashboard
router.get("/dashboard", is_restaurant_auth, dashboard);
router.get("/create-menu", is_restaurant_auth, createMenu);
router.post(
  "/create-menu",
  upload.array("images", 10),
  is_restaurant_auth,
  postCreateMenu
);
module.exports = router;
