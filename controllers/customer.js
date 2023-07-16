const Customer = require("../models/customer");
const Cart = require("../models/cart");
const Menu = require("../models/menu");
const bcrypt = require("bcrypt");
const Order = require("../models/order");
const Restaurant = require("../models/restaurant");

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
    cart.total = cart.total + cart.menus[index].quantity - 1;
  } else {
    cart.total = cart.total + 1;
    cart.menus.push({
      menu_id: menu_id,
      quantity: 1,
    });
  }

  cart.price = cart.price + menu.price;

  await cart.save();
  res.redirect("/cart");
};

exports.removeFromCart = async (req, res, next) => {
  const { id } = req.body;

  const { customer } = req.session;
  const c = await Customer.findById(customer._id);
  const cart = await Cart.findById(c.cart).populate("menus.menu_id");
  const menu_to_remove = cart.menus.find(
    (m) => m.menu_id._id.toString() === id.toString()
  );
  //   return console.log(menu_to_remove);
  cart.total = cart.total - menu_to_remove.quantity;
  cart.price =
    cart.price - menu_to_remove.menu_id.price * menu_to_remove.quantity;

  cart.menus = cart.menus.filter((m) => m.menu_id._id.toString() !== id);

  await cart.save();
  res.redirect("/cart");
};

exports.buyNow = async (req, res, next) => {
  const { customer } = req.session;
  const c = await Customer.findById(customer._id);
  const cart = await Cart.findById(c.cart).populate("menus.menu_id");
  res.render("customer/Payment", {
    customer: req.session.customer,
    type: "multiple",
    menus: cart.menus,
    cart: cart,
    msg: null,
  });
};

exports.buyNowSingle = async (req, res, next) => {
  const menu_id = req.body.menu_id;

  const menu = await Menu.findById(menu_id);
  res.render("customer/Payment", {
    customer: req.session.customer,
    type: "single",
    menu: menu,

    msg: null,
  });
};

exports.paymentBuyNow = async (req, res, next) => {
  const { type } = req.body;

  const { customer } = req.session;
  const c = await Customer.findById(customer._id);
  if (type === "single") {
    const { menu_id } = req.body;
    const menu = await Menu.findById(menu_id);
    const qty = req.body.quantity | 1;
    if (req.body.amount < menu.price) {
      return res.render("customer/Payment", {
        customer: req.session.customer,
        type: type,
        menu: menu,
        msg: "Insufficient balance",
      });
    }
    const menu_array = [];
    menu_array.push({
      menu_id: menu._id,
      quantity: qty,
    });
    const order = new Order({
      customer: c._id,
      restaurants: menu.restaurant,
      menus: menu_array,
      totalQty: req.body.quantity,
      price: menu.price * qty,
      status: "pending",
      paymentDetails: {
        cardName: req.body.cardName,
        cardNumber: req.body.cardNumber,
        expiryDate: req.body.expiryDate,
        cvc: req.body.cvc,
        billingAddress: req.body.billingAddress,
        amount: req.body.amount,
      },
    });
    await order.save();
    c.orders.push(order._id);
    await c.save();
    const restaurant = await Restaurant.findById(menu.restaurant);
    restaurant.orders.push(order._id);
    await restaurant.save();

    res.redirect("/orders");
  } else {
    const cart = await Cart.findById(c.cart).populate("menus.menu_id");
    if (req.body.amount < cart.price) {
      return res.render("customer/Payment", {
        customer: req.session.customer,
        type: type,
        cart: cart,
        menus: cart.menus,
        msg: "Insufficient balance",
      });
    }

    // create multiple order based in menus

    const order = new Order({
      customer: c._id,
      menus: cart.menus,
      totalQty: cart.total,
      price: cart.price,
      status: "pending",
      paymentDetails: {
        cardName: req.body.cardName,
        cardNumber: req.body.cardNumber,
        expiryDate: req.body.expiryDate,
        cvc: req.body.cvc,
        billingAddress: req.body.billingAddress,
        amount: req.body.amount,
      },
    });
    await order.save();
    const restaurants = [];
    const r_strings = [];
    for (let i = 0; i < cart.menus.length; i++) {
      const menu = await Menu.findById(cart.menus[i].menu_id);
      if (r_strings.indexOf(menu.restaurant._id.toString()) === -1) {
        const restaurant = await Restaurant.findById(
          cart.menus[i].menu_id.restaurant
        );
        restaurants.push(restaurant._id);
        restaurant.orders.push(order._id);
        r_strings.push(menu.restaurant._id.toString());
        await restaurant.save();
      }
    }
    order.restaurants = restaurants;

    await order.save();
    c.orders.push(order._id);
    await c.save();
    cart.menus = [];
    cart.total = 0;
    cart.price = 0;
    await cart.save();
    res.redirect("/orders");
  }
};

exports.getOrders = async (req, res, next) => {
  const { customer } = req.session;
  const c = await Customer.findById(customer._id)
    .populate("orders")
    .populate({
      path: "orders",
      populate: {
        path: "menus.menu_id",
        model: "Menu",
      },
    });
  //   return console.log(c.orders);
  res.render("customer/history", {
    orders: c.orders,
    customer: req.session.customer,
  });
};

exports.trackOrder = async (req, res, next) => {
  const { id } = req.params;
  const order = await Order.findById(id)
    .populate("menus.menu_id")
    .populate("restaurants");
  res.render("customer/trackorder", {
    order: order,
    customer: req.session.customer,
  });
};
