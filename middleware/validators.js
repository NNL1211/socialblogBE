const validators = {}
const {validationResult} = require("express-validator")
const mongoose = require("mongoose");

validators.validate = (valitdationArray)=> async (req,res,next)=>{
    await Promise.all(valitdationArray.map(validation => validation.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
      }
    res.status(400).json({errors: errors.array()});
}
validators.checkObjectId = (paramId) => {
    if (!mongoose.Types.ObjectId.isValid(paramId)) {
      throw new Error("Invalid ObjectId");
    }
    return true;
  };


module.exports = validators