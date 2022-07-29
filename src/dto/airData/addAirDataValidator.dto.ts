import {IsArray, IsDefined, IsEmail, IsNumber, IsOptional, isString, IsString, IS_ENUM, Matches, Validate, ValidateIf } from "class-validator"

class AirtDataRawValidator {
    
    @IsDefined({
        message: "Area Required!!"
    })
    @IsString({
        message: "Area need to be string!!"
    })
    public area !: string 

    @IsDefined({
        message: "District Required!!"
    })
    @IsString({
        message: "District need to be string!!"
    })
    public district !: string 


    @IsDefined({
        message: "Division Required!!"
    })
    @IsString({
        message: "Division need to be string!!"
    })
    public division !: string 


    @IsDefined({
        message: "Country Required!!"
    })
    @IsString({
        message: "Country need to be string!!"
    })
    public country !: string 

    @IsDefined({
        message: "Value of PM2.5 Required!!"
    })
    @IsString({
        message: "Value of PM2.5 need to be string!!"
    })
    public valueOfPM !: string 

    @IsDefined({
        message: "Published Date  Required!!"
    })
    @IsString({
        message: "Published Date need to be string!!"
    })
    public publishedDate !: string 
}

export class AddAirtDataValidator {
    @IsString({
        message: "Upload format should be string"
    })
    @IsDefined({
        message: "Upload format required!!!"
    })
    public uploadFormat !: string // manual or csv !!!

    @IsOptional()
    @IsString({
        message: "CSV format need to be string"
    })
    public csvBase64 !: string 
    
    @IsOptional()
    @IsArray({
        message: "CSV format need to be Array"
    })
    public airData?: AirtDataRawValidator[] 
}

