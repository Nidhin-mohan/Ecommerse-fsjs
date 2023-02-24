const Coupon = require("../models/coupon.schema");
const asyncHandler = require("../services/asyncHandler");
const CustomError = require("../utils/customError");

/**********************************************************
 * @CREATE_COUPON
 * @route https://localhost:5000/api/coupon
 * @description Controller used for creating a new coupon
 * @description Only admin and Moderator can create the coupon
 * @returns Coupon Object with success message "Coupon Created SuccessFully"
 *********************************************************/


exports.createCoupon = asyncHandler(async (req, res) => {
  const { code, discount } = req.body;
  
  
  if (!code || !discount) {
    throw new CustomError(" Coupon code, discount is required", 400);
  }
  //finding coupon using code from database
  const couponExist = await Coupon.findOne({code});

  console.log(couponExist)

  if (couponExist) {
    throw new CustomError(" Coupon code already exist", 500);
  }

  //add this name to database
  const coupon = await Coupon.create({
    code,
    discount
  });
  //send this response value to frontend
  res.status(200).json({
    success: true,
    message: "Coupon Created SuccessFull",
    coupon,
  });
});

/**********************************************************
 * @DEACTIVATE_COUPON
 * @route https://localhost:5000/api/coupon/deactive/:couponId
 * @description Controller used for deactivating the coupon
 * @description Only admin and Moderator can update the coupon
 * @returns Coupon Object with success message "Coupon Deactivated SuccessFully"
 *********************************************************/


exports.deactivateCoupon = asyncHandler(async (req, res) => {
  const { couponId } = req.params;
 
  if (!couponId) {
    throw new CustomError("missing coupon id", 400);
  }

  let coupon = await Coupon.findByIdAndUpdate(
    couponId,
    {
      active: false,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  //send this response value to frontend
  res.status(200).json({
    success: true,
    message: "Coupon Deactivated SuccessFully",
    coupon,
  });
});
  


/**********************************************************
 * @DELETE_COUPON
 * @route https://localhost:5000/api/coupon/:couponId
 * @description Controller used for deleting the coupon
 * @description Only admin and Moderator can delete the coupon
 * @returns Success Message "Coupon Deleted SuccessFully"
 *********************************************************/


exports.deleteCoupon = asyncHandler(async (req, res) => {
  const { couponId } = req.params;
  if (!couponId) {
    throw new CustomError("missing coupon id", 400);
  }

  let deletedCoupon = await Coupon.findByIdAndDelete(couponId);

  deletedCoupon.remove();

  //send this response value to frontend
  res.status(200).json({
    success: true,
    message: "Coupon Deleted SuccessFully",
  });
});



/**********************************************************
 * @GET_ALL_COUPONS
 * @route https://localhost:5000/api/coupon
 * @description Controller used for getting all coupons details
 * @description Only admin and Moderator can get all the coupons
 * @returns allCoupons Object
 *********************************************************/


exports.getAllCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find();

  if (!coupons) {
    throw new CustomError("No coupon found", 400);
  }

  //send this response value to frontend
  res.status(200).json({
    success: true,
    coupons,
  });
});
