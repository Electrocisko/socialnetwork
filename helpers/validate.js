const validator = require('validator');


const validate = (params) => {
    let name = !validator.isEmpty(params.name); 
    let email = validator.isEmail(params.email);


    if(!name) throw new Error("Error en campo nombre")
    if(!email) throw new Error("Mail no valido")

}

module.exports = validate;
