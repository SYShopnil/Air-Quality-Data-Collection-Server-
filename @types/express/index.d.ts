import {Agency} from "../../src/entites/Agency"

declare global {
    namespace Express {
        interface Request {
            user: Agency
            isAuth: boolean
        }
    }
}