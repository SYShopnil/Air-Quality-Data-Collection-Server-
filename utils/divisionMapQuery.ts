
export const divisionMapQuery = (data:[{division:string, avgPm:string}]) => {
    type formaStruct = {
        lon: string | number [],
        lat: string | number [],
        pmValue?: string | number,
        division?: string
    }
    const areaOfDivision = [
        {
            division: "rajshahi",
            lon: [],
            lat:[]
        },
        {
            division: "rangpur",
            lon: [],
            lat:[]
        },
        {
            division: "dhaka",
            lon: [],
            lat:[]
        },
        {
            division: "khulna",
            lon: [],
            lat:[]
        },
        {
            division: "barisal",
            lon: [],
            lat:[]
        },
        {
            division: "chittagong",
            lon: [],
            lat:[]
        },
        {
            division: "sylhet",
            lon: [],
            lat:[]
        },
        {
            division: "mymensingh",
            lon: [],
            lat:[]
        },
    ]
    let finalStruct:any = [];
    data.forEach ((airData:{division:string, avgPm:string} ) => {
        const format:formaStruct = {
            lon: [],
            lat:[]
        }
        switch (true) {
            case (airData.division).toLowerCase() == "rajshahi": {
                format.division = airData.division
                format.pmValue = airData.avgPm
                format.lon = areaOfDivision[0].lon
                format.lat = areaOfDivision[0].lat
                break
            }
            case (airData.division).toLowerCase() == "rangpur": {
                format.division = airData.division
                format.pmValue = airData.avgPm
                format.lon = areaOfDivision[1].lon
                format.lat = areaOfDivision[1].lat
                break
            }
            case (airData.division).toLowerCase() == "dhaka": {
                format.division = airData.division
                format.pmValue = airData.avgPm
                format.lon = areaOfDivision[2].lon
                format.lat = areaOfDivision[2].lat
                break
            }
            case (airData.division).toLowerCase() == "khulna": {
                format.division = airData.division
                format.pmValue = airData.avgPm
                format.lon = areaOfDivision[3].lon
                format.lat = areaOfDivision[3].lat
                break
            }
            case (airData.division).toLowerCase() == "barisal": {
                format.division = airData.division
                format.pmValue = airData.avgPm
                format.lon = areaOfDivision[4].lon
                format.lat = areaOfDivision[4].lat
                break
            }
            case (airData.division).toLowerCase() == "chittagong": {
                format.division = airData.division
                format.pmValue = airData.avgPm
                format.lon = areaOfDivision[5].lon
                format.lat = areaOfDivision[5].lat
                break
            }
            case (airData.division).toLowerCase() == "sylhet": {
                format.division = airData.division
                format.pmValue = airData.avgPm
                format.lon = areaOfDivision[6].lon
                format.lat = areaOfDivision[6].lat
                break
            }
            case (airData.division).toLowerCase() == "mymensingh": {
                format.division = airData.division
                format.pmValue = airData.avgPm
                format.lon = areaOfDivision[7].lon
                format.lat = areaOfDivision[7].lat
                break
            }
            default: {
                break
            }
        }
        finalStruct.push (format)
    })
    return finalStruct
}

 