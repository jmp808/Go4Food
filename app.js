const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const PORT = process.env.PORT || 3000;
const passportLocalMongoose = require("passport-local-mongoose");
const bodyParser = require("body-parser");

const restaurantRoutes = require("./routes/restaurant");
require("dotenv").config();

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use("/profile", express.static("upload/images"));
// restaurant routes
app.use("/restaurant", restaurantRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
