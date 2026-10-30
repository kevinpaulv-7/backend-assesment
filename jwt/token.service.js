const jwt =require('jsonwebtoken')
const secretKey=process.env.JWT_SECRET
class TokenService{
    generateToken(payload){
        return jwt.sign(payload,secretKey,{expiresIn:"1h"})
    }
}
module.exports=new TokenService();