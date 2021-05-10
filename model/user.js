const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
require ("dotenv").config()
const userSchema = mongoose.Schema(
    {
    name: { type: String, required: [true, "name is required"]},
    email: { type: String, required: [true, "Username is required"], unique: true },
    avatarUrl: { type: String, required: false, default: "" },
    password: { type: String, required: [true, "Password is required"], select: true },
    emailVerificationCode: { type: String, select: false },
    emailVerified: { type: Boolean, required: [true, "emailVerified is required"], default: false },
    friendCount: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false, select: false },
    },
    { timestamps: true }
);

userSchema.methods.toJSON = function(){
  const obj = this._doc;
  delete obj.password;
  delete obj.emailVerified;
  return obj;
}

//generate token 
userSchema.methods.generateToken = async function(){
  const accessToken = await jwt.sign({_id:this._id}, process.env.JWT_SECRET_KEY,{expiresIn:"7d"})
  return accessToken
}
// userSchema.plugin(require("./plugins/isDeletedFalse"));
const User = mongoose.model("User",userSchema)
module.exports = User;
