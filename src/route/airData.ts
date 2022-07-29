import {
    Router,
    Request
} from "express"
import {
    addNewAirDataController
} from "../controller/airData"
import auth from "../../middleware/auth"

const route = Router();

//post route
route.post ("/create", auth, addNewAirDataController)


export default route

