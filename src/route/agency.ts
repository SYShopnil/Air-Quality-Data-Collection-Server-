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
    checkIsLoggedInUser,
    updateProfileController,
    updateProfileOrCoverPicture,
    updateCurrentPasswordController
} from "../controller/agency"
import auth from "../../middleware/auth"

const route = Router();

//post route
route.post ("/registration",registerNewAgencyHandler)
route.post ("/login",loginController)
route.post ("/forgotPassword/verifyEmail",forgotPasswordVerifyEmail)
route.post ("/forgotPassword/verifyOtp",forgotPasswordVerifyOTP)
route.post ("/forgotPassword/resetPassword", forgotPasswordResetPassword)


//put route
route.put ("/profile/update", auth, updateProfileController)
route.put ("/profile/picture/update", auth, updateProfileOrCoverPicture)
route.put ("/password/update", auth, updateCurrentPasswordController)

//get route 
route.get ("/check/loggedIn/session", auth, checkIsLoggedInUser)
route.get ("/logout", auth, logoutController)

export default route


