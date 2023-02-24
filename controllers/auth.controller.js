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

  //creating a new user
  const user = await User.create({
    name,
    email,
    password,
  });

  //generating token for cookie
  const token = user.getJwtToken();

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
  // finding user from database uisng email
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new CustomError("Invalid credentials", 400);
  }
  // comparing password
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
  // res.clearCookie()  or setting cookie as null
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

  if (!email ) {
    throw new CustomError("Please fill email", 400);
  }
  //finding user with email
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
    // sending mail to user email for resetting password
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


/******************************************************
 * @CHANGE_PASSWORD
 * @REQUEST_TYPE POST
 * @route http://localhost:5000/api/auth/password/change
 * @description check for token and populate req.user
 * @parameters oldPassword, newPassword
 * @returns User Object
 ******************************************************/

exports.changePassword = asyncHandler(async (req, res) => {
  // get new and old password form body
  const { newPassword, oldPassword } = req.body;

  
  if (!newPassword || !oldPassword) {
    throw new CustomError("All field should be filled", 400);
  }

  // get user from middleware
  const userId = req.user.id;

  // get user from database
  const user = await User.findById(userId).select("+password");

  if (!user) {
    throw new CustomError("User not found", 404);
  }

  //check if old password is correct
  const isValidated = await user.comparePassword(oldPassword);

  if (isValidated) {
    throw new CustomError("Old password is incorrect", 400);
  }

  // allow to set new password
  user.password = newPassword ;

  // save user and send fresh token
  await user.save();

   user.password = undefined;

  res.status(200).json({
    success: true,
    user,
  });
});


/******************************************************
 * @UPDATE_USER_DETAILS
 * @REQUEST_TYPE PUT
 * @route http://localhost:5000/api/auth/profile/update
 * @description update user's name , email
 * @parameters name, email
 * @returns User Object
 ******************************************************/

exports.updateUserProfile = asyncHandler(async (req, res) => {
  // get name, email form body
  const { name, email } = req.body;

  if (!name || !email) {
    throw new CustomError("All field should be filled", 400);
  }

  const userId = req.user.id;

  const user = await User.findById(userId);

  user.name = name;
  user.email = email;

  // save user and send fresh token
  await user.save();

  res.status(200).json({
    success: true,
    user,
  });
});

/******************************************************
 * @ADMIN_GET_ALL_USERS
 * @route http://localhost:5000/api/auth/admin/users
 * @description admin will get all users info
 * @parameters 
 * @returns Users Object
 ******************************************************/

exports.adminAllUser = asyncHandler(async (req, res) => {
  // select all users
  const users = await User.find();

  // send all users
  res.status(200).json({
    success: true,
    users,
  });
});


/******************************************************
 * @ADMIN_GET_ONE_USER
 * @route http://localhost:5000/api/auth/admin/users/:id
 * @description admin will get one user info
 * @parameters id
 * @returns User Object
 ******************************************************/


exports.admingetOneUser = asyncHandler(async (req, res, next) => {
  // get id from url and get user from database
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new CustomError("No user found", 400);
  }

  // send user
  res.status(200).json({
    success: true,
    user,
  });
});


/******************************************************
 * @ADMIN_UPDATE_ONE_USER_DETAILS
 * @route http://localhost:5000/api/auth/admin/users/:id
 * @description admin will update one user's info
 * @parameters id, name, email, role
 * @returns User Object
 ******************************************************/


exports.adminUpdateOneUserDetails = asyncHandler(async (req, res, next) => {

  const { name, email, role } = req.body;
  const {id } = req.params

  

  // add a check for email and name in body
  if (!req.body.name || !req.body.email || !req.body.role) {
    throw new CustomError("Please fill all fields", 400);
  }
  // get data from request body
  const newData = {
    name,
    email,
    role,
  };

  console.log(newData)
  // update the user in database
  const user = await User.findByIdAndUpdate(id, newData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});



/******************************************************
 * @ADMIN_DELETE_ONE_USER
 * @route http://localhost:5000/api/auth/admin/users/:id
 * @description admin will delete user with id
 * @parameters id
 * @returns 
 ******************************************************/

exports.adminDeleteOneUser = asyncHandler(async (req, res, next) => {
  // get user from url
  const user = await User.findById(req.params.id);

  console.log(user)

  if (!user) {
    return next(new CustomError("No Such user found", 401));
  }
  // remove user from databse
  await user.remove();

  res.status(200).json({
    success: true,
  });
});