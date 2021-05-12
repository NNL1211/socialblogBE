const express = require('express');
const router = express.Router();
const userApi = require('./user.api')
const authApi = require("./auth.api")
const blogApi = require("./blog.api")
const reviewApi = require("./review.api")
const reactionApi = require("./reaction.api")
const friendshipApi = require("./friendship.api")
const email =require("../helpers/email")
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

/* Temporary GET route to send myself an email. */
router.get("/test-email", (req, res) => {
  email.sendTestEmail();
  res.send("email sent");
});

module.exports = router;
