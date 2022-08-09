const fs = require('fs');
const serverUrl:string = process.env.SERVER_BASE_URL || `http://localhost:3030` //it will come from dot env file

//Interfaces 
import  {
    FileUploadDefault,
    FileUploadDefaultReturn
} from "../interfaces/photoUpload"

//it will upload any base 64 file  in the server 
const uploadAnyImage: (base64:string, agencyName:string, uploadType?:string, extension?:string) => Promise <FileUploadDefaultReturn> = async (base64, agencyName, uploadType, extension) => {
    const myBase64Data:string = base64.split(';base64,')[1] //get the base 64 data of my data
    const userId = agencyName
    const dataExtension = extension || (uploadType !== "default" ? base64.split(';')[0].split('/')[1]  : "png" )//get the extension of my data 
    const fileName:string = `${userId}${+new Date()}.${dataExtension}`
    const saveDirectory:string = `${__dirname}/../public/${fileName}`
    const upload:Promise<FileUploadDefault> = new Promise (resolve => {
        fs.writeFile( saveDirectory , myBase64Data, {encoding: "base64"}, (err: any) => { //this will upload file into public folder
            if(err) {
                console.log(err);
                resolve ({
                    fileAddStatus : false, 
                    fileUrl : ""
                })
            }else{
                const dataUrl = `${serverUrl}/${fileName}`
                console.log("File added successfully");
                resolve ({
                    fileAddStatus : true, 
                    fileUrl : dataUrl
                })
            }
        }) //save the data into public folder
    })
    const {fileAddStatus, fileUrl} = await upload
    // console.log({fileAddStatus})
    return {
        fileUrl,
        fileAddStatus
    }
}

const uploadDefaultPicture: (uploadType:string, agencyName:string) => Promise <FileUploadDefaultReturn> = async (uploadType, agencyName) => {
    let base64:string = "";
    if (uploadType.toLowerCase() == "cover") { //upload default cover picture
        base64 = fs.readFileSync (`${__dirname}/../assert/defaultCoverPicture.jpg`, "base64") //it will convert local default image to base64 format
    }else  if (uploadType.toLowerCase() == "title") { //upload default agency title picture
        base64 = fs.readFileSync (`${__dirname}/../assert/defaultTitlePic.png`, "base64") //it will convert local default image to base64 format
    }
    if (base64) { //if base64 exist then it will execute
        const {fileAddStatus, fileUrl} = await  uploadAnyImage(base64, agencyName.toLowerCase(), "default") //this will upload local server image into server
        return {
            fileAddStatus,
            fileUrl
        }
    }else {
        return {
            fileAddStatus: false,
            fileUrl: ""
        }
    }
}

export {
    uploadAnyImage,
    uploadDefaultPicture
}
