import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()

const JWT_CODE:any = process.env.JWT_CODE 
type jwtReturn =  {
    isVerify: string
}
const jwtVerifier: (token:string) => Promise <jwtReturn> = async (token) => {
    const isVerify:any = jwt.verify (token, JWT_CODE) 
    return {
        isVerify
    }
}

export default  jwtVerifier
