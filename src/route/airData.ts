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
    getAveragePmInDailyBasisOfParticularSession
} from "../controller/airData"
import auth from "../../middleware/auth"

const route = Router();

//post route
route.post ("/create", auth, addNewAirDataController)
route.post ("/daily/create", auth, addNewAirDailyDataController)
route.post ("/showOwn/data", auth, getLoggedInAgencyInputAirData)
route.post ("/showOwn/daily/data", auth, getLoggedInAgencyInputDailyAirData)
route.post ("/get/daily/basis/session", getAveragePmInDailyBasisOfParticularSession)

//put
route.put ("/update/:id", auth, updateAirDataById)
route.put ("/update/daily/data/:id", auth, updateDailyAirDataById)
route.put ("/delete/:id", auth, deleteAirDataById)
route.put ("/delete/daily/data/:id", auth, deleteDailyAirDataById)

//get api
route.get ("/get/avg/pm/:division", getDailyAirDataAqiByDivision)
route.get ("/get/available/division", getAvailableDivision)



export default route

