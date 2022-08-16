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
    getAvailableAgency
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



export default route



