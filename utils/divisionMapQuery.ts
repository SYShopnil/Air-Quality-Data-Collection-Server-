
const colorCodeAccordingToPm: (valueOfPm:string) => void | string = (valueOfPm) => {
    switch (true) {
        case (+valueOfPm >= 0 && +valueOfPm <= 50): {
            return "#00E400"
        }
        case (+valueOfPm >= 51 && +valueOfPm <= 100): {
            return "#FFFF00"
        }
        case (+valueOfPm >= 101 && +valueOfPm <= 150): {
            return "#FF7E00"
        }
        case (+valueOfPm >= 151 && +valueOfPm <= 200): {
            return "#FF0000"
        }
        case (+valueOfPm >= 201 && +valueOfPm <= 300): {
            return "#8F3F97"
        }
        case (+valueOfPm >= 301): {
            return "#7E0023"
        }
    }
}
export const divisionMapQuery = (data:[{division:string, avgPm:string, color:string}]) => {
    type formaStruct = {
        lon: string | number [],
        lat: string | number [],
        pmValue?: string | number,
        division?: string,
        color?: string | void
    }
    const areaOfDivision = [
        {
            division: "rajshahi",
            lon: [88.746603,88.456045,88.430328,88.280398,88.193803,88.146663,88.033504,88.187899,88.350836,88.728870,88.735263,88.876239,89.090422,89.567242,89.396271,89.517404, 89.607458,89.223571,89.458741],
            lat:[25.184090,25.196465,25.062213,24.933448,24.960885,24.845332,24.662771,24.508821,24.408228,24.290590,24.116381,24.046213,24.107586,23.993393,24.755610,24.477950,23.692614,25.110572,25.051406]
        },
        {
            division: "rangpur",
            lon: [88.411805, 88.368415, 88.429548,88.175284,88.575976,88.437661,89.120138, 89.515646,89.845236,89.867209,88.878439,88.704792,89.349951,89.533044,89.848949,89.821338,88.315552,89.341156,88.269824, 89.099453,89.321558,89.184376,88.126109],
            lat:  [26.632458, 26.562442, 26.342441,26.028959,26.456740,25.656817,26.193916,26.055821,26.296470,25.957082,25.620751,25.343058,25.313565,25.345239,25.71117,25.355375,25.777142,25.175621,26.176474,25.293803,26.012207,26.100236,25.935863]
        },
        {
            division: "dhaka",
            lon: [89.772626, 89.824886,89.421036,89.384083, 89.541135,89.633519,89.733106,90.164252, 90.412487 ,90.543138,90.556203,90.647658,90.778308, 90.967751,91.065738,91.170258,91.176791,90.902426,90.706450,90.595398,90.327565,90.209980,90.111992, 90.027069,89.870289, 89.778834,89.831094,89.713509],
            lat:  [24.309666,24.101130,23.866082,23.680084,23.510764,23.307293,23.185340,22.993045, 23.095236,23.065188,23.167324,23.485248,23.724685,23.933832,24.047227,24.261807,24.422505,24.594878,24.600818,24.452241,24.232026, 24.285627,24.392761,24.582998, 24.743286,24.636450,24.386812,24.148601,23.921889]
        },
        {
            division: "khulna",
            lon: [88.710936,88.610304,88.653012,88.761137,88.740167,88.963165,88.883529,88.963487,89.072060,89.142506,89.344155,89.645696, 89.791364,89.880189,89.895024,89.898275,89.944404],
            lat: [24.130727,23.864511,23.608504,23.491146,23.270223,23.229360,23.109566,22.830751,22.225211,22.029172,21.885202,21.861062,21.882897,22.415126,22.460813,22.884965,23.398026]
        },
        {
            division: "barisal",
            lon: [90.413421, 90.280291,90.220309,90.200078,90.066791,89.997975,89.937086,89.905247,89.898964,89.941104,89.975434, 89.897751,89.923001,90.069513,90.155636, 90.292736,90.448141,90.641061,90.741758,90.840526, 90.862264,91.004757,91.012224,90.734257,90.664384, 90.520627,90.426969],
            lat: [23.063174,22.975019,23.046970,23.064408,22.971206,22.863595,22.855201,22.718688,22.722631,22.498399,22.430704,22.327995,22.013415,21.969275,21.815921,21.891210,21.874966,21.955796,22.059369,22.285431,22.419146,22.366579,22.508278,22.868318,22.970049,23.036982,23.010721]
        },
        {
            division: "chittagong",
            lon: [90.895281, 90.986885,90.870684,90.766949,90.687739,90.646239,90.565265,90.544336,90.618626, 90.553859, 90.664719,90.710911,90.783164, 90.88204,90.975289,90.975289,91.053815, 91.132341, 91.076911, 91.039957,91.063053, 91.164675, 91.150818, 91.206248, 91.275536, 91.266297,91.391015,91.460303, 91.534210, 91.672785,91.755931,91.852933,91.917602, 91.917602,91.876029,91.871410, 92.011805, 92.173514,92.312567,92.399866, 92.531931, 92.531931, 92.606508, 92.496578,92.375728, 92.375728, 92.313074, 92.271502,92.174499, 91.98973, 91.929682, 91.791107,91.629435,91.513956, 91.416953, 91.416953,91.315331, 91.241424,91.158279, 91.144421,91.232186, 91.159088],

            lat: [23.876461,24.029971,23.874327,23.857337,23.677808,23.502233,23.462407,23.399508,23.217248,23.141507,22.980005,22.873648,22.782831,22.671365,22.609298,22.545320,22.494117,22.301935,22.165111,22.100929,22.190776,22.340393,22.558118,
            22.651933,22.741424,22.779759,22.852141, 22.690294,22.545320,22.348937,22.126606,21.903923,21.736681,21.620785,21.517688,21.382446,21.043507,21.440988,21.482208,21.388203,21.763897,22.712139,23.056273,23.318843,23.479401,23.652992,23.712215,23.699526,23.432789,23.233442,22.957260,23.101795, 23.263151,23.067801,23.246175, 23.466690,23.623371,23.712215,23.851704,23.568364]
        },
        {
            division: "sylhet",
            lon: [ 91.574814,91.390047,91.639483,91.879680, 91.944349,92.258453, 92.239977,92.424744, 92.166070,91.815012, 91.214518,90.974321, 91.057466,91.196041,91.223756, 91.288425],

            lat: [24.083875,24.117607,24.227175,24.210325,
            24.361899,24.706473,24.924491,24.974749,25.133762,25.175573, 25.192293,25.175573,24.899355,24.723257,24.370314,24.193472]
        },
        {
            division: "mymensingh",
            lon: [89.819525,89.690188,89.671711,89.745618, 89.874955,90.068961, 90.068961,90.198298,90.383065,90.623263,91.149850,90.955844,90.946606,90.593455, 90.251635, 90.020676],
            lat:[25.409450,25.225727,24.974749,24.790372, 
            24.689687,24.781984,24.513292, 24.319813, 
            24.336649, 24.521697,24.748429,24.899355,25.083569,25.169552,25.194634,25.261491]
        },
    ]
    let finalStruct:any = [];
    data.forEach ((airData:{division:string, avgPm:string, color:string} ) => {
        const format:formaStruct = {
            lon: [],
            lat:[]
        }
        switch (true) {
            case (airData.division).toLowerCase() == "rajshahi": {
                // const color:string | void = colorCodeAccordingToPm (airData.avgPm)
                format.division = airData.division
                format.pmValue = airData.avgPm
                format.lon = areaOfDivision[0].lon
                format.lat = areaOfDivision[0].lat
                format.color = colorCodeAccordingToPm (airData.avgPm)
                break
            }
            case (airData.division).toLowerCase() == "rangpur": {
                format.division = airData.division
                format.pmValue = airData.avgPm
                format.lon = areaOfDivision[1].lon
                format.lat = areaOfDivision[1].lat
                format.color = colorCodeAccordingToPm (airData.avgPm)
                break
            }
            case (airData.division).toLowerCase() == "dhaka": {
                format.division = airData.division
                format.pmValue = airData.avgPm
                format.lon = areaOfDivision[2].lon
                format.lat = areaOfDivision[2].lat
                format.color = colorCodeAccordingToPm (airData.avgPm)
                break
            }
            case (airData.division).toLowerCase() == "khulna": {
                format.division = airData.division
                format.pmValue = airData.avgPm
                format.lon = areaOfDivision[3].lon
                format.lat = areaOfDivision[3].lat
                format.color = colorCodeAccordingToPm (airData.avgPm)
                break
            }
            case (airData.division).toLowerCase() == "barisal": {
                format.division = airData.division
                format.pmValue = airData.avgPm
                format.lon = areaOfDivision[4].lon
                format.lat = areaOfDivision[4].lat
                format.color = colorCodeAccordingToPm (airData.avgPm)
                break
            }
            case (airData.division).toLowerCase() == "chittagong": {
                format.division = airData.division
                format.pmValue = airData.avgPm
                format.lon = areaOfDivision[5].lon
                format.lat = areaOfDivision[5].lat
                format.color = colorCodeAccordingToPm (airData.avgPm)
                break
            }
            case (airData.division).toLowerCase() == "sylhet": {
                format.division = airData.division
                format.pmValue = airData.avgPm
                format.lon = areaOfDivision[6].lon
                format.lat = areaOfDivision[6].lat
                format.color = colorCodeAccordingToPm (airData.avgPm)
                break
            }
            case (airData.division).toLowerCase() == "mymensingh": {
                format.division = airData.division
                format.pmValue = airData.avgPm
                format.lon = areaOfDivision[7].lon
                format.lat = areaOfDivision[7].lat
                format.color = colorCodeAccordingToPm (airData.avgPm)
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

 