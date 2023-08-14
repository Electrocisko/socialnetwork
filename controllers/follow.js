const Follow = require("../models/follow.js");
const User = require("../models/user.js");


// Acciones de prueba
const pruebaFollow  = (req, res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde controlador controllers/follow.js"
    })
}


//Accion de guardar un follow
const save = (req,res) => {
    // conseguir datos por body
    let data = req.body;

    console.log(data)

    //sacar el id del usuario

    //crear objeto con el modelo follow

    // Guardar objeto en la base de datos





    return  res.status(200).json({
        status: "succes",
        message: "Salvado",
        identity: req.user
    })
}


//Accion de borrar un follow


// Accion de listar listado que sigo


// Accion de listar seguidores

// Exportar acciones
module.exports = {
    pruebaFollow,
    save
}