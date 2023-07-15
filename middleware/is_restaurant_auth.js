module.exports = (req, res, next) => {
  if (!req.session.restaurant) {
    return res.redirect("/restaurant/login");
  }
  next();
};
