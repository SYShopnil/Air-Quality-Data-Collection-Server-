import {Agency} from "../../src/Agency"

declare global {
    namespace Express {
        interface Request {
            user: Agency
            isAuth: boolean
        }
    }
}