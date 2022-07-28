import {
    Router,
    Request
} from "express"
import {
    registerNewAgencyHandler,
    loginController,
    forgotPasswordVerifyEmail,
    forgotPasswordVerifyOTP,
    forgotPasswordResetPassword,
    logoutController,
    checkIsLoggedInUser
} from "../controller/agency"
import auth from "../../middleware/auth"

const route = Router();

//post route
route.post ("/registration",registerNewAgencyHandler)
route.post ("/login",loginController)
route.post ("/forgotPassword/verifyEmail",forgotPasswordVerifyEmail)
route.post ("/forgotPassword/verifyOtp",forgotPasswordVerifyOTP)
route.post ("/forgotPassword/resetPassword",forgotPasswordResetPassword)

//get route 
route.get ("/logout", auth, logoutController)
route.get ("/check/loggedIn/session", checkIsLoggedInUser)

export default route

