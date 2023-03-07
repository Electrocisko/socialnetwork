const User = require("../models/user.js");
const bcrypt = require("bcrypt");

// Acciones de prueba
const pruebaUser = (req, res) => {
  return res.status(200).send({
    message: "Mensaje enviado desde controlador controllers/user.js",
  });
};

//Registro de usuarios
const register = (req, res) => {
  let params = req.body;
  if (!params.name || !params.email || !params.nick || !params.password) {
    return res.status(400).json({
      status: "error",
      message: "Error en registro- faltan datos",
    });
  }

  const dataUser = new User(params);

  User.find({
    $or: [
      { email: dataUser.email.toLocaleLowerCase() },
      { nick: dataUser.nick.toLocaleLowerCase() },
    ],
  }).exec((error, users) => {
    if (error) {
      return res.status(400).json({
        status: "error",
        message: "Error en la consulta",
      });
    }
    if (users && users.length >= 1) {
      return res.status(400).json({
        status: "error",
        message: "usuario ya registrado",
      });
    }
    //Codificar password
    bcrypt.hash(dataUser.password, 10, (error, pwd) => {
      dataUser.password = pwd;

      //Grabar usuario en base de datos
      dataUser.save((error, userStored) => {
        if (error || !userStored) {
          return res.status(500).json({
            status: "error",
            message: "Error al guardar",
          });
        }
        if (userStored) {
          return res.status(200).json({
            status: "success",
            message: "Usuario registrado correctamente",
            userStored,
          });
        }
      });
    });
  });
};

// Exportar acciones
module.exports = {
  pruebaUser,
  register,
};
