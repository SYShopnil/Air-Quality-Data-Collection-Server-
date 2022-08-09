import jwt, { JwtPayload } from "jsonwebtoken"
require('dotenv').config()
import {Request, Response, NextFunction, Express } from "express"
import { TokeInterface } from "../interfaces/AuthToken"
import {Agency} from "../src/entites/Agency"


const authenticationMiddleware = async (req:Request, res:Response, next:NextFunction): Promise<void> => {
    try {
        const {auth:token} = req.cookies //get the token from headers
        //get the dot env file data
        const securityCode:string = process.env.JWT_CODE! //ge the security code from dot env
        if(!token) {
            res.json ({
                message: "Unauthorized user",
                status: 401
            })
        }else {
            const isValidToken:any | TokeInterface = await jwt.verify(token, securityCode) //check that is it a valid token or not
            if(isValidToken) {
                const {id:agentID, email }:TokeInterface = isValidToken //store the token data as a verified userType
                const findAgent:Agency | null = await Agency.createQueryBuilder ("agency")
                .where(`agency.agentID = :id`, {id:agentID})
                .getOne()
                // console.log (findAgent)
                if (findAgent) { //if it is a valid agent then it will execute
                    req.user = findAgent;
                    req.isAuth = true
                    next ();
                }else {
                    req.isAuth = false
                    res.json ({
                        message: "Unauthorized user",
                        status: 406
                    })
                }
                
            }else {
                res.json ({
                    message: "Unauthorized user",
                    status: 406
                })
            }
        }
    }catch(err) {
        console.log(err);
        res.json ({
            message: "Unauthorized user",
            status: 406
        })
    }
}

export default authenticationMiddleware
