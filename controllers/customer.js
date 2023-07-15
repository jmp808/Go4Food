const Customer = require("../models/customer");
const Cart = require("../models/cart");
const Menu = require("../models/menu");
const bcrypt = require("bcrypt");

exports.login = (req, res, next) => {
  res.render("customer/signin", {
    msg: null,
  });
};

exports.signup = (req, res, next) => {
  res.render("customer/signup", {
    msg: null,
  });
};

exports.postSignup = async (req, res, next) => {
  const { name, email, cpswd, pswd, address, phone } = req.body;
  if (cpswd !== pswd) {
    return res.render("customer/signup", {
      msg: "Password and confirm password does not match",
    });
  }
  const c = await Customer.findOne({ email: email });
  if (c) {
    return res.render("customer/signup", {
      msg: "Email already exists",
    });
  }

  bcrypt
    .hash(pswd, 12)
    .then((hashedPassword) => {
      const customer = new Customer({
        name,
        email,
        password: hashedPassword,
        address,
        phone,
      });
      return customer.save();
    })
    .then((result) => {
      res.render("customer/signin", {
        msg: "Account created successfully",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postLogin = (req, res, next) => {
  const { email, pswd } = req.body;
  //   return console.log(email, pswd);
  Customer.findOne({ email: email })
    .then((customer) => {
      if (!customer) {
        res.render("customer/signin", {
          msg: "Invalid email or password",
        });
      }
      bcrypt
        .compare(pswd, customer.password)
        .then((doMatch) => {
          if (doMatch) {
            // req.session.isLoggedIn = true;
            req.session.customer = customer;
            return req.session.save((err) => {
              //   console.log(err);
              res.redirect("/dashboard");
            });
          }
          res.render("customer/signin", {
            msg: "Invalid email or password",
          });
        })
        .catch((err) => {
          console.log(err);
          res.render("customer/signin", {
            msg: "Invalid email or password",
          });
        });
    })
    .catch((err) => console.log(err));
};

exports.logout = (req, res, next) => {
  req.session.customer = null;
  res.redirect("/login");
};

exports.getDash = (req, res, next) => {
  res.render("customer/dash", {
    customer: req.session.customer,
  });
};

exports.getCart = async (req, res, next) => {
  const { customer } = req.session;
  const c = await Customer.findById(customer._id);
  if (!c.cart) {
    const cart = new Cart({
      customer: c._id,
      menus: [],
    });
    await cart.save();
    c.cart = cart._id;
    await c.save();
  }
  Cart.findById(c.cart)
    .populate("menus.menu_id")
    .then((cart) => {
      res.render("customer/cart", {
        customer: req.session.customer,
        cart: cart,
      });
    });
};

exports.addToCart = async (req, res, next) => {
  const { menu_id } = req.body;
  const { customer } = req.session;
  const c = await Customer.findById(customer._id);
  if (!c.cart) {
    const cart = new Cart({
      customer: c._id,
      menus: [],
    });
    await cart.save();
    c.cart = cart._id;
    await c.save();
  }
  const cart = await Cart.findById(c.cart);
  const menu = await Menu.findById(menu_id);
  //   find menu in cart.menu and increase quantity
  const index = cart.menus.findIndex((m) => m.menu_id.toString() === menu_id);
  if (index !== -1) {
    cart.menus[index].quantity = cart.menus[index].quantity + 1;
  } else {
    cart.menus.push({
      menu_id: menu_id,
      quantity: 1,
    });
  }

  cart.total = cart.total + 1;
  cart.price = cart.price + menu.price;

  await cart.save();
  res.redirect("/cart");
};

exports.removeFromCart = async (req, res, next) => {
  const { id } = req.body;
  const { customer } = req.session;
  const c = await Customer.findById(customer._id);
  const cart = await Cart.findById(c.cart);
  cart.menu = cart.menu.filter((m) => m.toString() !== id);
  await cart.save();
  res.redirect("/cart");
};

exports.getOrders = async (req, res, next) => {
  const { customer } = req.session;
  const c = await Customer.findById(customer._id).populate("orders");
  res.render("customer/orders", {
    orders: c.orders,
  });
};
