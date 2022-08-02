import {IsAlpha, IsArray, IsDefined, IsEmail, IsNotEmpty, IsNumber, IsOptional, isString, IsString, IS_ENUM, Matches, Validate, ValidateIf } from "class-validator"

class AirtDataRawValidator {
    @IsDefined({
        message: "Division Required!!"
    })
    @IsString({
        message: "Division need to be string!!"
    })
    public division !: string  //data 1

    @IsDefined({
        message: "Value of PM2.5 Required!!"
    })
    @IsString({
        message: "Value of PM2.5 need to be string!!"
    })
    public valueOfPM !: string   //data 2

    @IsDefined({
        message: "Published Date  Required!!"
    })
    @IsString({
        message: "Published Date need to be string!!"
    })
    public publishedDate !: string   //data 3

    @IsDefined({
        message: "Average temperature  Required!!"
    })
    @IsNumber()
    public avgTemp !: number   //data 4

    @IsDefined({
        message: "Rain Precipitation temperature  Required!!"
    })
    @IsNumber()
    public rainPrecipitation !: number   //data 5
    
    @IsDefined({
        message: "Visibility Required!!"
    })
    @IsNumber()
    public visibility !: number   //data 6


    @IsDefined({
        message: "Cloud cover Required!!"
    })
    @IsNumber()
    public cloudCover !: number   //data 7

    @IsDefined({
        message: "Relative humidity required!!"
    })
    @IsNumber()
    public relHumidity !: number   //data 8

    @IsString({
        message: "Season must be string!!!"
    })
    @IsDefined({
        message: "Season name required!!!"
    })
    public season!: string //data 9

    @IsNotEmpty({
        message: "Station No  missing!!!"
    })
    @IsAlpha()
    public stationNo !: number //data 10

    @IsNotEmpty({
        message: "Wind Speed value is missing!!!"
    })
    @IsAlpha()
    public windSpeed !: number //data 11
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

