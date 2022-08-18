import {
    Router,
    Request
} from "express"
import {
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
} from "../controller/airData"
import auth from "../../middleware/auth"

const route = Router();

//post route
route.post ("/create", auth, addNewAirDataController)
route.post ("/daily/create", auth, addNewAirDailyDataController)
route.post ("/showOwn/data", auth, getLoggedInAgencyInputAirData)
route.post ("/showOwn/daily/data", auth, getLoggedInAgencyInputDailyAirData)
route.post ("/get/daily/basis/session", getAveragePmInDailyBasisOfParticularSession)
route.post ("/get/daily/basis/mean/inRange/between/two", getAvgMeanDailyBasisBetweenTwoAgencyByYear)
route.post ("/get/aqi/all", getAvgAqiByYearlyOrMonthly)
route.post ("/get/aqi/all/station/of/agency", getAvgAqiOfStationNumber)
route.post ("/get/aqi/of/station/monthly", getAqiOfStationNumberByMonth)
route.post ("/get/aqi/of/session", getAqiDataBySession)
route.post ("/get/avg/aqi/by/year", getAvgAqiByYear)

//put
route.put ("/update/:id", auth, updateAirDataById)
route.put ("/update/daily/data/:id", auth, updateDailyAirDataById)
route.put ("/delete/:id", auth, deleteAirDataById)
route.put ("/delete/daily/data/:id", auth, deleteDailyAirDataById)

//get api
route.get ("/get/avg/pm/:division", getDailyAirDataAqiByDivision)
route.get ("/get/available/division", getAvailableDivision)
route.get ("/get/available/session", getAvailableSession)
route.get ("/get/available/published/year/:queryFor", getAllAvailableYearFromExistingAgency)
route.get ("/get/available/agency/:queryFor", getAvailableAgency)
route.get ("/get/aqi/all/division", getAvgAqiByOfAllDivision)
route.get ("/get/all/station/of/:id", getAllStationNumberByAgencyId)
route.get ("/get/aqi/all/division/data", getAvgOfPmValueOfAllDivision)



export default route



