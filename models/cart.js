const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cartSchema = new Schema({
  customer: {
    type: Schema.Types.ObjectId,
    ref: "Customer",
  },
  menu: [
    {
      type: Schema.Types.ObjectId,
      ref: "Menu",
    },
  ],
  quantity: Number,
  price: Number,
  total: Number,
});

module.exports = mongoose.model("Cart", cartSchema);
