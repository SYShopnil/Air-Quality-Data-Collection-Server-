const cookieOptionHandler: (time:number) => {
    expires:any,
    httpOnly: boolean
} = (time) => {
    const options = {
        expires: new Date(
            Date.now() + time * 24 * 60 * 60 * 1000 //days
        ),
        httpOnly: true,
    };
    return options
}

export default cookieOptionHandler
