import { IsDefined, IsEmail, IsNumber, IsOptional, isString, IsString, Matches, Validate, ValidateIf } from "class-validator"

export class UpdateProfileValidator {
    @IsNumber()
    @IsOptional()
    public agentID !: number // agent ID

    @IsOptional()
    @IsString({
        message: "Password must be string"
    })
    @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/, {message: "Password pattern not match"})
    @IsEmail()
    public email !: string // email or user id

    @IsOptional()
    @IsString({
        message: "Area must be string"
    })
    public area !: string // area

    @IsOptional()
    @IsString({
        message: "District must be string"
    })
    public district !: string // district

    @IsOptional()
    @IsString({
        message: "Division must be string"
    })
    public division !: string // division

    @IsOptional()
    @IsString({
        message: "Country must be string"
    })
    public country !: string // country

    @IsOptional()
    @IsString({
        message: "Motive must be string"
    })
    public motive !: string // motive
}