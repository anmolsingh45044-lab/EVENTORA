const jwt = require('jsonwebtoken');
const user = require('../postmodel/post.model');


// user authentication middleware
const protect = async (req, res, next) => {
    let token=req.headers.authorization && req.headers.authorization.startsWith('Bearer') ? req.headers.authorization.split(' ')[1] : null;
    if(token){
       try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        req.user=await user.findById(decoded.id).select('-password');
       
      if(!req.user){
        return res.status(401).json({error:"Not authorized, user not found"})
      }
      next();
       

     }catch(error){
        return res.status(401).json({error:"Not authorized, token failed"})
       }
    }
    else{
        return res.status(401).json({error:"Not authorized, no token"})
    }
}

   //admin authentication middleware
   const admin=async(req,res,next)=>{
    if(req.user && req.user.role==='admin'){
        next();
    }
    else{
        return res.status(403).json({error:"Not authorized, admin access only"})
    }
   }

   

module.exports={protect,admin};



