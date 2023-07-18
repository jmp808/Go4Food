const Menu = require("../models/menu");
const Restaurant = require("../models/restaurant");

exports.getAllMenus = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1; // Get the page number from query parameters, default to 1 if not provided
  const perPageMenu = await getMenuLimited(page);
  // console.log(perPageMenu);
  // lates by date
  Menu.find()
    .populate("restaurant")
    .then((menus) => {
      res.render("allItems", {
        per_menus: perPageMenu,
        allMenus: menus,
        msg: null,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

// get only 3 menu then next three menu
const getMenuLimited = (rpage) => {
  const page = parseInt(rpage) || 1; // Get the page number from query parameters, default to 1 if not provided
  const perPage = 3; // Number
  const skip = (page - 1) * perPage;
  return Menu.find()
    .populate("restaurant")
    .skip(skip)
    .limit(perPage)
    .then((menus) => {
      return menus;
    })
    .catch((err) => {
      console.log(err);
    });
};
