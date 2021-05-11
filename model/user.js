const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')
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

userSchema.statics.findOrCreate = function findOrCreate(profile,cb){
    const userObj = new this();
    this.findOne({email:profile.email},async function(err,result){
        if(!result){
            //create User
            //1. make new password
            let newPassword =""+Math.floor(Math.random()*100000000)
            const salt = await bcrypt.genSalt(10);
            newPassword = await bcrypt.hash(newPassword,salt)
            //2. save user
            userObj.name = profile.name
            userObj.email = profile.email
            userObj.password = newPassword
            userObj.avatarUrl = profile.avatarUrl;
            //3. call the cb
            userObj.save(cb)
        }else{
            // send that user information back to passport
            cb(err,result)
        }
    })
}

//generate token 
userSchema.methods.generateToken = async function(){
  const accessToken = await jwt.sign({_id:this._id}, process.env.JWT_SECRET_KEY,{expiresIn:"7d"})
  return accessToken
}
// userSchema.plugin(require("./plugins/isDeletedFalse"));
const User = mongoose.model("User",userSchema)
module.exports = User;
