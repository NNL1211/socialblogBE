const User = require("../model/user");
const Friendship = require("../model/friendship")
const bcrypt = require('bcrypt');
const utilsHelper = require("../helpers/utils");
const { emailInternalHelper, emailHelper } = require("../helpers/email");
const userController = {};

userController.getAllUser = async (req, res, next) => {
  try {
    //1. read the query information
    let {page,limit,sortBy,...filter}=req.query
    currentUserId = req.userId
    page = parseInt(page) || 1
    limit = parseInt(limit) || 10
    //2. get total users number
    const totalUsers = await User.countDocuments({...filter,isDeleted: false,})
    //3. caculate total page number
    const totalPages = Math.ceil(totalUsers/limit) 
    //4. caculate how many data you will skip (offset)
    const offset = limit * (page-1)
    //5. get Users based on query info
    const users = await User.find(filter).skip(offset).limit(limit).sort({ ...sortBy, createdAt: -1 })
    // console.log("am i hereeee")
    // console.log(users)
    const promises = users.map(async (user) => {
    let temp = user.toJSON();
    // console.log(temp)
    temp.friendship = await Friendship.findOne(
      {
        $or: [
          { from: currentUserId, to: user._id },
          { from: user._id, to: currentUserId },
        ],
      },
      "-_id status updatedAt"
    );
    return temp;
  });
  const usersWithFriendship = await Promise.all(promises);
  // console.log("this is friendship",usersWithFriendship)
    res.status(200).json({
      status: "Success",
      data: {users:usersWithFriendship,totalPages},
    });
  } catch (error) {
    res.status(400).json({
      status: "Fail",
      error: error.message,
    });
  }
};

userController.getCurrentUser = async (req, res, next) => {
  try {
    // How to get the data
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user){
      throw new Error("User not found, Get Current User Error")
    }
    res.status(200).json({
      status: "Success",
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      status: "Fail",
      error: error.message,
    });
  }
};

userController.createData = async (req, res, next) => {
  try {
    const { name, email,avatarUrl,password,emailVerified} = req.body;
    let user = await User.findOne({ email });
    if (user){
      throw new Error("This email is exist")
    }
    const salt = await bcrypt.genSalt(10);
    const encodedPassword = await bcrypt.hash(password, salt);
    // console.log("what is ", encodedPassword);
    const emailVerificationCode = utilsHelper.generateRandomHexString(20);
    let newuser = new User({ name,email,avatarUrl,password:encodedPassword,emailVerified:false,emailVerificationCode,});
    await newuser.save();
    //time to send to email with verification
    const verificationURL = `${process.env.FRONTEND_URL}/verify?code=${emailVerificationCode}`
    // const verificationURL = `https://nhatlamsocialblog.netlify.app/verify?code=${emailVerificationCode}`
    const emailData = await emailHelper.renderEmailTemplate("verify_email",{name,code:verificationURL},email)

    if(emailData.error){
      throw new Error(emailData.error)
    }else{
      emailHelper.send(emailData)
    }
    res.status(200).json({
      status: "Success",
      data: {newuser},
    });
  } catch (error) {
    res.status(400).json({
      status: "Fail",
      error: error.message,
    });
  }
};

userController.updateData = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { name, avatarUrl } = req.body;
    const user = await User.findByIdAndUpdate(
      userId,
      { name, avatarUrl},
      { new: true }
    );

    res.status(200).json({
      status: "Success",
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      status: "Fail",
      error: error.message,
    });
  }
};

userController.deleteData = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: "Success",
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      status: "Fail",
      error: error.message,
    });
  }
};


//------------------------------------------------------------------->FriendShip Model
userController.sendFriendRequest = async (req, res, next) => {
  try {
    const userId = req.userId; // From
    const toUserId = req.params.id; // To
    
    const user = await User.findById(toUserId);
    if (!user) {
      throw new Error("User not found ,Send Friend Request Error")
    }
    let friendship = await Friendship.findOne({
      $or: [
        { from: toUserId, to: userId },
        { from: userId, to: toUserId },
      ],
    });
    if (!friendship) {
      await Friendship.create({
        from: userId,
        to: toUserId,
        status: "requesting",
      });
      res.status(200).json({
        status: "Success",
        message: "Request has ben sent"
      });
    } else {
      switch (friendship.status) {
        case "requesting":
          if (friendship.from.equals(userId)) {
            throw Error("You have already sent a request to this user,Add Friend Error")
            
          } else {
            throw Error("You have received a request from this user,Add Friend Error")
          }
          break;
        case "accepted":
          throw Error("Users are already friend,Add Friend Error")
          break;
        case "removed":
        case "decline":
        case "cancel":
          friendship.from = userId;
          friendship.to = toUserId;
          friendship.status = "requesting";
          await friendship.save();
          res.status(200).json({
            status: "Success",
            message: "Request has ben sent"
          });
          break;
        default:
          break;
      }
    }
  } catch (error) {
    res.status(400).json({
      status: "Fail",
      error: error.message,
    });
  }

};

userController.acceptFriendRequest = async (req, res, next) => {
  try {
    const userId = req.userId; // To
    const fromUserId = req.params.id; // From
    let friendship = await Friendship.findOne({
      from: fromUserId,
      to: userId,
      status: "requesting",
    });
    if (!friendship){
      throw new Error("Friend Request not found,Accept Request Error")
    }
    friendship.status = "accepted";
    await friendship.save();
    res.status(200).json({
      status: "Success",
      message: "Friend request has been accepted"
    });
  } catch (error) {
    res.status(400).json({
      status: "Fail",
      error: error.message,
    });
  }

};

userController.declineFriendRequest = async (req, res, next) => {
  try {
    const userId = req.userId; // To
    const fromUserId = req.params.id; // From
    let friendship = await Friendship.findOne({
      from: fromUserId,
      to: userId,
      status: "requesting",
    });
    if (!friendship){
      throw new Error("Request not found,Decline Request Error")
    }
  
  
    friendship.status = "decline";
    await friendship.save();
    res.status(200).json({
      status: "Success",
      message: "Friend request has been declined"
    });
  } catch (error) {
    res.status(400).json({
      status: "Fail",
      error: error.message,
    });
  }

};

userController.cancelFriendRequest = async (req, res, next) => {
  try {
    const userId = req.userId; // From
    const toUserId = req.params.id; // To
    let friendship = await Friendship.findOne({
      from: userId,
      to: toUserId,
      status: "requesting",
    });
    if (!friendship){
      throw new Error("Request not found,Cancel Request Error")
    }
    friendship.status = "cancel";
    await friendship.save();
    res.status(200).json({
      status: "Success",
      message: "Friend request has been cancelled"
    });
  } catch (error) {
    res.status(400).json({
      status: "Fail",
      error: error.message,
    });
  }

};

userController.removeFriendship = async (req, res, next) => {
  try {
    const userId = req.userId;
    const toBeRemovedUserId = req.params.id;
    let friendship = await Friendship.findOne({
      $or: [
        { from: userId, to: toBeRemovedUserId },
        { from: toBeRemovedUserId, to: userId },
      ],
      status: "accepted",
    });
    if (!friendship){
      throw new Error("Friend not found,Remove Friend Error")
    }
    friendship.status = "removed";
    await friendship.save();
    res.status(200).json({
      status: "Success",
      message: "Friendship has been removed"
    });
  } catch (error) {
    res.status(400).json({
      status: "Fail",
      error: error.message,
    });
  }

};


//-------------------> GetListFriendshipModel

userController.getSentFriendRequestList = async (req, res, next) => {
  try {
    let { page, limit, sortBy, ...filter } = { ...req.query };
    const userId = req.userId;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
  
    let requestList = await Friendship.find({
      from: userId,
      status: "requesting",
    });
  
    const recipientIDs = requestList.map((friendship) => {
      if (friendship.from._id.equals(userId)) return friendship.to;
      return friendship.from;
    });
  
    const totalRequests = await User.countDocuments({
      ...filter,
      isDeleted: false,
      _id: { $in: recipientIDs },
    });
    const totalPages = Math.ceil(totalRequests / limit);
    const offset = limit * (page - 1);
  
    let users = await User.find({ ...filter, _id: { $in: recipientIDs } })
      .sort({ ...sortBy, createdAt: -1 })
      .skip(offset)
      .limit(limit);
  
    const promises = users.map(async (user) => {
      let temp = user.toJSON();
      temp.friendship = requestList.find((friendship) => {
        if (friendship.from.equals(user._id) || friendship.to.equals(user._id)) {
          return { status: friendship.status };
        }
        return false;
      });
      return temp;
    });
    const usersWithFriendship = await Promise.all(promises);
    res.status(200).json({
      status: "Success",
      data: { users: usersWithFriendship, totalPages },
    });
  } catch (error) {
    res.status(400).json({
      status: "Fail",
      error: error.message,
    });
  }
};

userController.getReceivedFriendRequestList = async (req, res, next) => {
  try {
    let { page, limit, sortBy, ...filter } = { ...req.query };
    const userId = req.userId;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    
    console.log("am i herrrrrrrreeeee",userId)
    let requestList = await Friendship.find({
      to: userId,
      status: "requesting",
    });

    const requesterIDs = requestList.map((friendship) => {
      if (friendship.from._id.equals(userId)) return friendship.to;
      return friendship.from;
    });

    const totalRequests = await User.countDocuments({
      ...filter,
      isDeleted: false,
      _id: { $in: requesterIDs },
    });
    const totalPages = Math.ceil(totalRequests / limit);
    const offset = limit * (page - 1);

    let users = await User.find({ ...filter, _id: { $in: requesterIDs } })
      .sort({ ...sortBy, createdAt: -1 })
      .skip(offset)
      .limit(limit);

    const promises = users.map(async (user) => {
      let temp = user.toJSON();
      temp.friendship = requestList.find((friendship) => {
        if (
          friendship.from.equals(user._id) ||
          friendship.to.equals(user._id)
        ) {
          return { status: friendship.status };
        }
        return false;
      });
      return temp;
    });
    const usersWithFriendship = await Promise.all(promises);
    res.status(200).json({
      status: "Success",
      data: { users: usersWithFriendship, totalPages },
    });
  } catch (error) {
    res.status(400).json({
      status: "Fail",
      error: error.message,
    });
  }
};

userController.getFriendList = async (req, res, next) => {
  try {
    let { page, limit, sortBy, ...filter } = { ...req.query };
    const userId = req.userId;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
  
    let friendList = await Friendship.find({
      $or: [{ from: userId }, { to: userId }],
      status: "accepted",
    });
  
    const friendIDs = friendList.map((friendship) => {
      if (friendship.from._id.equals(userId)) return friendship.to;
      return friendship.from;
    });
  
    const totalFriends = await User.countDocuments({
      ...filter,
      isDeleted: false,
      _id: { $in: friendIDs },
    });
    const totalPages = Math.ceil(totalFriends / limit);
    const offset = limit * (page - 1);
  
    let users = await User.find({ ...filter, _id: { $in: friendIDs } })
      .sort({ ...sortBy, createdAt: -1 })
      .skip(offset)
      .limit(limit);
  
    const promises = users.map(async (user) => {
      let temp = user.toJSON();
      temp.friendship = friendList.find((friendship) => {
        if (friendship.from.equals(user._id) || friendship.to.equals(user._id)) {
          return { status: friendship.status };
        }
        return false;
      });
      return temp;
    });
    const usersWithFriendship = await Promise.all(promises);
    res.status(200).json({
      status: "Success",
      data: { users: usersWithFriendship, totalPages },
    });
  } catch (error) {
    res.status(400).json({
      status: "Fail",
      error: error.message,
    });
  }
};

// -----------------------------> verify email

userController.verifyEmail = async (req, res, next) => {
  try {
    const { code } = req.body;
    console.log("this is verify code",code)
    let user = await User.findOne({
      emailVerificationCode: code
    });
    console.log("this is userfinded",user)
    if (!user) {
      res.status(400).json({ error: "Invalid Email Verification Token" });
      return;
    }
    user = await User.findByIdAndUpdate(
      user._id,
      {
        $set: { emailVerified: true },
        // $unset: { emailVerificationCode: 1 }
      },
      { new: true }
    );
    // console.log(user)
    accessToken = await user.generateToken();
    res.status(200).json({
      status: "Success",
      data: { user, accessToken },
    });
  } catch (error) {
    res.status(400).json({
      status: "Fail",
      error: error.message,
    });
  }

};

module.exports = userController;
