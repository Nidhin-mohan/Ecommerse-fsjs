const User = require("../models/user.schema.js");
const asyncHandler = require("../services/asyncHandler");
const CustomError = require("../utils/customError");
const mailHelper = require("../utils/mailHelper");
const crypto = require("crypto");
const cookieOptions = require("../utils/cookieOptions");


/******************************************************
 * @SIGNUP
 * @route http://localhost:5000/api/auth/signup
 * @description User signUp Controller for creating new user
 * @parameters name, email, password
 * @returns User Object
 ******************************************************/
exports.signUp = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new CustomError("Please fill all fields", 400);
  }
  //check if user exists
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new CustomError("User already exists", 400);
  }

  const user = await User.create({
    name,
    email,
    password,
  });
  const token = user.getJwtToken();
  console.log(user);
  user.password = undefined;

  res.cookie("token", token, cookieOptions);

  res.status(200).json({
    success: true,
    token,
    user,
  });
});

/******************************************************
 * @LOGIN
 * @route http://localhost:5000/api/auth/login
 * @description User signIn Controller for loging existing user
 * @parameters  email, password
 * @returns User Object
 ******************************************************/

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new CustomError("Please fill all fields", 400);
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new CustomError("Invalid credentials", 400);
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (isPasswordMatched) {
    const token = user.getJwtToken();
    user.password = undefined;
    res.cookie("token", token, cookieOptions);
    return res.status(200).json({
      success: true,
      token,
      user,
    });
  }

  throw new CustomError("Invalid credentials - pass", 400);
});

/******************************************************
 * @LOGOUT
 * @route http://localhost:5000/api/auth/logout
 * @description User logout by clearing user cookies
 * @parameters
 * @returns success message
 ******************************************************/
exports.logout = asyncHandler(async (_req, res) => {
  // res.clearCookie()  or
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});

/******************************************************
 * @FORGOT_PASSWORD
 * @route http://localhost:5000/api/auth/password/forgot
 * @description User will submit email and we will generate a token
 * @parameters  email
 * @returns success message - email send
 ******************************************************/

exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  //check email for null or ""

  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError("User not found", 404);
  }
  const resetToken = user.genereteForgotPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/auth/password/reset/${resetToken}`;

  const text = `Your password reset url is
    \n\n ${resetUrl}\n\n
    `;

  try {
    await mailHelper({
      email: user.email,
      subject: "Password reset email for website",
      text: text,
    });
    res.status(200).json({
      success: true,
      message: `Email send to ${user.email}`,
    });
  } catch (err) {
    //roll back - clear fields and save
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    await user.save({ validateBeforeSave: false });

    throw new CustomError(err.message || "Email sent failure", 500);
  }
});

/******************************************************
 * @RESET_PASSWORD
 * @route http://localhost:5000/api/auth/password/reset/:resetToken
 * @description User will be able to reset password based on url token
 * @parameters  token from url, password and confirmpass
 * @returns User object
 ******************************************************/

exports.resetPassword = asyncHandler(async (req, res) => {
  
  const resetToken = req.params.resetToken; 
  const { password, confirmPassword } = req.body;
console.log(resetToken)
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // User.findOne({email: email})
  const user = await User.findOne({
    forgotPasswordToken: resetPasswordToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new CustomError("password token is invalid or expired", 400);
  }

  if (password !== confirmPassword) {
    throw new CustomError("password and conf password does not match", 400);
  }

  user.password = password;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;

  await user.save();

  //create token and send as response
  const token = user.getJwtToken();
  user.password = undefined;

  //helper method for cookie can be added
  res.cookie("token", token, cookieOptions);
  res.status(200).json({
    success: true,
    user,
  });
});

// TODO: create a controller for change password

/******************************************************
 * @GET_PROFILE
 * @REQUEST_TYPE GET
 * @route http://localhost:5000/api/auth/profile
 * @description check for token and populate req.user
 * @parameters
 * @returns User Object
 ******************************************************/
exports.getProfile = asyncHandler(async (req, res) => {
  const { user } = req;
  if (!user) {
    throw new CustomError("User not found", 404);
  }
  res.status(200).json({
    success: true,
    user,
  });
});



exports.test = asyncHandler(async (req, res) => {
  console.log("req incoming")
  res.status(200).json({
    success: true,
    message: "hi there",
  });

  
});
