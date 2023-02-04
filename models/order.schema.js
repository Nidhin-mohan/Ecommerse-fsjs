const mongoose = require("mongoose");
const OrderStatus = require("../utils/orderStatus");


const orderSchema = new mongoose.Schema(
  {
    products: {
      type: [
        {
          productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
          },
          count: Number,
          price: Number,
        },
      ],
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    coupon: String,
    transactionId: String,
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: "ORDERED",
    },
    //paymentMode: UPI, creditcard or wallet, COD can be added
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
