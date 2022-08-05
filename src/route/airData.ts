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
route.post ("/create", auth, addNewAirDataController)
route.post ("/daily/create", auth, addNewAirDailyDataController)
route.post ("/showOwn/data", auth, getLoggedInAgencyInputAirData)
route.post ("/showOwn/daily/data", auth, getLoggedInAgencyInputDailyAirData)

//put
route.put ("/update/:id", auth, updateAirDataById)
route.put ("/update/daily/data/:id", auth, updateDailyAirDataById)
route.put ("/delete/:id", auth, deleteAirDataById)
route.put ("/delete/daily/data/:id", auth, deleteDailyAirDataById)


export default route

