import { NextFunction, Request, Response } from "express"
import { AgencyRegistration } from "../dto/agency/registration"
import { Agency } from "../entites/Agency"
import  {
    Validate,
    validate
} from "class-validator"
type Body = (req: Request, res: Response, next: NextFunction) => Promise<void> //body type

const dtoValidationBodyInput = () => {
    const returnFunction: Body = async (req, res, next) => {
        try {
            const registrationData:any = req.body
            const checkRegistrationData:AgencyRegistration | any = new AgencyRegistration();
            for (const property in req.body) {
                checkRegistrationData[property] = req.body[property]
            } //store all body data dynamicaly into the validation instance

            const isValidationError = await validate(checkRegistrationData) //validate the input data here
            if (isValidationError.length) {
                res.json ({
                    message: isValidationError,
                    status: 406
                })
            }
        }catch (err) {
            console.log(err)
            res.json ({ 
                message: "Internal error from middleware",
                status: 406
            })
        }
    }
    return returnFunction; //return the function here
}


export default dtoValidationBodyInput