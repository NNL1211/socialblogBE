const Review = require("../model/review");
const Blog = require("../model/blog");

const reviewController = {};

reviewController.getReviewsOfBlog = async (req, res, next) => {
    try {
    const blogId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
  
    const blog = Blog.findById(blogId);
    if (!blog){
        throw Error("Blog not found, Create New Review Error")
    }
  
    const totalReviews = await Review.countDocuments({ blog: blogId });
    const totalPages = Math.ceil(totalReviews / limit);
    const offset = limit * (page - 1);
  
    const reviews = await Review.find({ blog: blogId })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);
      res.status(200).json({
        status: "Success",
        data: {reviews, totalPages},
      });
    } catch (error) {
        res.status(400).json({
            status: "Fail",
            error: error.message,
          });
    }
  };

reviewController.createNewReview = async (req, res, next) => {
try {
    const userId = req.userId;
    const blogId = req.params.id;
    const { content } = req.body;

    const blog = Blog.findById(blogId);
    if (!blog){
      throw Error("Blog not found, Create New Review Error")
  }
    let review = await Review.create({
    user: userId,
    blog: blogId,
    content,
  });
  review = await review.populate("user").execPopulate();
  res.status(200).json({
    status: "Success",
    data: review,
  });
} catch (error) {
    res.status(400).json({
        status: "Fail",
        error: error.message,
      });
}
};

reviewController.updateSingleReview = async (req, res, next) => {
    try {
    const userId = req.userId;
    const reviewId = req.params.id;
    const { content } = req.body;
    const review = await Review.findOneAndUpdate(
      { _id: reviewId, user: userId },
      { content },
      { new: true }
    );
    if (!review){
        throw Error("Review not found or User not authorized,Update Review Error")
    }
    res.status(200).json({
        status: "Success",
        data: review,
      });
    } catch (error) {
        res.status(400).json({
            status: "Fail",
            error: error.message,
          });
    }
  };
reviewController.deleteSingleReview = async (req, res, next) => {
    try {
        const userId = req.userId;
        const reviewId = req.params.id;
      
        const review = await Review.findOneAndDelete({
          _id: reviewId,
          user: userId,
        });
        if (!review){
            throw Error("Review not found or User not authorized,Delete Review Error")
        }
        res.status(200).json({
            status: "Success",
            message: "Delete successful",
          });
    } catch (error) {
        res.status(400).json({
            status: "Fail",
            error: error.message,
          });
    }
  };
module.exports = reviewController;