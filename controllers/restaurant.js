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
exports.allMenu = async (req, res, next) => {
  const menus = await Menu.find({ restaurant: req.session.restaurant._id });
  res.render("restaurant/allMenu", {
    menus: menus,
    restaurant: req.session.restaurant,
  });
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

exports.orderstatus = async (req, res, next) => {
  const { order_id } = req.params;
  const order = await Order.findById(order_id)
    .populate("customer")
    .populate("menus.menu_id");

  res.render("restaurant/orderStatus", {
    order: order,
    restaurant: req.session.restaurant,
  });
};

exports.postUpdateOrder = async (req, res, next) => {
  const { order_id, status } = req.body;
  // return console.log(order_id, status);
  const order = await Order.findById(order_id);
  order.shippingDetails.orderTracking = status;
  if (status == 5) {
    order.status = "delivered";
  }
  await order.save();
  res.redirect("/restaurant/updateorder/" + order_id);
};
exports.postUpdateOrderDriver = async (req, res, next) => {
  const { order_id, title } = req.body;
  // return console.log(title[0]);
  const o = await Order.findById(order_id);
  o.shippingDetails.deliveryPerson = title[0];
  o.shippingDetails.phone = title[1];
  o.shippingDetails.orderTracking = 3;
  await o.save();
  res.redirect("/restaurant/updateorder/" + order_id);
};

exports.orderNotification = async (req, res, next) => {
  const orders = [];
  const restaurant = await Restaurant.findById(req.session.restaurant._id);
  // return console.log(restaurant);
  for (let i = 0; i < restaurant.orders.length; i++) {
    const menus = [];
    const order = await Order.findOne({
      _id: restaurant.orders[i],
      status: "pending",
    })
      .populate("menus.menu_id")
      .populate("customer");
    if (order == null) continue;
    const menu = await Menu.findById(order.menus.menu_id);

    orders.push({
      order_id: order._id,
      customer: order.customer,

      menu: menu,
      quantity: order.menus.quantity,
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
    // get order whose status is not pending

    const order = await Order.findOne({
      _id: restaurant.orders[i],
      status: { $ne: "pending" },
    });

    if (order == null) continue;

    const menu = await Menu.findById(order.menus.menu_id);

    orders.push({
      order_id: order._id,
      status: order.status,
      price: order.price,
      customer: order.customer,
      menu: menu,
      quantity: order.menus.quantity,
    });
  }
  // return console.log(orders);

  res.render("restaurant/confirmOrders", {
    orders: orders,
  });
};

exports.deleteMenu = async (req, res, next) => {
  const { menu_id } = req.body;
  const menu = await Menu.findById(menu_id);
  const restaurant = await Restaurant.findById(req.session.restaurant._id);
  restaurant.menu.pull(menu_id);
  // delete those images from upload folder
  for (let i = 0; i < menu.images.length; i++) {
    const pathImg = "upload/images/" + menu.images[i];
    if (fs.existsSync(pathImg)) {
      fileHelper.deleteFiles(pathImg);
    }
  }
  // remove order whose menu is deleted

  await Order.findOneAndDelete({ "menus.menu_id": menu_id });
  await restaurant.save();
  await Menu.findByIdAndDelete(menu_id);
  res.redirect("/restaurant/allmenu");
};

exports.getEditMenu = async (req, res, next) => {
  const { menu_id } = req.body;
  const menu = await Menu.findById(menu_id);
  res.render("restaurant/edit-menu", {
    menu: menu,
  });
};

exports.postEditMenu = async (req, res, next) => {
  var { menu_id, title, price, description, t, quantity } = req.body;
  // return console.log(t, req.files);
  const menu = await Menu.findById(menu_id);
  if (t == undefined) {
    t = menu.tags;
  }
  if (quantity == undefined) {
    quantity = menu.quantity;
  }
  var images = menu.images;
  // return console.log(req.files.length);
  if (req.files.length == 0) {
    images = menu.images;
  }
  if (title == undefined) {
    title = menu.title;
  }
  if (price == undefined) {
    price = menu.price;
  }
  if (description == undefined) {
    description = menu.description;
  }

  if (req.files.length > 0) {
    images = req.files.map((f) => f.filename);
    // delete those images from upload folder
    for (let i = 0; i < menu.images.length; i++) {
      const pathImg = "upload/images/" + menu.images[i];
      if (fs.existsSync(pathImg)) {
        fileHelper.deleteFiles(pathImg);
      }
    }
  }

  menu.title = title;
  menu.price = price;
  menu.description = description;
  menu.tags = t;
  menu.quantity = quantity;
  menu.images = images;
  await menu.save();
  res.redirect("/restaurant/allmenu");
};
