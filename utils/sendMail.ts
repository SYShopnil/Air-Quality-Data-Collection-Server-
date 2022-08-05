const nodemailer = require('nodemailer');
require('dotenv').config() 

//dot env file 
const hostEmail = process.env.HOST_EMAIL || "" // ge the mailer host email address
const hostPassword = process.env.HOST_PASSWORD // ge the host password from dot env file data
const senderEmail:string | undefined = process.env.SENDER_EMAIL  // ge the

const sendMailer = async(from:string, to:string, text:string, subject:string, senderName:string) => {
    try {
        let responseMessage:string = ""
        let responseStatus:boolean = false
        //sent the mail part start 
        let sentFrom:string | undefined = from || senderEmail
        let senderNames = senderName || "User"
        let transporter = nodemailer.createTransport({
            service: "Outlook365",
            host: hostEmail,
            port: "587",
            tls: {
                ciphers: "SSLv3",
                rejectUnauthorized: false,
            },
            auth: {
                user: hostEmail,
                pass: hostPassword,
            }
        });
        const mailOptions = {
            from: sentFrom ,
            to ,
            subject,
            text //this otp 
        } //create the mail option 

    

        const sentMail = (mailOption: {
                from: string | undefined; to: string; subject: string; text: string; //this otp 
            }) => { //create a promise which sent these mail 
            return new Promise ((resolve, reject) => {
                transporter.sendMail(mailOption, (err: string, data: unknown) => {
                    if(err) {
                        console.log(err);
                        responseMessage = err
                        responseStatus = false
                        reject(err)
                    }else {
                        resolve(data)
                        responseMessage =  `A verification code has been sent to ${to}`
                        responseStatus = true
                        // console.log(`A verification code has been sent to ${to}`);
                    }
                }) //sent the mail 
            }) 
        }
        const isSentMail:any = await sentMail(mailOptions)

        if(isSentMail.accepted.length > 0) { //if the mail is successfully sent it will execute
            return {
                message: responseMessage,
                responseStatus
            }
        }else {
            return {
                message: responseMessage,
                responseStatus
            }
        }
        
    }catch(err){
        console.log(err);
        return {
            message: err,
            responseStatus: false,
        }
    }
}
export default sendMailer
