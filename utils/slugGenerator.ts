function slugGenerator (...content:string[]) {
    let element:string[] = content //store the parameter array in to a local variable 
    let slug:string = "";
    element.map (val => {
        slug += val + "_"
    })
    slug+= Date.now()
    return slug
}

export default slugGenerator
