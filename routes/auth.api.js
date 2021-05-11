const express = require("express")
const router = express.Router()
const authController = require("../controllers/authController")
const { body } = require('express-validator');
const validators = require ("../middleware/validators");
const passport = require("passport");


router.post("/login",
validators.validate([
body('email',"email is wrong type").exists().isEmail(),
body("password","pass is wrong").exists().notEmpty(),
])
,authController.loginWithEmail)

router.post("/login/facebook",passport.authenticate("facebook-token"),authController.loginWithFacebookOrGoogle)


module.exports= router