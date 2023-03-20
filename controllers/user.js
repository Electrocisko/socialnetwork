const User = require("../models/user.js");
const bcrypt = require("bcrypt");
const {createToken }= require('../services/jwt.js');
const mongoosePaginate = require("mongoose-pagination");



// Acciones de prueba
const pruebaUser = (req, res) => {
  let user = req.user;
  return res.status(200).send({
    message: "Mensaje enviado desde controlador controllers/user.js",
    user
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

// Login de usuario
const login = async (req, res) => {
  // Recoger parametros del body
  const params = req.body;

  if (!params.email || !params.password) {
    return res.status(400).json({
      status: "error",
      message: "Datos incompletos",
    });
  }
  // buscar en la base de datos si existe
  try {
    let user = await User.findOne({ email: params.email });
    if (!user) {
      return res.status(400).json({
        status: "error",
        message: "Usuario no registrado",
      });
    }
    //Comprobar su constraseña
    let pass = bcrypt.compareSync(params.password, user.password);
    if (!pass) {
      return res.status(400).json({
        status: "error",
        message: "Password incorrecto",
      });
    }
    // Devolver Token
    const token = createToken(user);



    return res.status(200).json({
      status: "success",
      message: "Usuario logeado",
      user: {
        id: user._id,
        name: user.name,
        nick: user.nick,
        email: user.email
      },
      token
    });
  } catch (error) {
    console.log(error)
    return res.status(400).json({
      status: "error",
      message: "Error al leer base de datos Login",
    });
  }
};

const profile = async (req,res) => {
  try {
    let id = req.params.id;
    let profile = await User.findById(id).select({password:0, role: 0});
    return res.status(200).json({
      status: 'success',
      message: "Datos de Usuario",
      user: profile
    });
  } catch (error) {
    console.log(error)
    return res.status(400).json({
      status: "error",
      message: "Error o Usuario Inexsistente",
    });
  }




}     

const list = async (req,res) => {
  let page = 1;
  if (req.params.page && parseInt(req.params.page)) {
    page = parseInt(req.params.page) ;
  }
  //Consulta con mongoose pagination
  let ItemPerPage = 1;  

  User.find().sort('_id').paginate(page,ItemPerPage, (error, users, total) => {

    if(error || !users) {
      return res.status(400).json({
        status: "error",
        message: "Error en consulta- no hay usuarios disponibles",
      });
    }

    return res.status(200).json({
      status: 'success',
      message: "Datos de listado de Usuario",
      page,
      ItemPerPage,
      users,
      total,
      pages: false
    });
  })
}


// Exportar acciones
module.exports = {
  pruebaUser,
  register,
  login,
  profile,
  list
};
