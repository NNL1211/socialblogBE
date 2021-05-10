const express = require('express');
const router = express.Router();
const userApi = require('./user.api')
const authApi = require("./auth.api")
const blogApi = require("./blog.api")
const reviewApi = require("./review.api")
const reactionApi = require("./reaction.api")
const friendshipApi = require("./friendship.api")
// userApi
router.use("/users", userApi);

// authApi
router.use("/auth", authApi);

// blogApi
router.use("/blogs", blogApi);

//reviewApi
router.use("/reviews", reviewApi);

// reactionApi
router.use("/reactions", reactionApi);

// friendshipApi
router.use("/friends", friendshipApi);

module.exports = router;
