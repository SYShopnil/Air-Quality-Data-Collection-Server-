
type aqiReturn = {
    aqiColor: string,
    level: string
}

const detectTheAirQuality = (aqiAvg:string):aqiReturn => {
    switch (true) {
        case (+aqiAvg >= 0) && (+aqiAvg <= 50) : {
            return {
                aqiColor: "#00E400",
                level: "good"
            }
            break;
        }
        case (+aqiAvg >= 51) && (+aqiAvg <= 100) : {
            return {
                aqiColor: "#FFFF00",
                level: "moderate"
            }
            break;
        }
        case (+aqiAvg >= 101) && (+aqiAvg <= 150) : {
            return {
                aqiColor: "#FF7E00",
                level: "unhealthy for sensitive groups"
            }
            break;
        }
        case (+aqiAvg >= 151) && (+aqiAvg <= 200) : {
            return {
                aqiColor: "#FF0000",
                level: "unhealthy"
            }
            break;
        }
        case (+aqiAvg >= 201) && (+aqiAvg <= 300) : {
            return {
                aqiColor: "#8F3F97",
                level: "very unhealthy"
            }
            break;
        }
        case (+aqiAvg >= 301) : {
            return {
                aqiColor: "#7E0023",
                level: "Hazardous"
            }
            break;
        }
        default: {
            return {
                aqiColor: "",
                level: ""
            }
        }
    }
}

export default detectTheAirQuality