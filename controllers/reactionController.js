const Reaction = require("../model/reaction");
const mongoose = require("mongoose");
const reactionController = {};

reactionController.saveReaction = async (req, res, next) => {
try {
    const { targetType, targetId, emoji } = req.body;

    const targetObj = await mongoose.model(targetType).findById(targetId);
    if (!targetObj){
        throw Error(`${targetType} not found,Create Reaction Error`)
    }
    // Find the reaction of the current user
    let reaction = await Reaction.findOne({
      targetType,
      targetId,
      user: req.userId,
    });
    let message = "";
    if (!reaction) {
      await Reaction.create({ targetType, targetId, user: req.userId, emoji });
      message = "Added reaction";
    } else {
      if (reaction.emoji === emoji) {
        await Reaction.findOneAndDelete({ _id: reaction._id });
        message = "Removed reaction";
      } else {
        await Reaction.findOneAndUpdate({ _id: reaction._id }, { emoji });
        message = "Updated reaction";
      }
    }
    // Get the updated number of reactions in the targetType
    const reactionStat = await mongoose.model(targetType).findById(targetId, "reactions");
    console.log(reactionStat)
    console.log(reaction)
    res.status(200).json({
        status:"success",
        data: reactionStat.reactions,
        message: message
    })
} catch (error) {
      res.status(400).json({
			status: "fail",
			error: err.message
		})  
}


};

module.exports = reactionController;