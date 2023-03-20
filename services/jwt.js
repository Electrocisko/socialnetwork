//importar dependencias
const jwt = require('jwt-simple');
const moment = require('moment');

//Clave secreta
const secret = "Intel_DELL_CORE_i3_23000_FGHYE";

// Generar Token
const createToken = (user) => {
    const payload = {
        id: user._id,
        name: user.name,
        surname: user.surname,
        nick: user.email,
        email: user.email,
        role: user.role,
        image: user.image,
        iat: moment().unix(),
        exp: moment().add(30,"days").unix()
    }
    return jwt.encode(payload, secret);
}


module.exports = {
    createToken,
    secret
} 
