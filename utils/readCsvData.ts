import fs from "fs"
import {parse} from "csv-parse"

const readCsvDataHandler = async (fileName:string):Promise<any> => {
    try {
        const getCsvData:Promise<any[]> = new Promise (resolve => {
            const finalData:any[] = []
            fs.createReadStream(`${__dirname}/../public/${fileName}`)
            .pipe(parse({ delimiter: ",", from_line: 1 }))
            .on("data", function (row) {
                finalData.push (row)
                resolve(finalData)
            })
            

        })
        const csvData:any[] = await getCsvData
        const needToDO = [
            {
                division: "Dhaka",
                district : "Dhaka",
            }
        ]
        const mainRow:any [] = csvData[0] //it is the main row 
        const childRowWrap:any[] = csvData.filter ((row, ind) => {
            return ind != 0
        })
        // console.log(childRow)
        // console.log(mainRow)
        const mainData: any[] = [];

        childRowWrap.forEach ((childWrapData:any[]) => {
            const constructorObject:any = {};
            mainRow.forEach ((mainRow:string, mainRowIndex:number) => {
                if (!mainRowIndex || !mainRow) {
                    return
                }else {
                    childWrapData.forEach ((subRow, subRowIndex) => {
                        if (subRowIndex && subRowIndex == mainRowIndex ) {
                            constructorObject[mainRow] = subRow
                        }else {
                            return 
                        }
                    })
                } 
            })
            mainData.push (constructorObject)
        })

        return mainData
    }catch (err) {
        console.log(err)
        return {
            data: null,
            isComplete: false
        }
    }
}

export default readCsvDataHandler