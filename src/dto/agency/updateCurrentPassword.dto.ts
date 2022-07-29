import { IsDefined, IsEmail, IsOptional, isString, IsString, Matches, Validate, ValidateIf } from "class-validator"
import {
    PasswordValidation,
    PasswordValidationRequirement
} from "class-validator-password-check"

const passwordRequirement: PasswordValidationRequirement = {
    mustContainLowerLetter: true,
    mustContainNumber: true,
    mustContainSpecialCharacter: true,
    mustContainUpperLetter: true
}

export class UpdateCurrentPasswordValidator {
    @IsString({
        message: "Password must be string"
    })
    @IsDefined ({
        message: "Password required!!!"
    })
    @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/, {message: "Password pattern not match"})
    @Validate(PasswordValidation, [passwordRequirement])
    public newPassword !: string  //eight //password contains at least 8 char and at least one upper case and one lowercase and at least one special character
}