const mongoose = require("mongoose");

const reviewSchema = mongoose({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
  },
  menu: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Menu",
  },
  rating: {
    type: Number,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Review", reviewSchema);
