const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blogController");
const validators = require("../middleware/validators");
const authMiddleware = require("../middleware/authentication");
const { body, param } = require("express-validator");


/**
 * @route POST api/blogs
 * @description Create a new blog
 * @access Login required
 */
 router.post(
    "/",
    authMiddleware.loginRequired,
    // uploader.array("images", 2),
    validators.validate([
      body("title", "Missing title").exists().notEmpty(),
      body("content", "Missing content").exists().notEmpty(),
    ]),
    blogController.createNewBlog
  );
/**
 * @route GET api/blogs/:id
 * @description Get a single blog
 * @access Public
 */
 router.get(
    "/:id",
    validators.validate([
      param("id").exists().isString().custom(validators.checkObjectId),
    ]),
    blogController.getSingleBlog
  );
  
/**
 * @route GET api/blogs?page=1&limit=10
 * @description Get blogs with pagination
 * @access Public
 */
router.get("/", blogController.getBlogs);

/**
 * @route PUT api/blogs/:id
 * @description Update a blog
 * @access Login required
 */
 router.put(
    "/:id",
    authMiddleware.loginRequired,
    validators.validate([
      param("id").exists().isString().custom(validators.checkObjectId),
      body("title", "Missing title").exists().notEmpty(),
      body("content", "Missing content").exists().notEmpty(),
    ]),
    blogController.updateSingleBlog
);

/**
 * @route DELETE api/blogs/:id
 * @description Delete a blog
 * @access Login required
 */
 router.delete(
    "/:id",
    authMiddleware.loginRequired,
    validators.validate([
      param("id").exists().isString().custom(validators.checkObjectId),
    ]),
    blogController.deleteSingleBlog
);
  

module.exports = router;