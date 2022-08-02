import {IsAlpha, IsArray, IsDefined, IsEmail, IsEmpty, IsNotEmpty, IsNumber, IsOptional, isString, IsString, IS_ENUM, Matches, Validate, ValidateIf } from "class-validator"

class DailyAirtDataRawValidator {
    @IsDefined()
    @IsEmpty({
        always: true,
        message: "Area required!!!"
    })
    @IsAlpha()
    public area !: string //data - 1

     @IsDefined({
        message: "latitude missing!!!"
    })
    @IsAlpha()
    public latitude!: number ///data - 2
    
    @IsDefined({
        message: "longitude missing!!!"
    })
    @IsAlpha()
    public longitude!: number ///data - 3

    @IsDefined({
        message: "Median missing!!!"
    })
    @IsAlpha()
    public median !: number //data - 4

    @IsDefined({
        message: "Mean missing!!!"
    })
    @IsAlpha()
    public mean !: number //data - 5

     @IsDefined({
        message: "Max value missing!!!"
    })
    @IsAlpha()
    public max !: number //data - 6 

    @IsDefined({
        message: "Count value missing!!!"
    })
    @IsAlpha()
    public count !: number //data - 7 

    @IsDefined({
        message: "Sum value missing!!!"
    })
    @IsAlpha()
    public sum !: number //data - 8
    
    @IsDefined({
        message: "Published date required!!!"
    })
    public publishedDate !: string //data-9
}

export class DailyAddAirtDataValidator {
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
    public airData?: DailyAirtDataRawValidator[] 
}

