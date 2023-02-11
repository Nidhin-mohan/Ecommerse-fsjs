const Product = require("../models/product.schema.js");
const Coupon = require("../models/coupon.schema.js");
const Order = require("../models/order.schema.js");
const asyncHandler = require("../services/asyncHandler.js");
const CustomError = require("../utils/customError.js");
const razorpay = require("../config/razorpay.config.js");


/**********************************************************
 * @GENEARATE_RAZORPAY_ID
 * @route https://localhost:5000/api/order/razorpay
 * @description Controller used for genrating razorpay Id
 * @description Creates a Razorpay Id which is used for placing order
 * @returns Order Object with "Razorpay order id generated successfully"
 *********************************************************/
exports.generateRazorpayOrderId = asyncHandler(async (req, res) => {
  //get product and coupon from frontend
  const { couponcode, orderItems } = req.body;
  let totalAmount = 0;
  let totalPrice = 0;

  // verify product price from backend
  if (!orderItems || orderItems.length === 0) {
    throw new CustomError("Please pass products", 400);
  } else {
    // get total price of all the order items
    for (let i = 0; i < orderItems.length; i++) {
      const product = await Product.findById(orderItems[i].product);
      if (!product) {
        throw new CustomError("Product not found", 400);
      }
      totalPrice += product.price * orderItems[i].quantity;
    }
  }

  // coupon check - DB
  if (couponcode) {
    const couponExist = await Coupon.findOne({
      code: couponcode,
      active: true,
    });
    if (couponExist) {
      const discountPrice = (totalPrice * couponExist.discount) / 100;
      totalAmount = totalPrice - discountPrice;

      // deactivating coupon after it is claimed
      couponExist.active = false;
      await couponExist.save();
    } else {
      throw new CustomError("Invalid coupon code", 400);
    }
  } else {
    totalAmount = totalPrice;
  }

  // finalAmount = totalAmount - discount (if any)
  const options = {
    amount: Math.round(totalAmount * 100), // convert the amount to paise
    currency: "INR",
    receipt: `receipt_${new Date().getTime()}`,
  };

  // create Razorpay order
  const order = await razorpay.orders.create(options);

  // if order creation fails
  if (!order) {
    throw new CustomError("Payment failed", 400);
  }

  // send the order details to the frontend
  res.status(200).json({
    success: true,
    order,
  });
});


/******************************************************
 * @Create_ORDER
 * @route http://localhost:5000/api/order/create
 * @description User can create order Controller to create new order
 * @parameters products, user, shippingAddress, phoneNumber, amount,paymentMethod,isPaid
 * @returns  Order Object
 ******************************************************/


exports.createOrder = asyncHandler(async (req, res, next) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  if (!orderItems || !shippingAddress || !paymentMethod || !totalPrice) {
    throw new CustomError("All fields required", 400);
  }else {
    console.log(orderItems)
    orderItems.forEach(async (item) => {
      console.log("item", item.product)
    
      const product = await Product.findById(item.product);

      if (!product) {
        throw new CustomError("Product not found", 400);
       
      }
      console.log(product)
      product.stock -= item.quantity;
      await product.save()
    })}

  const order = await Order.create({
    orderItems,
    shippingAddress,
    paymentMethod,
    taxPrice,
    shippingPrice,
    totalPrice,
    user: req.user._id,
  });

  res.status(200).json({
    success: true,
    order,
  });
});


/******************************************************
 * @Cancel_ORDER
 * @route http://localhost:5000/api/order/:id
 * @description User can cancel existing order 
 * @parameters orderid
 * @returns  Order Object
 ******************************************************/


exports.cancelOrder = asyncHandler(async (req, res, next) => {

  const {id} = req.params

  

  const order = await Order.findById(id);


     if (order.status === "DELIVERED") {
     return next(new CustomError("Order is already marked for delivered", 401));
   }

   if(order){
     order.status = "CANCELLED";

     await order.save();

     //update product stock count
     order.orderItems.forEach(async (item) => {
       const product = await Product.findById(item.product);
       product.stock += item.quantity;
       await product.save();
     });
   }

  res.status(200).json({
    success: true,
    message: "Succesfully cancelled order",
    order,
  });
});


/******************************************************
 * @GET_ONE_ORDER
 * @route http://localhost:5000/api/order/:id
 * @description User can get one Oder using id
 * @parameters id
 * @returns  Order Object
 ******************************************************/

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


/******************************************************
 * @GET_LOGGED_IN_ORDER
 * @route http://localhost:5000/api/myorder
 * @description User can get all privious orders
 * @parameters 
 * @returns  Order Object
 ******************************************************/

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

/******************************************************
 * @ADMIN_GET_ALL_ORDER
 * @route http://localhost:5000/api/admin/orders
 * @description Admin can get all orders 
 * @parameters 
 * @returns  Order Object
 ******************************************************/

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

  if(!order){
    return next(new CustomError("Order does not exist", 401));

  }

  await order.remove();

  res.status(200).json({
    success: true,
  });
});

