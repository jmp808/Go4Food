const Restaurant = require("../models/restaurant");
const bcrypt = require("bcrypt");
const Menu = require("../models/menu");
exports.getLogin = (req, res, next) => {
  res.render("restaurant/signin", {
    msg: null,
  });
};

exports.getSingup = (req, res, next) => {
  res.render("restaurant/signup", {
    msg: null,
  });
};

exports.postSignup = async (req, res, next) => {
  const { name, email, cpswd, pswd, address, phone } = req.body;
  const image = req.file.filename;
  //console.log(name, email, pswd, cpswd, address, phone);
  if (cpswd !== pswd) {
    return res.render("restaurant/signup", {
      msg: "Password and confirm password does not match",
    });
  }
  const r = Restaurant.findOne({ email: email });
  //console.log(r);
  // if (r) {
  //   return res.render("restaurant/signup", {
  //     msg: "Email already exists",
  //   });
  // }

  bcrypt
    .hash(pswd, 12)
    .then((hashedPassword) => {
      const restaurant = new Restaurant({
        name,
        email,
        image,
        password: hashedPassword,
        address,
        phone,
      });
      return restaurant.save();
    })
    .then((result) => {
      res.redirect("/restaurant/login", {
        msg: "Account created successfully",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

// login
exports.postLogin = (req, res, next) => {
  const { email, pswd } = req.body;
  //   return console.log(email, pswd);
  Restaurant.findOne({ email: email })
    .then((restaurant) => {
      if (!restaurant) {
        res.render("restaurant/signin", {
          msg: "Invalid email or password",
        });
      }
      bcrypt
        .compare(pswd, restaurant.password)
        .then((doMatch) => {
          if (doMatch) {
            // req.session.isLoggedIn = true;
            req.session.restaurant = restaurant;
            return req.session.save((err) => {
              //   console.log(err);
              res.redirect("/restaurant/dashboard");
            });
          }
          res.render("restaurant/signin", {
            msg: "Invalid email or password",
          });
        })
        .catch((err) => {
          console.log(err);
          res.render("restaurant/signin", {
            msg: "Invalid email or password",
          });
        });
    })
    .catch((err) => console.log(err));
};

exports.dashboard = (req, res, next) => {
  res.render("restaurant/dashboard", {
    restaurant: req.session.restaurant,
  });
};

exports.logout = (req, res, next) => {
  req.session.restaurant = null;
  res.redirect("/restaurant/login");
};

exports.createMenu = (req, res, next) => {
  res.render("restaurant/createMenu");
};

exports.postCreateMenu = async (req, res, next) => {
  const { title, price, description, t, quantity } = req.body;
  const images = req.files.map((f) => f.filename);
  const restaurant = await Restaurant.findById(req.session.restaurant._id);
  const menu = new Menu({
    title,
    price,
    description,
    images,
    tags: t,
    quantity,
    restaurant: restaurant._id,
  });

  menu
    .save()
    .then((result) => {
      restaurant.menu.push(result._id);
      return restaurant.save();
    })
    .then((result) => {
      res.redirect("/restaurant/dashboard");
    })
    .catch((err) => console.log(err));
};
