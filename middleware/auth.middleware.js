const jwt=require('jsonwebtoken')
function authMiddleware(req,res,next){
    const authorization=req.headers.authorization
    const [schema,token]=authorization?authorization.split(" "):[]
    if(schema!=='Bearer'|| !token){
        return res.status(401).json({message:"Authorization token is required!"})
    }
    const secretKey=process.env.JWT_SECRET
    if(!secretKey){
        return next(new Error('JWT_secret is not defined!'))
    }
    try {
        req.user=jwt.verify(token,secretKey)
        return next()
    } catch (error) {
        return res.status(401).json({message:"The token is either expired or invalid!"})
        
    }
}
module.exports=authMiddleware