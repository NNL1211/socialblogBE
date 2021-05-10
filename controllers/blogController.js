const Blog = require("../model/blog")
const bcrypt = require('bcrypt');
const Review = require("../model/review");
const blogController={}

blogController.createNewBlog = async (req, res, next) => {
    try {
        const author = req.userId;
        const { title, content } = req.body;
        let { images } = req.body;
        const blog = await Blog.create({
            title,
            content,
            author,
            images,
          });
          res.status(200).json({
            status: "Success",
            data: {blog},
          });
    } catch (error) {
        res.status(400).json({
            status: "Fail",
            error: error.message,
          });
    }
}

blogController.getSingleBlog = async (req, res, next) => {
    try {
        let blog = await Blog.findById(req.params.id).populate("author");
        if (!blog){
            throw Error("Blog not found, Get Single Blog Error")
        }
        blog = blog.toJSON();
        blog.reviews = await Review.find({ blog: blog._id }).populate("user");
        res.status(200).json({
            status: "Success",
            data: blog,
          });
    } catch (error) {
        res.status(400).json({
            status: "Fail",
            error: error.message,
          });
    }
   

  };
  
blogController.getBlogs = async (req, res, next) => {
    try {
    let { page, limit, sortBy, ...filter } = { ...req.query };
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
  
    const totalBlogs = await Blog.countDocuments({
      ...filter,
      isDeleted: false,
    });
    const totalPages = Math.ceil(totalBlogs / limit);
    const offset = limit * (page - 1);
  
    // console.log({ filter, sortBy });
    const blogs = await Blog.find(filter)
      .sort({ ...sortBy, createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .populate("author");
    res.status(200).json({
        status: "Success",
        data: { blogs, totalPages },
    });
    } catch (error) {
        res.status(400).json({
            status: "Fail",
            error: error.message,
        });
    }
};

blogController.updateSingleBlog = async (req, res, next) => {
    try {
    const author = req.userId;
    const blogId = req.params.id;
    const { title, content, images} = req.body;
  
    const blog = await Blog.findOneAndUpdate(
      { _id: blogId, author: author },
      { title, content,images },
      { new: true }
    ).populate("author");
    if (!blog){
        throw Error("Blog not found or User not authorized, Update Blog Error")
    }
    res.status(200).json({
        status: "Success",
        data: blog,
    });
    } catch (error) {
        res.status(400).json({
            status: "Fail",
            error: error.message,
        });
    }
    
  };

blogController.deleteSingleBlog = async (req, res, next) => {
    try {
    const author = req.userId;
    const blogId = req.params.id;
  
    const blog = await Blog.findOneAndUpdate(
      { _id: blogId, author: author },
      { isDeleted: true },
      { new: true }
    )
    if(!blog){
        throw Error("Blog not found or User not authorized, Delete Blog Error")
    }
    res.status(200).json({
        status: "Success",
        message: "Delete Blog successful",
    }); 
    } catch (error) {
        res.status(400).json({
            status: "Fail",
            error: error.message,
        });
    }

};

module.exports= blogController;