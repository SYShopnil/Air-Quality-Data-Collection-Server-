import { IsDefined, IsEmail, IsOptional, isString, IsString, Length, Matches, Max, Min, Validate, ValidateIf } from "class-validator"


export class ForgoPasswordVerifyEmailValidator {
    @IsDefined ({
        message: "email required!!!"
    })
    @IsEmail()
    @IsString()
    email !: string // email
}

export class ForgoPasswordVerifyOtpValidator {
    @IsDefined ({
        message: "otp required!!!"
    })
    @IsString()
    @Length(+process.env.OTP_SEND_DIGIT! || 4, +process.env.OTP_SEND_DIGIT! || 4)
    otp !: string // email
}

export class ForgoPasswordVerifyResetPasswordValidator {
    @IsDefined ({
        message: "Password required!!!"
    })
    @IsString()
     @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/, {message: "Password pattern not match"})
    newPassword !: string // email
}