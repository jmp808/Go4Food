const Menu = require("../models/menu");
const Restaurant = require("../models/restaurant");
const Order = require("../models/order");
exports.getAllMenus = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1; // Get the page number from query parameters, default to 1 if not provided
  const perPageMenu = await getMenuLimited(page);
  // console.log(perPageMenu);
  // lates by date
  Menu.find()
    .populate("restaurant")
    .populate("reviews")

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
const getMenuLimited = () => {
  // based one review rating and number of orders
  // whose number of orders is more
  return Menu.find()

    .populate("restaurant")
    .populate("reviews")

    .then((menus) => {
      return menus;
    });
};

exports.getMenu = async (req, res, next) => {
  const id = req.params.id;

  const num_orders = await Order.find({ "menus.menu_id": id }).then(
    (orders) => {
      return orders.length;
    }
  );
  Menu.findById(id)
    .populate("restaurant")
    .populate("reviews")
    .then((menu) => {
      res.render("DetailDish", {
        menu: menu,
        num_orders: num_orders,
        msg: null,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
