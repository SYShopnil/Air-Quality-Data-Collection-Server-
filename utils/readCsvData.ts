import fs from "fs"
import {parse} from "csv-parse"

const readCsvDataHandler = async (fileName:string):Promise<any> => {
    try {
        const getCsvData:Promise<any[]> = new Promise (resolve => {
            const finalData:any[] = []
            fs.createReadStream(`${__dirname}/../public/${fileName}`)
            .pipe(parse({ delimiter: ",", from_line: 1 }))
            .on("data", function (row) {
                // console.log(row)
                finalData.push (row)
                // console.log(row)
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
                
                if (false) {
                    console.log(mainRow)
                    return
                }else {
                    childWrapData.forEach ((subRow, subRowIndex) => {
                        
                        if (subRowIndex == mainRowIndex ) {
                            if (mainRow == "publishedDate") {
                                // console.log({mainRow, subRow, mainRowIndex, subRowIndex})
                                let input = subRow
                                let output = input.split("")
                                output.forEach((data:string, ind:number) => {
                                    if (data == "/") {
                                        output[ind] = "-"
                                    }
                                    return data
                                }) 
                                let res = ""
                                output.map ((val:string) => {
                                    res+=val
                                })
                                const [day, month, year] = res.split ("-")
                                const final =`${year}-${(month.length > 1) ? month : "0" + month}-${(day.length > 1 ) ? day : "0"+day }`
                                constructorObject[mainRow] = final
                            }else {
                                constructorObject[mainRow] = subRow
                            }
                        }else {
                            return 
                        }
                    })
                } 
            })
            // console.log(constructorObject)
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

