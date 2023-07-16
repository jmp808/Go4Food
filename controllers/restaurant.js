const Restaurant = require("../models/restaurant");
const bcrypt = require("bcrypt");
const Menu = require("../models/menu");
const fs = require("fs");
const fileHelper = require("../utils/file");
const Order = require("../models/order");

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
    const pathImg = "upload/images/" + image;
    if (fs.existsSync(pathImg)) {
      fileHelper.deleteFiles(pathImg);
    }
    return res.render("restaurant/signup", {
      msg: "Password and confirm password does not match",
    });
  }

  if (await Restaurant.findOne({ email: email })) {
    const pathImg = "upload/images/" + image;

    if (fs.existsSync(pathImg)) {
      fileHelper.deleteFiles(pathImg);
    }
    return res.render("restaurant/signup", {
      msg: "Email already exists",
    });
  }

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
      res.render("restaurant/signin", {
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
exports.orderstatus = (req, res, next) => {
  res.render("restaurant/orderStatus");
};

exports.postCreateMenu = async (req, res, next) => {
  const { title, price, description, t, quantity } = req.body;
  // return console.log(tags, t);
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

exports.orderstatus = (req, res, next) => {
  res.render("restaurant/orderStatus");
};
exports.orderNotification = async (req, res, next) => {
  const orders = [];
  const restaurant = await Restaurant.findById(req.session.restaurant._id);
  // return console.log(restaurant);
  for (let i = 0; i < restaurant.orders.length; i++) {
    const menus = [];
    const order = await Order.findOne({
      _id: restaurant.orders[i]._id,
      status: "pending",
    })
      .populate("menus.menu_id")
      .populate("customer");
    if (order == null) continue;
    for (let j = 0; j < order.menus.length; j++) {
      if (
        order.menus[j].menu_id.restaurant.toString() ==
        restaurant._id.toString()
      ) {
        const menu = await Menu.findById(order.menus[j].menu_id);
        menus.push({
          menu: menu,
          quantity: order.menus[j].quantity,
        });
      }
    }
    orders.push({
      order_id: order._id,
      customer: order.customer,
      menus: menus,
    });
  }
  // return console.log(orders);

  res.render("restaurant/orderNotification", {
    orders: orders,
  });
};

exports.confirmOrder = async (req, res, next) => {
  const { order_id } = req.body;
  const order = await Order.findById(order_id);
  order.status = "confirmed";
  order
    .save()
    .then((result) => {
      res.redirect("/restaurant/ordernotification");
    })
    .catch((err) => console.log(err));
};
exports.cancelOrder = async (req, res, next) => {
  const { order_id } = req.body;

  const order = await Order.findById(order_id);
  order.status = "cancel";
  order
    .save()
    .then((result) => {
      res.redirect("/restaurant/ordernotification");
    })
    .catch((err) => console.log(err));
};
exports.getConfirmOrders = async (req, res, next) => {
  const orders = [];
  const restaurant = await Restaurant.findById(req.session.restaurant._id);
  // return console.log(restaurant);
  for (let i = 0; i < restaurant.orders.length; i++) {
    const menus = [];
    const order = await Order.findOne({
      _id: restaurant.orders[i]._id,
      status: "confirmed",
    })
      .populate("menus.menu_id")
      .populate("customer");

    if (order == null) continue;
    for (let j = 0; j < order.menus.length; j++) {
      if (
        order.menus[j].menu_id.restaurant.toString() ==
        restaurant._id.toString()
      ) {
        const menu = await Menu.findById(order.menus[j].menu_id);
        menus.push({
          menu: menu,
          quantity: order.menus[j].quantity,
        });
      }
    }
    orders.push({
      order_id: order._id,
      price: order.price,
      customer: order.customer,
      menus: menus,
    });
  }
  // return console.log(orders);

  res.render("restaurant/confirmOrders", {
    orders: orders,
  });
};
