const Customer = require("../models/customer");
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
