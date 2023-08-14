const Follow = require("../models/follow.js");
const User = require("../models/user.js");


// Acciones de prueba
const pruebaFollow  = (req, res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde controlador controllers/follow.js"
    })
}


//Accion de guardar un follow
const saveFollow =  async (req,res) => {
    // conseguir datos por body
    let params = req.body;
    //sacar el id del usuario
    let identity = req.user;
    //crear objeto con el modelo follow
    let userToFollow = new Follow({
        user: identity.id,
        followed: params.followed
    });
    // Guardar objeto en la base de datos
    try {
       const followStored = await userToFollow.save();
       return  res.status(200).json({
        status: "succes",
        identity: req.user,
        follow: followStored
    })
    } catch (error) {
        return res.status(400).json({
            status:"error",
            message:"No se pudo grabar followed"
        })
    }
}

//Accion de borrar un follow
const deleteFollow = async (req,res) => {
    //Obtener id del usuario logueado
    const userId = req.user.id;
    //Obtener id del usuario que sigo y quiero eliminar
    const followedId = req.params.id;
    //Find de coincidencias y hacer remove
    try {
        const followDeleted = await Follow.find({
            "user": userId,
            "followed": followedId
        }).remove();
        if (followDeleted.deletedCount == 0) {
            return res.status(200).json({
                status: "error",
                message: "No se encontro follow"
            })
        } else {
            return res.status(200).json({
                status: "success",
                followDeleted
            })
        }
     
    } catch (error) {
        return res.status(400).json({
            status:"error",
            message:"No se pudo borrar seguimiento"
        })
    }

  

   
    return res.status(200).send({
        id,
        message: "Mensaje enviado desde controlador controllers/follow.js"
    })
}


// Accion de listar listado que sigo


// Accion de listar seguidores

// Exportar acciones
module.exports = {
    pruebaFollow,
    saveFollow,
    deleteFollow
}