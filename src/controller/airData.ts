import e, { NextFunction, Request, Response } from "express"
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
import { divisionMapQuery } from "../../utils/divisionMapQuery"

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
            sortBy ,
            searchBy,
            pageNo,
            dataLimit
        }:bodyInput = req.body; 
        // console.log(req.user.agentID)
        // console.log({sortBy ,
        //     searchBy,
        //     pageNo,
        //     dataLimit})
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
        // console.log(query)
        //finally get all data with all query
        const getAllData = await query.getMany(); //finally get all data
    //    console.log(totalDataFound)
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
        // console.log(reqAirDataId)
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
                session: findAvailableDivision
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
       .leftJoinAndSelect ("airData.publishedBy", "publisher")
       .select (`AVG(airData.valueOfPM)`, "avg")
       .addSelect (` CONCAT(YEAR(airdata.publishedDate), " - ",
    MONTH(airdata.publishedDate) )`, "time")
    .addSelect ("publisher.agentID", "publishedBy")
    .addSelect ("publisher.name", "agencyName")
       .where (`airdata.season = :session`, {
        session: req.body.session
       })
       .groupBy (`YEAR(airdata.publishedDate)`)
       .addGroupBy (`MONTH(airdata.publishedDate)`)
       .addGroupBy(`airData.publishedBy`)
    //    .addGroupBy (`airdata.publishedBy`)
       .getRawMany(); //get query data
       if (findAvailableAirData.length) { //if data found
        const findAllPublisher: any = await AirData.createQueryBuilder ("airdata")
        .select (`DISTINCT(airdata.publishedBy)`, `owner`)
        .getRawMany(); //get all available owner id 
        // console.log(findAvailableAirData)
        // res.end()
        const finalStructure:object | [] | any= [];
        findAllPublisher.map ((ownerId:any) => {
            const createSendStructure = findAvailableAirData.filter (airData => airData.publishedBy == ownerId.owner )
            finalStructure.push (createSendStructure)
        })
        // console.log(first)
        // console.log(finalStructure)
        // console.log(findAvailableAirData)
        const final:any = [];
        finalStructure.map ((subArray:any) => {
            const childStruct:any = {
                x: [],
                y: [],
                mode: 'lines+markers',
                type: 'scatter'
            }
            subArray.map ((child:any | object) => {
                for (let property in child) {
                    if (property == "avg") {
                        childStruct.y.push (child[property])
                    }else if (property == "time") {
                        childStruct.x.push (child[property])
                    }
                }
            })
            if (childStruct.x.length || childStruct.y.length ) {
                final.push (childStruct)
            }
        })
        res.json ({
            message: "Air data found!!",
            status: 202,
            airData: finalStructure
        })
       }else {
        res.json ({
            message: "Air data not found",
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

//find all available session 
const getAvailableSession:Body =  async (req, res, next) => {
    try {
       const findSession: AirData [] | null = await AirData.createQueryBuilder ("airData")
       .select ("DISTINCT(airdata.season)", "sessions")
       .where (`airData.isDelete = false`)
       .getRawMany();

        if (findSession.length) { //if division has been found
            res.json ({
                message: `${findSession.length} session has been found`,
                status: 202,
                sessions: findSession
            })
        }else {
            res.json ({
                message: "Session not found!!!",
                status: 404,
                sessions: null
            })
        }
    //    res.end ();
    }catch(err) {
        console.log(err)
        res.json ({ 
            message: "Internal Error!!",
            status: 406,
            sessions: null
        })
    }
}

//get avg mean between a year range between two agency
const getAvgMeanDailyBasisBetweenTwoAgencyByYear:Body =  async (req, res, next) => {
    try {
       const {
        starYear,
        endYear,
        agencyOne,
        agencyTwo
       } = req.body 
       if (starYear < endYear) { 
        if (starYear && endYear) {
            const findAirData = await DailyAirData.createQueryBuilder ("dailyAirData")
            .innerJoin (`dailyAirData.publishedBy`, "agency")
            .select (`YEAR(dailyairdata.publishedDate)`, "year")
            .addSelect (`MONTH(dailyairdata.publishedDate)`, "month")
            .addSelect (`DAY(dailyairdata.publishedDate)`, "day")
            .addSelect (`agency.NAME`, "agentName")
            .addSelect (`agency.agentID`, "agentId")
            .addSelect (`AVG(dailyairdata.mean)`, "dailyAvgMean")
            .where (`YEAR(dailyairdata.publishedDate) BETWEEN ${starYear} AND ${endYear}`)
            .andWhere (
                new Brackets (qb => {
                    qb.orWhere (`agency.agentID = :idOne`, {
                        idOne: agencyOne
                    }).orWhere (`agency.agentID = :idTwo`, {
                        idTwo: agencyTwo
                    })
                })
            )
            .groupBy (`agency.agentID`)
            .addGroupBy (`YEAR(dailyairdata.publishedDate)`)
            .addGroupBy (`MONTH(dailyairdata.publishedDate)`)
            .addGroupBy (`DAY(dailyairdata.publishedDate)`)
            .getRawMany()

                
            // res.send(findAirData)
            if (findAirData.length) { //if air data has found!!!
                res.json ({
                    message: "Air Data found!!!",
                    status: 202,
                    airData:  findAirData
                })
            }else {
                res.json ({
                    message: "No Air Data has been found!!!",
                    status: 404,
                    airData:  null
                })
            }
        }else {
            res.json ({ 
                message: "A year range have missed!!!",
                status: 404,
                airData: null
            })
        }
       }else {
            res.json ({ 
                message: "Start year is behind!!!",
                status: 406,
                airData: null
            })
       }
    //    res.end ();
    }catch(err) {
        console.log(err)
        res.json ({ 
            message: "Internal Error!!",
            status: 406,
            airData: null
        })
    }
}

//get all available year from existing agency 
const getAllAvailableYearFromExistingAgency:Body =  async (req, res, next) => {
    try {
      const queryFor = req.params.queryFor
      let year:any = [];
      if (queryFor == "daily") {
        const data = await DailyAirData.createQueryBuilder ("dailyAirData")
        .select (`DISTINCT(YEAR(dailyAirData.publishedDate))`, "year")
        .getRawMany();
        year = data
      }else if (queryFor == "final") {
        const data = await AirData.createQueryBuilder ("airData")
        .select (`DISTINCT(YEAR(airData.publishedDate))`, "year")
        .getRawMany();
        year = data
      }
    if (year.length) {
        res.json ({
            message: "Year found!",
            status: 202,
            years: year
        })
    }else {
        res.json ({
            message: "No Year found!",
            status: 404,
            years: null
        })
    }
    }catch(err) {
        console.log(err)
        res.json ({ 
            message: "Internal Error!!",
            status: 406,
            years: null
        })
    }
}

//get available all agency by air data available
const getAvailableAgency:Body =  async (req, res, next) => {
    try {
      const queryFor = req.params.queryFor
      let agents:any = [];
      if (queryFor == "daily") {
        const data = await DailyAirData.createQueryBuilder ("dailyAirData")
        .innerJoin (`dailyAirData.publishedBy`, `publisher`)
        .select (`publisher.name`, "name")
        .addSelect (`publisher.agentID`, "agentId")
        .groupBy (`publisher.name`)
        .getRawMany();
        agents = data
      }else if (queryFor == "final") {
        const data = await AirData.createQueryBuilder ("airData")
        .innerJoin (`airData.publishedBy`, `publisher`)
        .select (`publisher.name`, "name")
        .addSelect (`publisher.agentID`, "agentId")
        .groupBy (`publisher.name`)
        .getRawMany();
        agents = data
      }
    if (agents.length) {
        res.json ({
            message: "Agent found!",
            status: 202,
            agents
        })
    }else {
        res.json ({
            message: "No Agency found!",
            status: 404,
            agents: null
        })
    }
    }catch(err) {
        console.log(err)
        res.json ({ 
            message: "Internal Error!!",
            status: 406,
            agents: null
        })
    }
}

//get avg aqi of pm value of all division
const getAvgOfPmValueOfAllDivision:Body =  async (req, res, next) => {
    try {
        const getAirData:any = await AirData.createQueryBuilder ("airData")
        .select(`AVG(airdata.valueOfPM)`, "avgPm")
        .addSelect(`airdata.division`, 'division')
        .groupBy(`airdata.division`)
        .getRawMany();
        // console.log(getAirData)
        if (getAirData.length) { //if data successfully found
            // console.log(getAirData)
            const format = divisionMapQuery(getAirData)
            if (format.length ) { //if air data has found
                res.json ({
                    message: "Air data found",
                    status: 202,
                    airData: format
                })
            }else {
                res.json ({
                    message: "No air data found",
                    status: 404,
                    airData: null
                })
            }
        }else {
            res.json ({
                message: "No air data found",
                status: 404,
                airData: null
            })
        }
        // res.end()
    }catch(err) {
        console.log(err)
        res.json ({ 
            message: "Internal Error!!",
            status: 406,
            airData: null
        })
    }
}



//get avg aqi of pm value of all division by yearly or monthly 
const getAvgAqiByYearlyOrMonthly:Body =  async (req, res, next) => {
    try {
        const {
            queryBy
        } = req.body
        const airData =  AirData.createQueryBuilder("airdata")
        if (queryBy == "yearly") {
            airData.select (`AVG(airdata.valueOfPM)`, "avgAQI")
            .addSelect (`YEAR(airdata.publishedDate)`, 'year')
            .addSelect (`airdata.division`, `division`)
            .where (`YEAR(airdata.publishedDate) BETWEEN ${req.body.yearFrom} AND ${req.body.yearTo}`)
            .groupBy (`airdata.division`)
            .addGroupBy (`YEAR(airdata.publishedDate)`)
        }else if (queryBy == 'monthly'){
             airData.select (`AVG(airdata.valueOfPM)`, "avgAQI")
            .addSelect (`YEAR(airdata.publishedDate)`, 'year')
            .addSelect (`airdata.division`, `division`)
            .addSelect (`MONTH(airdata.publishedDate)`, 'month')
            .where (`YEAR(airdata.publishedDate) = :year`, {
                year: req.body.year
            })
            .groupBy (`airdata.division`)
            .addGroupBy (`YEAR(airdata.publishedDate)`)
            .addGroupBy (`MONTH(airdata.publishedDate)`)
        }
        const data = await airData.getRawMany()
        if (data.length) { //if air data has found
            let divisions:any = [];
            let graphData:any = []
            data.forEach (allData => {
                divisions.push (allData.division)
                divisions = [...new Set(divisions)]
            })
            divisions.forEach((division:string) => {
                const myData:any = [];
                data.forEach ((d:any) => {
                    // console.log(d)
                    if (d.division == division) {
                        myData.push(d)
                    }
                })
                graphData.push (myData)
            })
            // console.log(graphData)
            res.json ({
                message: "Air data has found!!!",
                airData: graphData,
                status: 202,
            })
        }else {
            res.json ({
                message: "No air data has found!!!",
                airData: null,
                status: 404,
            })
        }
    }catch(err) {
        console.log(err)
        res.json ({ 
            message: "Internal Error!!",
            status: 406,
            airData: null
        })
    }
}

//get avg aqi of pm value of all division
const getAvgAqiByOfAllDivision:Body =  async (req, res, next) => {
    try {
        const airData =  await AirData.createQueryBuilder("airdata")
        .select (`AVG(airdata.valueOfPM)`, 'avgPM')
        .addSelect (`airdata.division`, "division")
        .groupBy (`airdata.division`)
        .getRawMany ()

        if (airData.length) { //if air data has found
            res.json ({
                message: "Air data has found!!!",
                airData: airData,
                status: 202,
            })
        }else {
            res.json ({
                message: "No air data has found!!!",
                airData: null,
                status: 404,
            })
        }
    }catch(err) {
        console.log(err)
        res.json ({ 
            message: "Internal Error!!",
            status: 406,
            airData: null
        })
    }
}

//get all agency station number by agency id 
const getAllStationNumberByAgencyId:Body =  async (req, res, next) => {
    try {
        const stationData =  await AirData.createQueryBuilder("airdata")
        .select (`airdata.stationNo`, 'station')
        .where (`airdata.publishedBy = :agentId`, {
            agentId: req.params.id
        })
        .groupBy (`airdata.stationNo`)
        .addGroupBy (`airdata.publishedBy`)
        .orderBy (`airdata.stationNo`, "ASC")
        .getRawMany ()
        if (stationData.length) { //if data has been found
            res.json ({
                message: "Station has found!!",
                stationData,
                status: 202
            })
        }else {
            res.json ({
                message: "No station has been found!!",
                stationData: null,
                status: 404
            })
        }
    }catch(err) {
        console.log(err)
        res.json ({ 
            message: "Internal Error!!",
            status: 406,
            stationData: null
        })
    }
}



//get air data of an agency particular station number
const getAvgAqiOfStationNumber:Body =  async (req, res, next) => {
    try {
        const findAirData:AirData[] | [] = await AirData.createQueryBuilder ("airData")
        .innerJoin(`airData.publishedBy`, "publisher")
        .select(`airdata.valueOfPM`, `valueOfPm`)
        .addSelect(`airdata.stationNo`, 'station')
        .addSelect(`publisher.name`, 'agencyName')
        .where(`airdata.publishedBy = :publishedBy`, {
            publishedBy: req.body.agentId
        })
        .orderBy(`airdata.stationNo`, "ASC")
        .getRawMany();
        if (findAirData.length) { //if air data successfully found
            // console.log(findAirData)
            const getAllStationNo = await AirData.createQueryBuilder(`airdata`)
            .select(`DISTINCT(airData.stationNo)`)
            .andWhere(`airdata.publishedBy = :publishedBy`, {
                publishedBy: req.body.agentId
            })
            .orderBy(`airdata.stationNo`, "ASC")
            .getRawMany();
            
            const structure:any = [];
            getAllStationNo.forEach (station => {
                const innerStruct:any = {
                    valueOfPm: []
                };
                findAirData.forEach ((airData:any) => {
                    if (airData.station == station.stationNo  ) {
                        innerStruct["agencyName"] = airData.agencyName
                        innerStruct["station"] = airData.station
                        innerStruct.valueOfPm.push (airData.valueOfPm)
                    }
                })
                structure.push(innerStruct)
            })
            res.json ({
                message: "Air data  found!!!",
                status: 202,
                airdata:structure
            })
        }else {
            res.json ({
                message: "Air data not found!!!",
                status: 404,
                airdata:null
            })
        }
        // console.log(findAirData)
        // res.send(findAirData)
    }catch(err) {
        console.log(err)
        res.json ({ 
            message: "Internal Error!!",
            status: 406,
            airdata: null
        })
    }
}

//get avg aqi of pm value of all a particular agency's all stations
const getAqiOfStationNumberByMonth:Body =  async (req, res, next) => {
    try {
        const airData =  await AirData.createQueryBuilder("airData")
        .innerJoin(`airData.publishedBy`, "agency")
        .select (`airData.valueOfPM`, 'valueOfPM')
        .addSelect (`airData.stationNo`, "station")
        .addSelect (`agency.name`, "agencyName")
        .addSelect (`MONTH(airData.publishedDate)`, "month")
        .addSelect (`YEAR(airData.publishedDate)`, "year")
        .where (`airData.publishedBy = :agentId`, {
            agentId: req.body.agentId
        })
        .andWhere (`airData.stationNo = :stationNo`, {
            stationNo: req.body.stationNo
        })
        .andWhere (`YEAR(airData.publishedDate) = :publishYear`, {
            publishYear: req.body.yearOf
        })
        .orderBy (`airData.stationNo`, "ASC")
        .getRawMany ()
        if (airData.length) { //if data has been found
             const getAllMonth = await AirData.createQueryBuilder(`airdata`)
            .select(`DISTINCT(MONTH(airData.publishedDate))`, "month")
            .where (`airData.publishedBy = :agentId`, {
                agentId: req.body.agentId
            })
            .andWhere (`airData.stationNo = :stationNo`, {
                stationNo: req.body.stationNo
            })
            .andWhere (`YEAR(airData.publishedDate) = :publishYear`, {
                publishYear: req.body.yearOf
            })
            .orderBy(`MONTH(airData.publishedDate)`, "ASC")
            .getRawMany();
            
            const structure:any = [];
            // console.log(getAllMonth)
            // console.log(airData)
            getAllMonth.forEach (month => {
                const innerStruct:any = {
                    valueOfPm: []
                };
                airData.forEach ((airValue:any) => {
                    if (airValue.month == month.month  ) {
                        innerStruct["agencyName"] = airValue.agencyName
                        innerStruct["month"] = airValue.month
                        innerStruct["year"] = airValue.year
                        innerStruct.valueOfPm.push (airValue.valueOfPM)
                    }
                })
                structure.push(innerStruct)
            })
            res.json ({
                message: "Air data has been found!!",
                airData: structure,
                status: 202
            })
        }else {
            res.json ({
                message: "No air data has been found!!",
                airData: null,
                status: 404
            })
        }
    }catch(err) {
        console.log(err)
        res.json ({ 
            message: "Internal Error!!",
            status: 406,
            airData: null
        })
    }
}

//get aqi data by session with filtering
const getAqiDataBySession:Body =  async (req, res, next) => {
    try {
        const {
            sessionBy = "all",
            queryByTime = "yearly"
        } = req.body 
        const query = await AirData.createQueryBuilder ("airdata")
        .select(`AVG(airdata.valueOfPM)`, `avgPm`)
        .addSelect (`MAX(airdata.valueOfPM)`, 'maxPm')
        .addSelect (`MIN(airdata.valueOfPM)`, 'minPm')
        .addSelect (`airdata.season`, 'session')
        
        if(sessionBy !== "all") {
            query.andWhere(`airdata.season = :session`, {
                session: sessionBy
            })
        }
        if (queryByTime == "monthly") {
            query.addSelect(`MONTH(airdata.publishedDate)`, "month")
            .orderBy (`MONTH(airdata.publishedDate)`, "ASC")
            .groupBy(`MONTH(airdata.publishedDate)`)
            .addGroupBy(`airdata.season`)
        }else if (queryByTime == "yearly") {
            query.addSelect(`YEAR(airdata.publishedDate)`, "year")
            .orderBy (`YEAR(airdata.publishedDate)`, "ASC")
            .groupBy(`YEAR(airdata.publishedDate)`)
            .addGroupBy(`airdata.season`)
        }

        const airData = await query.getRawMany();
        // console.log(airData)
        // res.send(airData)
        if (airData.length) { //if air data found
            const struct:any = []
            // console.log(airData)
            if (sessionBy != "all") {
                const data:any = {
                    valueOfPm: []
                };
                airData.forEach((airData:any) => {
                    data["session"] = airData.session
                    data.valueOfPm.push(airData.avgPm, airData.maxPm, airData.minPm)
                })
                struct.push(data)
            } else { //if query will be session by all 
                const getAllAvailableMonth = await AirData.createQueryBuilder ("airdata")
                .select (`DISTINCT(airdata.season)`, "sessions").getRawMany()
                getAllAvailableMonth.forEach ((sessions:any) => {
                    const data:any = {
                        valueOfPm: []
                    }
                    airData.forEach ((airData:any) => {
                        if (airData.session == sessions.sessions) {
                            // console.log({airData, sessions})
                            data["session"] = airData.session
                            data.valueOfPm.push(airData.avgPm, airData.maxPm, airData.minPm)
                        }
                    })
                    struct.push (data)
                })
                // console.log(struct)
                // res.end()
            }
            // console.log(struct)
            // res.end()
            if (struct.length) {
                res.json ({
                    message: "Air data has found!!",
                    status: 202,
                    airData: struct
                })
            }else {
                res.json ({
                    message: "No air data has found!!",
                    status: 404,
                    airData: null
                })
            }
        }else {
            res.json ({
                message: "Nor Air Data has found",
                status: 404,
                airData: null
            })
        }
    }catch(err) {
        console.log(err)
        res.json ({ 
            message: "Internal Error!!",
            status: 406,
            airData: null
        })
    }
}


//get avg aqi of pm value of all a particular agency's all stations
const getAvgAqiByYear:Body =  async (req, res, next) => {
    try {
        const airData = await AirData.createQueryBuilder("airdata")
        .select(`AVG(airdata.valueOfPM)`, `avgPmValue`)
        .addSelect(`YEAR(airdata.publishedDate)`, `year`)
        .where(`YEAR(airdata.publishedDate) BETWEEN ${req.body.startYear} AND ${req.body.endYear}`)
        .groupBy (`YEAR(airdata.publishedDate)`)
        .getRawMany();
        if (airData.length) { //if successfully air data has been found
            res.json ({
                message: "Air data found!!",
                status: 202,
                airData
            })
        }else {
            res.json ({
                message: "No air data found!!",
                status: 404,
                airData: null
            })
        }
        // res.end()
    }catch(err) {
        console.log(err)
        res.json ({ 
            message: "Internal Error!!",
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
    getAveragePmInDailyBasisOfParticularSession,
    getAvailableSession,
    getAvgMeanDailyBasisBetweenTwoAgencyByYear,
    getAllAvailableYearFromExistingAgency,
    getAvailableAgency,
    getAvgAqiByYearlyOrMonthly,
    getAvgAqiByOfAllDivision,
    getAqiOfStationNumberByMonth,
    getAllStationNumberByAgencyId,
    getAvgAqiOfStationNumber,
    getAqiDataBySession,
    getAvgAqiByYear,
    getAvgOfPmValueOfAllDivision
}


