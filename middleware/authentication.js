const authMiddleware = {};
const jwt = require('jsonwebtoken');

authMiddleware.loginRequired = async (req,res,next)=>{
    try {
        //1. get the token from req
        const tokenString = req.headers.authorization
        if(!tokenString){
            throw new Error("Token not found")
        }
        const token = tokenString.replace("Bearer ","")
        //2. check token is exist
        jwt.verify(token,process.env.JWT_SECRET_KEY,(err,payload)=>{
            if(err){
                if(err.name=="TokenExpiredError"){
                    throw new Error("Token Expired")
                }else{
                    throw new Error("Token is invalid")
                }
            }
            req.userId = payload._id;
            console.log(payload)
            console.log("i want to know is this id ?",req.userId )
        })
        // console.log("who first")
        next();
        // 3. next step (add book)
    } catch (err) {
        res.status(400).json({
			status: "fail",
			error: err.message
		})
    }
}

module.exports= authMiddleware;