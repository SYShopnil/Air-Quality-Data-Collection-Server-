import {
    Router,
    Request
} from "express"
import {
    addNewAirDataController,
    getLoggedInAgencyInputAirData,
    updateAirDataById,
    deleteAirDataById
} from "../controller/airData"
import auth from "../../middleware/auth"

const route = Router();

//post route
route.post ("/create", auth, addNewAirDataController)
route.post ("/showOwn/data", auth, getLoggedInAgencyInputAirData)

//put
route.put ("/update/:id", auth, updateAirDataById)
route.put ("/delete/:id", auth, deleteAirDataById)


export default route

