import { IsDefined, IsEmail, IsOptional, isString, IsString, Matches, Validate, ValidateIf } from "class-validator"


export class ProfilePictureUpdateValidator {
    @IsDefined ({
        message: "base64 data required"
    })
    @IsString()
    base64 !: string // email or user id
    
    @IsDefined ({
        message: "userId or email required"
    })
    @IsString()
    uploadType !: string // upload type // cover or title
}