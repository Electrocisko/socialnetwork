const jwt = require('jwt-simple');
const moment = require('moment');
const libjwt = require('../services/jwt.js');
const secret = libjwt.secret;

exports.auth = (req, res, next) => {

    if(!req.headers.authorization) {
        return res.status(403).json({
            status: 'error',
            message: "La peticion no tiene la cabecera de autenticación"
        })
    }
    //Limpio el token de carcateres inecesarios
    let token = req.headers.authorization.replace(/['"]+/g,'');
    //Decodificar Token
    try {
        let payload = jwt.decode(token, secret);
        //Comprobar expiracion
        if (payload.exp <= moment().unix()){
            return res.status(401).json({
                status: 'error',
                message: 'Token Expirado'
            })
        }
        req.user = payload;

    } catch (error) {
        return res.status(404).json({
            status: 'error',
            message: 'Error en validación de Token',
            error
        })
    }
    next();
}