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
    deleteDailyAirDataById
} from "../controller/airData"
import auth from "../../middleware/auth"

const route = Router();

//post route
route.post ("/create/airData", auth, addNewAirDataController)
route.post ("/create/daily/airData", auth, addNewAirDailyDataController)
route.post ("/showOwn/data", auth, getLoggedInAgencyInputAirData)
route.post ("/showOwn/daily/airData", auth, getLoggedInAgencyInputDailyAirData)

//put
route.put ("/update/:id", auth, updateAirDataById)
route.put ("/update/daily/airData/:id", auth, updateDailyAirDataById)
route.put ("/delete/:id", auth, deleteAirDataById)
route.put ("/delete/daily/airData/:id", auth, deleteDailyAirDataById)


export default route

