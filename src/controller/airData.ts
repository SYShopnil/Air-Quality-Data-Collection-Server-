import { NextFunction, Request, Response } from "express"
import { AgencyRegistration } from "../dto/agency/registration.dto"
import { Agency } from "../entites/Agency"
import { AirData } from "../entites/AirData"
import { DailyAirData } from "../entites/DailyAirData"
import {
    unlink, unlinkSync
} from "fs"
import  {
    uploadAnyImage,
    uploadDefaultPicture
} from "../../utils/uploadPicture"
import bcrypt from "bcrypt"
import  {
    validate
} from "class-validator"

//utils modules
import jwtGenerator from "../../utils/generateJWT"
import cookieOption from "../../utils/cookiesOption"
import otpGenerator from "../../utils/otpGenerator"
import sendMailer from "../../utils/sendMail"
import jwtVerifier from "../../utils/verifyToken"
import fileDeleteHandler from "../../utils/deleteFileFromPublic"
import findAirQuality from "../../utils/detectTheAirQuality"

//dto input validation  module
import {
    AddAirtDataValidator
} from "../dto/airData/addAirDataValidator.dto"

import {
    DailyAddAirtDataValidator
} from "../dto/airData/addDailyAirDataValidator.dto"
import readCsvDataHandler from "../../utils/readCsvData"
import { Brackets, SelectQueryBuilder } from "typeorm"

//local type
type Body = (req: Request, res: Response, next: NextFunction) => Promise<void> //body type
type UploadFileReturn = {
    fileUrl: string,
    fileAddStatus: boolean
} //type declare for upload file return statement

//add a new data
const addNewAirDataController:Body =  async (req, res, next) => {
    try {
        const newAirDataBodyInput:AddAirtDataValidator = req.body //take the data from body
        //validation part start from here
        const checkRegistrationData:AddAirtDataValidator | any = new AddAirtDataValidator();
        for (const property in req.body) {
            checkRegistrationData[property] = req.body[property]
        } //store all body data dynamically into the validation instance
        const isValidationError = await validate(checkRegistrationData) //validate the input data here
        // console.log(req.body)
        if (isValidationError.length) { //if validation failed
            res.json ({
                message: isValidationError,
                status: 406
            })
        }else  {
            // console.log (`Hello I am from air data creation`)
            let myData:any[] = [];
            if (newAirDataBodyInput.uploadFormat.toLocaleLowerCase() == "csv"){
                const {
                    csvBase64
                } = newAirDataBodyInput
                const {
                    fileAddStatus,
                    fileUrl
                } = await uploadAnyImage(csvBase64, req.user.name, "","csv")
                if (fileAddStatus){ //if csv file successfully save 
                    const uploadFileName:string =  fileUrl.split("/")[3] //upload that file 
                    const csvRawData = await readCsvDataHandler (uploadFileName) //get the data from the just upload csv file 
                    if (csvRawData.length) { //if csv raw data have been found 
                        myData = csvRawData
                        //delete the uploaded file 
                        const hasDeleteError = await fileDeleteHandler(uploadFileName) //delete the uploaded csv file from public folder
                        if (hasDeleteError) {
                            res.json ({
                                message: "CSV file delete failed from the server",
                                status: 406
                            })
                        }
                    }else {
                        res.json ({
                            message: "Csv file parsing failed",
                            status: 404
                        })
                    }
                }else {
                    res.json ({
                        message: "Csv File upload failed to the server",
                        status: 406
                    })
                }
            }else if (newAirDataBodyInput.uploadFormat.toLocaleLowerCase() == "manual") {
               myData = req.body.airData
            }
            const findAgency = await Agency.createQueryBuilder("agency")
            .where (
                `agency.agentID = :id`,
                {
                    id: req.user.agentID
                }
            )
            .getOne()
            //add publisher name now 
            myData.forEach ((rawData:string, index:number) => {
                myData[index]["publishedBy"] = findAgency
            })
            console.log(myData[0].publishedDate)
            const saveAirData = await AirData.createQueryBuilder("airData")
            .insert()
            .into (AirData)
            .values (myData)
            .execute()
            // console.log(myData)
            // // const saveAirData = 
            if (saveAirData.raw.affectedRows) { //if air data successfully saved
                res.json ({
                    message: "New Air Data collected!!",
                    status: 201
                })
            }else {
                res.json ({
                    message: "New Air Data failed to collect please try again",
                    status: 406
                })
            }
            // // res.end()
        } 
    }catch(err) {
        console.log(err)
        res.json ({ 
            message: "Internal Error!!",
            status: 406
        })
    }
}

//get all logged in agency input air data 
const getLoggedInAgencyInputAirData:Body =  async (req, res, next) => {
    try {
        type bodyInput = {
            sortBy?: string,
            searchBy?: string,
            pageNo?: string,
            dataLimit: number,
        }
        
        const {
            sortBy,
            searchBy,
            pageNo,
            dataLimit
        }:bodyInput = req.body; 
        const limit:number = dataLimit || 5 //set the data limit
        const currentPageNo:string | number = pageNo || 1
        const query = await AirData.createQueryBuilder ("airData")
         .select (
            [
                "airData.dataId",
                "airData.division",
                "airData.valueOfPM",
                "airData.publishedDate",
                "airData.rainPrecipitation",
                "airData.visibility",
                "airData.cloudCover",
                "airData.relHumidity",
                "airData.stationNo",
                "airData.season",
                "airData.windSpeed"
            ]
         )
         .leftJoin ("airData.publishedBy", "published")//make the query interface

        // sorting filter
        if (sortBy) {
            if (sortBy == "latest") {
                query.orderBy ("airData.createAt", "DESC")
            }else if (sortBy.toLowerCase() == "a-z") {
                query.orderBy ("airData.division", "ASC")
            }else if (sortBy.toLowerCase() == "z-a") {
                query.orderBy ("airData.division", "DESC")
            }
        }else {
            query.orderBy ("airData.createAt", "DESC") //by default option 
        }
        
        //searching option 
        if (searchBy) {
            query.andWhere (
                new Brackets ((qb) => {
                    qb.where ( //search by data id
                        `airData.dataId like :id`,
                        {
                            id: `%${searchBy}%`
                        }
                    ).orWhere ( //search by division
                        `airData.division like :division`,
                        {
                            division: `%${searchBy}%`
                        }
                    ).orWhere ( //search by pm 2.5 value
                        `airData.valueOfPM like :valueOfPM`,
                        {
                            valueOfPM: `%${searchBy}%`
                        }
                    )
                })
            )
        }

        query.andWhere (
            `published.agentID = :id`, 
            {
                id: req.user.agentID
            }
         ) //only got the logged in user data //common query
        query.andWhere (
            `airData.isDelete = :del`, 
            {
                del : false
            }
        ) //get only those whose are not deleted
         //pagination part start
        const totalDataFound:number = await query.getCount(); //get the total found data 
        const pageNeed = (Math.floor(totalDataFound / limit)) + 1 //total page need for this query 
        const skipData = (+currentPageNo * limit) - limit //this amount of data will be skip 
        query.limit(limit).offset(skipData) //for pagination 
        
        //finally get all data with all query
        const getAllData = await query.getMany(); //finally get all data
        
        if (getAllData.length) { //if query data has found 
            res.json ({
                message: `${getAllData.length} data has found`,
                pageNeed,
                status: 202,
                airData: getAllData
            })
        }else {
            res.json ({
                message: `No data has found!!!`,
                pageNeed: null,
                status: 404,
                airData: null
            })
        }
    }catch(err) {
        console.log(err)
        res.json ({ 
            message: "Internal Error!!",
            pageNeed: null,
            status: 406,
            airData: null
        })
    }
}

//update air data by using agent id 
const updateAirDataById:Body =  async (req, res, next) => {
    try {
        const reqAirDataId:string = req.params.id  
        const updateAirData = await AirData.createQueryBuilder("airData")
        .leftJoin (
            `airData.publishedBy`,
            "publishedBy"
        )
        .where (
            `airData.dataId = :airDataId`,
            {
                airDataId: reqAirDataId
            }
        )
        .andWhere(
            `publishedBy.agentID = :agentID`,
            {
                agentID: req.user.agentID
            }
        )
        .update()
        .set (req.body)
        .execute()
        // console.log(updateAirData)
        if (updateAirData.affected) { //if successfully updated
            res.json ({
                message: "Update successfully!!!",
                status: 202
            })
        }else {
            res.json ({
                message: "Update Failed!!!",
                status: 406
            })
        }
    }catch(err) {
        console.log(err)
        res.json ({ 
            message: "Internal Error!!",
            pageNeed: null,
            status: 406,
            airData: null
        })
    }
}

//delete air data by using agent id 
const deleteAirDataById:Body =  async (req, res, next) => {
    try {
        const reqAirDataId:string = req.params.id 
        const updateAirData = await AirData.createQueryBuilder("airData")
        .leftJoin (
            `airData.publishedBy`,
            "publishedBy"
        )
        .update()
        .set(
            {
                isDelete: true
            }
        )
        .where (
            `airData.dataId = :airDataId`,
            {
                airDataId: reqAirDataId
            }
        )
        .andWhere(
            `publishedBy.agentID = :agentID`,
            {
                agentID: req.user.agentID
            }
        )
        .andWhere (
            `airData.isDelete = :del`, 
            {
                del :false
            }
        )
        .execute()
        // console.log(updateAirData)
        if (updateAirData.affected) { //if successfully updated
            res.json ({
                message: "Delete successfully!!!",
                status: 202
            })
        }else {
            res.json ({
                message: "Delete Failed!!!",
                status: 406
            })
        }
    }catch(err) {
        console.log(err)
        res.json ({ 
            message: "Internal Error!!",
            pageNeed: null,
            status: 406,
            airData: null
        })
    }
}


//add a new daily data
const addNewAirDailyDataController:Body =  async (req, res, next) => {
    try {
        const newAirDataBodyInput:DailyAddAirtDataValidator = req.body //take the data from body
        //validation part start from here
        const checkRegistrationData:DailyAddAirtDataValidator | any = new DailyAddAirtDataValidator();
        for (const property in req.body) {
            checkRegistrationData[property] = req.body[property]
        } //store all body data dynamically into the validation instance
        const isValidationError = await validate(checkRegistrationData) //validate the input data here
        if (isValidationError.length) { //if validation failed
            res.json ({
                message: isValidationError,
                status: 406
            })
        }else  {
            let myData:any[] = [];
            if (newAirDataBodyInput.uploadFormat.toLocaleLowerCase() == "csv"){
                const {
                    csvBase64
                } = newAirDataBodyInput
                const {
                    fileAddStatus,
                    fileUrl
                } = await uploadAnyImage(csvBase64, req.user.name, "","csv")
                if (fileAddStatus){ //if csv file successfully save 
                    const uploadFileName:string =  fileUrl.split("/")[3] //upload that file 
                    const csvRawData = await readCsvDataHandler (uploadFileName) //get the data from the just upload csv file 
                    console.log(csvRawData)
                    if (csvRawData.length) { //if csv raw data have been found 
                        myData = csvRawData
                        //delete the uploaded file 
                        const hasDeleteError = await fileDeleteHandler(uploadFileName) //delete the uploaded csv file from public folder
                        if (hasDeleteError) {
                            res.json ({
                                message: "CSV file delete failed from the server",
                                status: 406
                            })
                        }
                    }else {
                        res.json ({
                            message: "Csv file parsing failed",
                            status: 404
                        })
                    }
                }else {
                    res.json ({
                        message: "Csv File upload failed to the server",
                        status: 406
                    })
                }
            }else if (newAirDataBodyInput.uploadFormat.toLocaleLowerCase() == "manual") {
                // console.log(req.body.airData)
               myData = req.body.airData
            }
            const findAgency = await Agency.createQueryBuilder("agency")
            .where (
                `agency.agentID = :id`,
                {
                    id: req.user.agentID
                }
            )
            .getOne()
            //add publisher name now 
            myData.forEach ((rawData:string, index:number) => {
                myData[index]["publishedBy"] = findAgency
            })
            // console.log({myData})
            //now data saving process will be start 
            const saveAirData = await DailyAirData.createQueryBuilder("dailyAirData")
            .insert()
            .values (myData)
            .execute()
            // const saveAirData = 
            if (saveAirData.raw.affectedRows) { //if air data successfully saved
                res.json ({
                    message: "New Daily Air Data collected!!",
                    status: 201
                })
            }else {
                res.json ({
                    message: "New Daily Air Data failed to collect please try again",
                    status: 406
                })
            }
            // res.end()
        } 
    }catch(err) {
        console.log(err)
        res.json ({ 
            message: "Internal Error!!",
            status: 406
        })
    }
}

//get all logged in agency input daily air data 
const getLoggedInAgencyInputDailyAirData:Body =  async (req, res, next) => {
    try {
        type bodyInput = {
            sortBy?: string,
            searchBy?: string,
            pageNo?: string,
            dataLimit: number,
        }
        
        const {
            sortBy,
            searchBy,
            pageNo,
            dataLimit
        }:bodyInput = req.body; 
        const limit:number = dataLimit || 5 //set the data limit
        const currentPageNo:string | number = pageNo || 1
        const query = await DailyAirData.createQueryBuilder ("dailyAirData")
         .select (
            [
                "dailyAirData.area",
                "dailyAirData.publishedDate",
                "dailyAirData.median",
                "dailyAirData.mean",
                "dailyAirData.max",
                "dailyAirData.sum",
                "dailyAirData.count",
                "dailyAirData.dataId"
            ]
         )
         .leftJoin ("dailyAirData.publishedBy", "published")//make the query interface

        // sorting filter
        if (sortBy) {
                if (sortBy == "latest") {
                    query.orderBy ("dailyAirData.createAt", "DESC")
                }else if (sortBy.toLowerCase() == "bymedian") { //sort by median
                    query.orderBy ("dailyAirData.median", "DESC")
                }else if (sortBy.toLowerCase() == "bymean") { //sort by mean
                    query.orderBy ("dailyAirData.mean", "DESC")
                }else if (sortBy.toLowerCase() == "bymax") { //sort by max
                    query.orderBy ("dailyAirData.max", "DESC")
                }else if (sortBy.toLowerCase() == "bysum") { //sort by sum
                    query.orderBy ("dailyAirData.sum", "DESC")
                }else if (sortBy.toLowerCase() == "bycount") { //sort by count
                    query.orderBy ("dailyAirData.count", "DESC")
            }else {
                query.orderBy ("dailyAirData.createAt", "DESC") //by default option 
            }
        }
        //searching option 
        if (searchBy) {
            // console.log(searchBy)
            query.andWhere (
                new Brackets ((qb) => {
                    qb.where ( //search by data id
                        `dailyAirData.dataId like :id`,
                        {
                            id: `%${searchBy}%`
                        }
                    ).orWhere ( //search by pm 2.5 value
                        `dailyAirData.area like :searchArea`,
                        {
                            searchArea: `%${searchBy}%`
                        }
                    )
                })
            )
        }

        query.andWhere (
            `published.agentID = :id`, 
            {
                id: req.user.agentID
            }
         ) //only got the logged in user data //common query
        query.andWhere (
            `dailyAirData.isDelete = :del`, 
            {
                del : false
            }
        ) //get only those whose are not deleted
         //pagination part start
        const totalDataFound:number = await query.getCount(); //get the total found data 
        const pageNeed = (Math.floor(totalDataFound / limit)) + 1 //total page need for this query 
        const skipData = (+currentPageNo * limit) - limit //this amount of data will be skip 
        query.limit(limit).offset(skipData) //for pagination 
        
        //finally get all data with all query
        const getAllData = await query.getMany(); //finally get all data
        
        if (getAllData.length) { //if query data has found 
            res.json ({
                message: `${getAllData.length} data has found`,
                pageNeed,
                status: 202,
                airData: getAllData
            })
        }else {
            res.json ({
                message: `No data has found!!!`,
                pageNeed: null,
                status: 404,
                airData: null
            })
        }
    }catch(err) {
        console.log(err)
        res.json ({ 
            message: "Internal Error!!",
            pageNeed: null,
            status: 406,
            airData: null
        })
    }
}

//update daily air data by using agent id 
const updateDailyAirDataById:Body =  async (req, res, next) => {
    try {
        const reqAirDataId:string = req.params.id  
        const updateAirData = await DailyAirData.createQueryBuilder("dailyAirData")
        .leftJoin (
            `dailyAirData.publishedBy`,
            "publishedBy"
        )
        .where (
            `dailyAirData.dataId = :airDataId`,
            {
                airDataId: reqAirDataId
            }
        )
        .andWhere(
            `publishedBy.agentID = :agentID`,
            {
                agentID: req.user.agentID
            }
        )
        .update()
        .set (req.body)
        .execute()
        // console.log(updateAirData)
        if (updateAirData.affected) { //if successfully updated
            res.json ({
                message: "Update successfully!!!",
                status: 202
            })
        }else {
            res.json ({
                message: "Update Failed!!!",
                status: 406
            })
        }
    }catch(err) {
        console.log(err)
        res.json ({ 
            message: "Internal Error!!",
            pageNeed: null,
            status: 406,
            airData: null
        })
    }
}

//delete daily air data by using agent id 
const deleteDailyAirDataById:Body =  async (req, res, next) => {
    try {
        const reqAirDataId:string = req.params.id 
        const updateAirData = await DailyAirData.createQueryBuilder("dailyAirData")
        .leftJoin (
            `dailyAirData.publishedBy`,
            "publishedBy"
        )
        .update()
        .set(
            {
                isDelete: true
            }
        )
        .where (
            `dailyAirData.dataId = :airDataId`,
            {
                airDataId: reqAirDataId
            }
        )
        .andWhere(
            `publishedBy.agentID = :agentID`,
            {
                agentID: req.user.agentID
            }
        )
        .andWhere (
            `dailyAirData.isDelete = :del`, 
            {
                del :false
            }
        )
        .execute()
        // console.log(updateAirData)
        if (updateAirData.affected) { //if successfully updated
            res.json ({
                message: "Delete successfully!!!",
                status: 202
            })
        }else {
            res.json ({
                message: "Delete Failed!!!",
                status: 406
            })
        }
    }catch(err) {
        console.log(err)
        res.json ({ 
            message: "Internal Error!!",
            pageNeed: null,
            status: 406,
            airData: null
        })
    }
}

//get daily air data index by division
const getDailyAirDataAqiByDivision:Body =  async (req, res, next) => {
    try {
        const division = req.params.division //get the division name from params 
        if (division) { //if division have found 
            const getData:any = await AirData.createQueryBuilder ("airData")
            .select("AVG(airdata.valueOfPM)", "average" )
            .addSelect ("airdata.division", "division")
            .where ("airdata.division = :divisionName", {
                divisionName:  division
            })
            .groupBy ("airData.division")
            .getRawOne()
            // console.log(getData)
            if (getData) { // if data has found then 
                const getQuality = findAirQuality (getData.average)
                const finalAirData = JSON.parse (JSON.stringify ({...getData, ...getQuality}))
                res.json ({
                    message: `Air data has found!!`,
                    status: 202 ,
                    airData: finalAirData
                })
            }else {
                res.json ({
                    message: `No data found`,
                    status: 404 ,
                    airData: null
                })
            }
            // res.end ()
        }else {
            res.json ({
                message: "Division Name required",
                status: 404,
                airData: null
            })
        }
    }catch(err) {
        console.log(err)
        res.json ({ 
            message: "Internal Error!!",
            pageNeed: null,
            status: 406,
            airData: null
        })
    }
}

//get available division 
const getAvailableDivision:Body =  async (req, res, next) => {
    try {
       const findAvailableDivision: AirData [] | null = await AirData.createQueryBuilder ("airData")
       .select ("DISTINCT(airdata.division)", "division")
       .getRawMany();

        if (findAvailableDivision.length) { //if division has been found
            res.json ({
                message: `${findAvailableDivision.length} Division has been found`,
                status: 202,
                divisions: findAvailableDivision
            })
        }else {
            res.json ({
                message: "Division not found!!!",
                status: 404,
                divisions: null
            })
        }
    //    res.end ();
    }catch(err) {
        console.log(err)
        res.json ({ 
            message: "Internal Error!!",
            pageNeed: null,
            status: 406,
            airData: null
        })
    }
}

//Get all agency’s Average PM2.5 in a daily basis of a particular Season. =
const getAveragePmInDailyBasisOfParticularSession:Body =  async (req, res, next) => {
    try {
       const findAvailableAirData = await AirData.createQueryBuilder ("airData")
       .select (`AVG(airData.valueOfPM)`, "avg")
       .addSelect (`YEAR(airData.publishedDate)` ,"year")
       .addSelect (`MONTH(airdata.publishedDate)`, "month")
       .where (`airdata.season = :session`, {
        session: req.body.session
       })
       .groupBy (`YEAR(airdata.publishedDate)`)
       .addGroupBy (`MONTH(airdata.publishedDate)`)
       .getRawMany(); //get query data
       if (findAvailableAirData.length) { //if data found
        res.json ({
            message: "Data found!!",
            status: 202,
            airData: findAvailableAirData
        })
       }else {
        res.json ({
            message: "Data not found",
            status: 404,
            airData: null
        })
       }
    //    res.end ();
    }catch(err) {
        console.log(err)
        res.json ({ 
            message: "Internal Error!!",
            pageNeed: null,
            status: 406,
            airData: null
        })
    }
}
export  {
    addNewAirDataController,
    getLoggedInAgencyInputAirData,
    updateAirDataById,
    deleteAirDataById,
    addNewAirDailyDataController,
    getLoggedInAgencyInputDailyAirData,
    updateDailyAirDataById,
    deleteDailyAirDataById,
    getDailyAirDataAqiByDivision,
    getAvailableDivision,
    getAveragePmInDailyBasisOfParticularSession
}


