const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
    },
    restaurants: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
    },

    menus: {
      menu_id: {
        type: Schema.Types.ObjectId,
        ref: "Menu",
      },
      quantity: {
        type: Number,
        default: 0,
      },
    },

    price: {
      type: Number,
      default: 0,
    },
    totalQty: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      default: "pending",
    },
    paymentDetails: {
      cardName: String,
      cardNumber: String,
      expiryDate: String,
      cvc: String,
      billingAddress: String,
      amount: Number,
    },
    shippingDetails: {
      deliveryPerson: {
        type: String,
        default: "Yet to be assigned",
      },
      phone: {
        type: String,
        default: "Yet to be assigned",
      },
      expectedTime: {
        type: String,
        default: "Yet to be assigned",
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
