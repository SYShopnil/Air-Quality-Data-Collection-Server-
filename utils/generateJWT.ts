import jwt from  "jsonwebtoken"
require ("dotenv").config()

const generateJWT = (data:any, expiresIn:string):string => {
    const token  = jwt.sign (data,process.env.JWT_CODE!, {
        expiresIn
    })
    // console.log(expiresIn)
    return token
}

export default generateJWT