const asyncHandler = require("../services/asyncHandler");
const CustomError = require("../utils/customError");
const Order = require("../models/order.schema");


/******************************************************
 * @Create_ORDER
 * @route http://localhost:5000/api/order/create
 * @description create order Controller to create new order
 * @parameters products, user, address, phoneNumber, amount
 * @returns  Order Object
 ******************************************************/


exports.createOrder = asyncHandler(async (req, res, next) => {
  const {
    products,
    address,
    phoneNumber,
    amount,
   
  } = req.body;

  if(  !products || !address ||!phoneNumber ||!amount){
   
      throw new CustomError("All fields required", 400);

  }

  const order = await Order.create({
    products,
    address,
    phoneNumber,
    amount,
    user: req.user._id,
  });

  res.status(200).json({
    success: true,
    order,
  });
});


exports.getOneOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order) {
    return next(new CustomError("please check order id", 401));
  }

  res.status(200).json({
    success: true,
    order,
  });
});


exports.getLoggedInOrders = asyncHandler(async (req, res, next) => {
  const order = await Order.find({ user: req.user._id });

  if (!order) {
    return next(new CustomError("please check order id", 401));
  }

  res.status(200).json({
    success: true,
    order,
  });
});


exports.admingetAllOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find();

  res.status(200).json({
    success: true,
    orders,
  });
});

exports.adminUpdateOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (order.status === "DELIVERED") {
    return next(new CustomError("Order is already marked for delivered", 401));
  }

  order.status = req.body.status;

 

  await order.save();

  res.status(200).json({
    success: true,
    order,
  });
});

exports.adminDeleteOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  await order.remove();

  res.status(200).json({
    success: true,
  });
});

