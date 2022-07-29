import { unlink } from "fs"

 const isDelete = function (fileName:string): Promise<boolean> {
    return new Promise (resolve => {
        let hasError:boolean = false
        unlink (`${__dirname}/../public/${fileName}`, (err) => {
            console.log(err?.message)
            hasError = true
        })
        // console.log({currentFileName})
        // unlinkSync(`${__dirname}/../../public/${currentFileName}`)
        resolve (hasError)
    })
}
export default isDelete