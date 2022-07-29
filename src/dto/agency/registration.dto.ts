import { IsDefined, IsEmail, IsOptional, IsString, Matches, Validate, ValidateIf } from "class-validator"
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

export class AgencyRegistration {
    @IsString({
        message: "Name must be string"
    })
    @IsDefined ({
        message: "Name required!!!"
    })
    public name!: string // one

    @IsString({
        message: "Cover picture must be string"
    })
    @IsOptional()
    public coverPic !: string  //two

    @IsString({
        message: "Cover picture must be string"
    })
    @IsOptional()
    public titlePic !: string  //three

    @IsString({
        message: "Country must be string"
    })
    @IsDefined ({
        message: "Country required!!!"
    })
    public country !: string //four

    @IsString({
        message: "District must be string"
    })
    @IsDefined ({
        message: "District required!!!"
    })
    public district !: string //five

    @IsString({
        message: "Division must be string"
    })
    @IsDefined ({
        message: "Division required!!!"
    })
    public division !: string //six

    @IsString({
        message: "Area must be string"
    })
    @IsDefined ({
        message: "Area required!!!"
    })
    public area !: string //seven

    @IsString({
        message: "Password must be string"
    })
    @IsDefined ({
        message: "Password required!!!"
    })
    @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/, {message: "Password pattern not match"})
    @Validate(PasswordValidation, [passwordRequirement])
    public password !: string  //eight //password contains at least 8 char and at least one upper case and one lowercase
    
    @IsString({
        message: "Confirm Password must be string"
    })
    @IsDefined ({
        message: "Confirm Password required!!!"
    })
    // @Matches("password")
    // @ValidateIf((o) => o.confirmPassword == o.password)
    public confirmPassword !: string  //nine

    @IsString({
        message: "Email must be string"
    })
    @IsDefined ({
        message: "Email required!!!"
    })
    @Matches(/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/, {message: "Email validation failed"})
    @IsEmail({}, {message: "Email is not valid please enter a valid one!!!"})
    public email !: string  //ten

    @IsString({
        message: "Motive must be string"
    })
    @IsDefined ({
        message: "Motive required!!!"
    })
    public motive !: string //eleven
}