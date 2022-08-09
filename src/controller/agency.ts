import { NextFunction, Request, Response } from "express"
import { AgencyRegistration } from "../dto/agency/registration.dto"
import { Agency } from "../entites/Agency"
import {
    unlink, unlinkSync
} from "fs"
import  {
    uploadAnyImage,
    uploadDefaultPicture
} from "../../utils/uploadPicture"
import bcrypt from "bcrypt"
import  {
    validate
} from "class-validator"
import {
    body
} from "express-validator"
import { 
    LoginValidator
 } from "../dto/agency/loginValidator.dto"

 //utils modules
import jwtGenerator from "../../utils/generateJWT"
import cookieOption from "../../utils/cookiesOption"
import otpGenerator from "../../utils/otpGenerator"
import sendMailer from "../../utils/sendMail"
import jwtVerifier from "../../utils/verifyToken"
import fileDeleteHandler from "../../utils/deleteFileFromPublic"

//dto input validation  module
import {
    ForgoPasswordVerifyEmailValidator as VerifyEmailValidator,
    ForgoPasswordVerifyOtpValidator as OtpValidator,
    ForgoPasswordVerifyResetPasswordValidator as ResetPasswordValidator
} from "../dto/agency/forgotPassword.dto"
import {
    UpdateProfileValidator
} from "../dto/agency/updateProfile.dto"
import {
    ProfilePictureUpdateValidator
} from "../dto/agency/profilePictureUpdateValidator.dto"
import {
    UpdateCurrentPasswordValidator
} from "../dto/agency/updateCurrentPassword.dto"

//local type
type Body = (req: Request, res: Response, next: NextFunction) => Promise<void> //body type
type UploadFileReturn = {
    fileUrl: string,
    fileAddStatus: boolean
} //type declare for upload file return statement


//register a new agency 
const registerNewAgencyHandler:Body =  async (req, res, next) => {
    try {
        const registrationData:AgencyRegistration = req.body //take the data from body

        //validation part start from here
        const checkRegistrationData:AgencyRegistration | any = new AgencyRegistration();
        for (const property in req.body) {
            checkRegistrationData[property] = req.body[property]
        } //store all body data dynamically into the validation instance
        const isValidationError = await validate(checkRegistrationData) //validate the input data here
        if (isValidationError.length) { //if validation failed
            res.json ({
                message: isValidationError,
                status: 402
            })
        }else {
            //password and confirm password validation
            registrationData.password != registrationData.confirmPassword 
            &&
            (
                res.json ({
                    message: "Confirm Password does not match with password",
                    status: 406
                })
            )
            //validation part end here

            const checkAlreadyRegistered:Agency | null = await Agency.createQueryBuilder("agency")
                                                        .where("agency.email = :e", {e:registrationData.email })
                                                        .select (["agency.email"])
                                                        .getOne() //check that is there have any data available or not by email
            if (checkAlreadyRegistered) { //if user found
                res.json ({
                    message: "Email is already registered please try with another email",
                    status: 406
                })
            }else {
                const encryptedPassword:string  = await bcrypt.hash(registrationData.password, 10);
                const newAgency:Agency| any= await new Agency (); //create a instance of agency
                for (const property in registrationData) { //store the agency data dynamically
                    property != "confirmPassword" && (newAgency[property] = req.body[property])
                } //insert data into agency 
                newAgency.password = encryptedPassword //insert the encrypted password
                //upload the title pic part
                if (req.body.titlePic) { //if title picture provided
                    const {
                        fileAddStatus,
                        fileUrl
                    }:UploadFileReturn = await uploadAnyImage(req.body.titlePic, req.body.name)
                    fileAddStatus
                    ?
                    newAgency.titlePic = fileUrl //insert the picture url 
                    :
                    res.json ({
                        message: "Title picture upload failed please try again",
                        status: 406
                    })

                }else { //if title picture base 64 does not provide 
                    const {
                        fileUrl,
                        fileAddStatus
                    }:UploadFileReturn = await uploadDefaultPicture ("title", req.body.name)
                    fileAddStatus
                    ?
                    newAgency.titlePic = fileUrl //insert the picture url 
                    :
                    res.json ({
                        message: "Title default picture upload failed please try again",
                        status: 406
                    })
                }

                //upload the cover pic part
                if (req.body.coverPic) { //if title picture provided
                    const {
                        fileAddStatus,
                        fileUrl
                    }:UploadFileReturn = await uploadAnyImage(req.body.coverPic, req.body.name)
                    fileAddStatus
                    ?
                    newAgency.coverPic = fileUrl //insert the picture url 
                    :
                    res.json ({
                        message: "Cover picture upload failed please try again",
                        status: 406
                    })

                }else { //if title picture base 64 does not provide 
                    const {
                        fileUrl,
                        fileAddStatus
                    }:UploadFileReturn = await uploadDefaultPicture ("cover", req.body.name)
                    fileAddStatus
                    ?
                    newAgency.coverPic = fileUrl //insert the picture url 
                    :
                    res.json ({
                        message: "Cover default picture upload failed please try again",
                        status: 406
                    })
                }
                const saveNewAgency:Agency = await newAgency.save(); //save the agency here
                if (Object.keys(saveNewAgency).length) { //if agency successfully save
                    res.json ({
                        message: "Agency successfully saved",
                        status: 201
                    })
                }else {
                    res.json ({
                        message: "Agency failed to save",
                        status: 400
                    })
                }
            }
        } 
    }catch(err) {
        console.log(err)
        res.json ({ 
            message: "Internal Error!!",
            status: 406
        })
    }
}

//create login api 
const loginController: Body = async (req, res, next) => {
    try {
        // console.log(`It is heades`)
        //input data validation start
        const loginData:LoginValidator | any = new LoginValidator ()  //create a instance for validate the login input data
        for (const property in req.body) {
            loginData[property] = req.body[property]
        } //store all body data dynamically into the validation instance
        const isValidationError = await validate (loginData) //validate the login input data with
        if (isValidationError.length) { //if there have some body input error
            res.json ({ //if there have some validation error
                message: isValidationError,
                status: 402,
                agency: null
            })
        }else {
            const {
            emailOrAgentId,
            password:inputPassword
        }: {
            emailOrAgentId: string,
            password: string
        } = req.body 
        const findAgency:Agency| null = await Agency.createQueryBuilder("agency")
        .where ("agency.email = :e", { e: emailOrAgentId })
        .orWhere ("agency.agentID = :id", {id: emailOrAgentId})
        .select (
            [
                "agency.coverPic",
                "agency.titlePic",
                "agency.name",
                "agency.agentID",
                "agency.email",
                "agency.area",
                "agency.district",
                "agency.division",
                "agency.country",
                "agency.motive",
                "agency.password"
            ]
        )
        .getOne() //query by email and select only the email of that agency 
        // console.log(`Hello world`)
        // console.log(findAgency)
        if (findAgency) { //if find agency the it will happen
            const {password:databasePassword, agentID, email:agentEmail} = findAgency //get the database password 
            const isPasswordMatch:boolean = await bcrypt.compare (inputPassword, databasePassword)
            if (isPasswordMatch) { //if the password match
                const tokenData = {
                    id: agentID,
                    email: agentEmail
                } //auth toke data
                const tokenDeadLine:string = process.env.TOKE_EXPIRE_IN || "5d"
                const cookiesDeadline:number = +process.env.COOKIE_EXPIRE_IN! || 5
                const token:string = jwtGenerator (tokenData, tokenDeadLine)
                const optionForCookie = cookieOption (cookiesDeadline)
                const responseData:object = {
                    name: findAgency.name,
                    area: findAgency.area,
                    district: findAgency.district,
                    division: findAgency.division,
                    country:findAgency.country,
                    titlePic: findAgency.titlePic,
                    coverPic: findAgency.coverPic,
                    motive: findAgency.motive,
                    email: findAgency.email,
                    agentID: findAgency.agentID
                }
                res.cookie("auth",token,optionForCookie).json({
                    message: "Login Successfully!!",
                    agency: responseData,
                    status: 202
                })
            }else {
                res.json ({
                    message: "Password mismatch",
                    status: 406,
                    agency: null
                })
            }
        }else {
            res.json ({
                message: "Agency not found",
                status: 404,
                agency: null
            })
        }
    }
        //input data validation end 

        
    }catch (err) {
        console.log(err)
        res.json ({
            message: "Internal error!!",
            status: 406,
            agency: null
        })
    }
}

//forgot password part one (get the email and sent a 4 digits OTP and generate a new token and set into cookies)
const forgotPasswordVerifyEmail:Body = async (req, res) => {
    try {
        // console.log(`Hello`)
        //input validation part start
        const verifyEmailValidation:VerifyEmailValidator = new VerifyEmailValidator();
        verifyEmailValidation.email = req.body.email
        const hasErrorInValidation = await validate (verifyEmailValidation) //validate the data
        if (hasErrorInValidation.length) { //if error has found
            res.json ({
                message:hasErrorInValidation,
                status: 402
            })
        }else {
            const isValidEmail:Agency | null= await Agency.createQueryBuilder("agency")
            .where(`agency.email = :e`, {e:req.body.email})
            .select (["agency.agentID", "agency.email"])
            .getOne() //check that is there have any agency with that email
            if (isValidEmail) { //if user exists then it will happen
                const {email, agentID}:Agency = isValidEmail
                const otp = otpGenerator(+process.env.OTP_SEND_DIGIT! || 4) //generate a new otp 
                const {
                    message,
                    responseStatus
                } = await sendMailer ("", email, `Your one time verification code is ${otp}`, "Verify", "Admin")
                if (responseStatus) { //if message have successfully sent
                    const sendOTP = otp
                    const updateOTP = await Agency.createQueryBuilder("agency")
                    .update()
                    .set(
                        {
                            otp:sendOTP
                        }
                    )
                    .where(
                        `agency.email = :e`,
                        {
                            e:email
                        }
                    )
                    .andWhere (
                        `agency.agentID = :id`,
                        {
                            id: agentID
                        }
                    )
                    .execute() //update the otp field of that respective table
                    if (updateOTP.affected) { //if data updated then it will execute
                        const tokenData = {
                            id: agentID,
                            email
                        }
                        const otpExpireTime:string = process.env.OTP_EXPIRE_IN || "10m"
                        const createToken:string = jwtGenerator(tokenData,otpExpireTime )
                        const createCookieOption = cookieOption(+process.env.OTP_COOKIES_EXPIRE_IN! || 1)
                        res.cookie ("otp", createToken, createCookieOption).json ({
                            message,
                            status: 202
                        })
                    }else {
                        res.json ({
                            message: "Otp update failed please try again",
                            status: 406
                        })
                    }
                }
                // res.end()
            }else {
                res.json ({
                    message : "Agency not available with this email",
                    status: 404
                })
            }
        }

        // res.end()
    }catch(err) {
        console.log(err)
        res.json ({ 
            message: "Internal Error!!",
            status: 406
        })
    }
}

//forgot password part two (get the email and sent a 4 digits OTP and generate a new token and set into cookies)
const forgotPasswordVerifyOTP:Body = async (req, res) => {
    try {
        //input validation part start
        const verifyOtpValidation:OtpValidator = new OtpValidator();
        verifyOtpValidation.otp = req.body.otp //insert the otp here for validation
        const hasErrorInValidation = await validate (verifyOtpValidation) //validate the data
        if (hasErrorInValidation.length) { //if error has found
            res.json ({
                message:hasErrorInValidation,
                status: 402
            })
        }else {
            const {
                otp: token
            } = req.cookies
            if (token ){ //if cookie is valid
                const {
                    isVerify:cookieData
                } = await jwtVerifier(token)
                if (cookieData){ //if jwt token  is valid
                    const cookie:any =cookieData
                    const isValidEmail:Agency | null= await Agency.createQueryBuilder("agency")
                    .where(`agency.email = :e`, {e:cookie.email})
                    .andWhere ("agency.agentID = :id", {id:cookie.id })
                    .andWhere ("agency.otp = :otp", {otp:req.body.otp})
                    .select (["agency.agentID", "agency.email"])
                    .getOne() //check that is there have any agency with that email
                    if (isValidEmail) { //if user exists then it will happen
                        const {email, agentID}:Agency = isValidEmail
                        //delete the otp from that table 
                        const isDeleteOtp = await Agency.createQueryBuilder("agency")
                        .update()
                        .set(
                            {
                                otp: ""
                            }
                        )
                        .where (
                            `agency.agentID = :id`,
                            {
                                id: agentID
                            }
                        )
                        .andWhere (
                            `agency.email = :email`,
                            {
                                email
                            }
                        )
                        .execute() //update the otp field again
                        if (isDeleteOtp.affected) { //if successfully otp delete from the table 
                            res.json ({
                                message: "Otp successfully verified",
                                status: 202
                            })
                        }else {
                            res.json ({
                                message: "Otp successfully verified",
                                status: 202
                            })
                        }

                        // res.end()
                    }else {
                        res.json ({
                            message : "Agency not available with this email",
                            status: 404
                        })
                    }
                }else {
                    res.json ({
                        message: "OTP expired please try again",
                        status: 406
                    })
                }
            }else {
                res.json ({
                    message: "OTP expired please try again",
                    status: 406
                })
            }
        }

        // res.end()
    }catch(err) {
        console.log(err)
        res.json ({ 
            message: "Internal Error!!",
            status: 406
        })
    }
}
//forgot password part three (get the email and sent a 4 digits OTP and generate a new token and set into cookies)
const forgotPasswordResetPassword:Body = async (req, res) => {
    try {
        //input validation part start
        const verifyOtpValidation:ResetPasswordValidator = new ResetPasswordValidator();
        verifyOtpValidation.newPassword = req.body.newPassword //insert the otp here for validation
        const hasErrorInValidation = await validate (verifyOtpValidation) //validate the data
        if (hasErrorInValidation.length) { //if error has found
            res.json ({
                message:hasErrorInValidation,
                status: 402
            })
        }else if (req.body.newPassword != req.body.confirmPassword) { //compare the current password and confirm password
            res.json ({
                message:"Password and confirm password doesn't match",
                status: 402
            })
        }else {
             const {
                otp: token
            } = req.cookies
            if (token ){ //if cookie is valid
                const {
                    isVerify:cookieData
                } = await jwtVerifier(token)
                if (cookieData){ //if jwt token  is valid
                    const requestAgentData:any =cookieData
                    const encryptedPassword:string = await bcrypt.hash (req.body.newPassword, 10)
                    if (encryptedPassword) { //password has successfully hashed
                        const newPassword:string = encryptedPassword //new hashed password 
                        const resetPassword = await Agency.createQueryBuilder("agency")
                        .update ()
                        .set (
                            {
                                password: newPassword
                            }
                        )
                        .where (
                            `agency.agentID = :id`, 
                            {
                                id: requestAgentData.id
                            }
                        )
                        .execute() //reset the previous password and insert the update one
                        if (resetPassword.affected) { //if password has successfully reset
                            res.clearCookie("otp").json ({
                                message: "Password has successfully updated",
                                status: 202
                            })
                        }else {
                            res.json ({
                                message: "Password Reset Failed",
                                status: 406
                            })
                        }
                    }else {
                        res.json ({
                            message: "Password hashing failed",
                            status: 406
                        })
                    }
                }else {
                    res.json ({
                        message: "OTP expired please try again",
                        status: 406
                    })
                }
            }else {
                res.json ({
                    message: "OTP expired please try again",
                    status: 406
                })
            }
        }

        // res.end()
    }catch(err) {
        console.log(err)
        res.json ({ 
            message: "Internal Error!!",
            status: 406
        })
    }
}

//logout api 
const logoutController:Body = async (req, res) => {
    try {
        res.clearCookie("auth").json ({
            message: "Logout successfully",
            status: 202
        })
    }catch(err) {
        console.log(err)
        res.json ({ 
            message: "Internal Error!!",
            status: 406
        })
    }
} 

//check is logged in or not controller 
const checkIsLoggedInUser:Body = async (req, res) => {
    try {
        // const {
        //     auth:token
        // } = req.cookies //get the token from cookies
        if (Object.keys(req.user).length) { //if token have found from cookie name auth then it will execute
            // const user:any= jwtVerifier (token); // get the logged in user data
            // if (user) { //if data have found from jwt token then it will execute
            //     res.json ({
            //         message: "User logged in!!",
            //         status: 202,
            //     })
            // }else {
            //     res.json ({
            //         message: "User not logged in please login",
            //         status: 404
            //     })
            // }
            res.json ({
                message: "User logged in!!",
                status: 202,
                user: req.user
            })
        }else {
            res.json ({
                message: "User not logged in please login",
                status: 404,
                user: null
            })
        }
    }catch(err) {
        console.log(err)
        res.json ({ 
            message: "Internal Error!!",
            status: 406,
            user: null
        })
    }
} 

//logged in user can update profile 
const updateProfileController:Body = async (req, res) => {
    try {
        //input validation part start
        const verifyOtpValidation:UpdateProfileValidator | any = new UpdateProfileValidator(); //create a instance of dto class
        for (let property in req.body) {
            verifyOtpValidation[property] =  req.body[property]
        } //insert  the the input data dynamically into the new create dto instance for validate
        const hasErrorInValidation = await validate (verifyOtpValidation) //validate the data
        if (hasErrorInValidation.length) { //if error has found
            res.json ({
                message:hasErrorInValidation,
                status: 402
            })
        }else {
            const updateAgencyData = await Agency.createQueryBuilder("agency")
            .update()
            .set(req.body)
            .where(
                `agency.agentID = :id`,
                {
                    id: req.user.agentID
                }
            )
            .execute() //update the body data according to the body data 
            if (updateAgencyData.affected) {
                res.json ({
                    message: "Agency has updated successfully",
                    status: 202
                })
            }else {
                res.json ({
                    message: "Agency update failed",
                    status: 406
                })
            }
        }
    }catch(err) {
        console.log(err)
        res.json ({ 
            message: "Internal Error!!",
            status: 406
        })
    }
}

//update title or cover pic 
const updateProfileOrCoverPicture:Body = async (req, res) => {
    try {
        //input validation part start
        const verifyProfilePictureUpdateInput:ProfilePictureUpdateValidator | any = new ProfilePictureUpdateValidator(); //create a instance of dto class
        for (let property in req.body) {
            verifyProfilePictureUpdateInput[property] =  req.body[property]
        } //insert  the the input data dynamically into the new create dto instance for validate
        const hasErrorInValidation = await validate (verifyProfilePictureUpdateInput) //validate the data
        if (hasErrorInValidation.length) { //if error has found
            res.json ({
                message:hasErrorInValidation,
                status: 402
            })
        }else {
            const {
                uploadType,
                base64: uploadImageBase64
            }:ProfilePictureUpdateValidator = req.body
            const {
                fileAddStatus,
                fileUrl
            } = await uploadAnyImage(uploadImageBase64, req.user.name) //upload the image here
            if (fileAddStatus) { //if image upload successfully
                const findCurrentPictureData: Agency | null = await Agency.createQueryBuilder("agency")
                .where (
                    `agency.agentID = :id`,
                    {
                        id: req.user.agentID
                    }
                )
                .andWhere (
                    `agency.isDelete = :del`,
                    {
                        del: req.user.isDelete
                    }
                )
                .select (
                    [
                        "agency.titlePic",
                        "agency.coverPic"
                    ]
                )
                .getOne();
                let previousLink: string | null = null; //store the current url of the database's picture
                const updateAgency = await Agency.createQueryBuilder("agency") //update the cover and profile picture dynamically
                .update()
                .where (
                    `agency.agentID = :id`,
                    {
                        id: req.user.agentID
                    }
                )
                .andWhere (
                    `agency.isDelete = :del`,
                    {
                        del: req.user.isDelete
                    }
                )
                if (uploadType.toLocaleLowerCase() == "cover" ){ //find the current cover pic url from database
                    updateAgency
                    .set(
                        {
                            coverPic: fileUrl
                        }
                    )
                    
                    previousLink = findCurrentPictureData!.coverPic ! //store the previous picture url 

                } else if (uploadType.toLocaleLowerCase() == "title"){ //find the current title pic url from database
                    updateAgency
                    .set(
                        {
                            titlePic: fileUrl
                        }
                    )
                    
                    previousLink = findCurrentPictureData!.titlePic ! //store the previous picture url 
                }  
                await updateAgency.execute() //it will execute all element after did all operation
                if (updateAgency) { //if successfully updated then it will happen
                    const currentFileName:string = previousLink?.split("/")[3] !
                    const isNotDelete = await fileDeleteHandler (currentFileName)
                    // console.log({updateAgency})
                    // const findCurrentUser = await Agency.createQueryBuilder ("agency")
                    // .where (
                    //     `agency.agentID = :id`, 
                    //     {
                    //         id: req.user.agentID
                    //     }
                    // )
                    // .getOne()
                    // console.log({findCurrentUser})
                    // console.log(isNotDelete)
                    if (!isNotDelete) { //if file delete from public folder
                        res.json ({
                            message: `${uploadType} has been updated successfully`,
                            status: 202
                        })
                    }else {
                        res.json ({
                            message: "Data delete failed from public folder",
                            status: 406
                        })
                    }
                    res.end()
                }else {
                    res.json ({
                        message: `${uploadType} update failed`,
                        status: 406
                    })
                }
            }else {
                res.json ({
                    message: "Image upload failed please try again",
                    status: 406
                })
            }
        }
    }catch(err) {
        console.log(err)
        res.json ({ 
            message: "Internal Error!!",
            status: 406
        })
    }
}

//update current password of a logged in user 
const updateCurrentPasswordController:Body = async (req, res) => {
    try {
        //input validation part start
        const verifyCurrentPasswordInput:UpdateCurrentPasswordValidator  = new UpdateCurrentPasswordValidator(); //create a instance of dto class
        verifyCurrentPasswordInput.newPassword = req.body.newPassword
        const hasErrorInValidation = await validate (verifyCurrentPasswordInput) //validate the data
        if (hasErrorInValidation.length) { //if error has found
            res.json ({
                message:hasErrorInValidation,
                status: 402
            })
        }else  if (req.body.newPassword !== req.body.confirmPassword) { //check the password and confirm password field
            res.json ({
                message: "Password and confirm password do not match",
                status: 402
            })
        }else {
            const {
                newPassword
            }:UpdateCurrentPasswordValidator = req.body
            const encryptedCurrentPassword:string = await bcrypt.hash(newPassword, 10)
            const isUpdatePassword = await Agency.createQueryBuilder("agency")
            .update()
            .set(
                {
                    password: encryptedCurrentPassword
                }
            )
            .where (
                `agency.agentID = :id`,
                {
                    id: req.user.agentID
                }
            )
            .execute() //update the new password 
            if (isUpdatePassword.affected) { //if password successfully updated
                res.json ({
                    message: "Password has successfully updated",
                    status: 202
                })
            }else {
                res.json ({
                    message: "Password update failed",
                    status: 406
                })
            }
        }
    }catch(err) {
        console.log(err)
        res.json ({ 
            message: "Internal Error!!",
            status: 406
        })
    }
}

//show own profile 


export {
    registerNewAgencyHandler,
    loginController,
    forgotPasswordVerifyEmail,
    forgotPasswordVerifyOTP,
    forgotPasswordResetPassword,
    logoutController,
    checkIsLoggedInUser,
    updateProfileController,
    updateProfileOrCoverPicture,
    updateCurrentPasswordController
}
