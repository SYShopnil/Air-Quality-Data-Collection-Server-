const otpGenerator: (digit:number) => string = (digit) => {
    let newOtp:string
    //generate 4 digit id 
    let randomNumberGenerator:string = ""
    for(let i:number = 1 ; i<=digit; i++ ){
        randomNumberGenerator = Math.floor(Math.random() * 9 + 1) + randomNumberGenerator
    } //generate the random number form appointment
    newOtp = randomNumberGenerator
    return newOtp

}
export default otpGenerator
