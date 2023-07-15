const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const customerSchema = new Schema({
  name: String,
  email: String,
  password: String,
  address: String,
  phone: String,
  image: String,
  orders: [
    {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },
  ],
});

module.exports = mongoose.model("Customer", customerSchema);
