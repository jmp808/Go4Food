const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const menuSchema = new Schema({
  title: String,
  price: Number,
  image: String,
  description: String,
  restaurant: {
    type: Schema.Types.ObjectId,
    ref: "Restaurant",
  },
  quantity: Number,
});

module.exports = mongoose.model("Menu", menuSchema);