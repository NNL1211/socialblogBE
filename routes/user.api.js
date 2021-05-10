const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController")
const { body } = require('express-validator');
const validators = require ("../middleware/validators")
const authMiddleware =require ("../middleware/authentication")

/**
 * @route POST api/users
 * @description Register new user
 * @access Public
 */
 router.post("/",validators.validate([
    body("name", "Invalid name").exists().notEmpty(),
    body('email',"email is wrong type").exists().isEmail(),
    body("password","pass ngu").exists().notEmpty().isLength({ min: 6 }),
    ]), userController.createData);
/**
 * @route PUT api/users/
 * @description Update user profile
 * @access Login required
 */
 router.put("/",authMiddleware.loginRequired, userController.updateData);
/**
 * @route GET api/users/me
 * @description Get current user info
 * @access Login required
 */
 router.get("/",authMiddleware.loginRequired, userController.getAllUser);
/**
 * @route GET api/users?page=1&limit=10
 * @description Get users with pagination
 * @access Login required
 */
 router.get("/me",authMiddleware.loginRequired, userController.getCurrentUser);

 module.exports = router;