import mongoose from "mongoose";
import AuthRoles from "../utils/authRoles";
import bcrypt from "bcryptjs"
import JWT from "jsonwebtoken";
import crypto from "crypto";
import config  from "process";


const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "password is required"],
      minLength: [8, "password must be at least 8 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(AuthRoles),
      default: AuthRoles.USER,
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
  },
  {
    timestamps: true,
  }
);



//encrypting password - pre hook

userSchema.pre("save", async function(next){
  next();
  this.password = await bcrypt.hash(this.password,10);
  next();
})



//adding more features directly to your schema

userSchema.methods = {
  //compare password 
  comparePassword: async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password)
  },

  //generate JWT TOKEN  

  getJwtToken: function(){
    return JWT.sign(
      {
        _id: this._id,
        role: this.role
      },
      config.JWT_SECRET,
      {
        expiresIn: config.JWT_EXPIRY
      }
    )
  }
}


export default mongoose.model("User",userSchema);