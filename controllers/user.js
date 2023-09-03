const User = require("../models/user.js");
const Follow = require("../models/follow.js");
const Publication = require("../models/publication.js");
const bcrypt = require("bcrypt");
const { createToken } = require("../services/jwt.js");
const fs = require("fs");
const path = require("path");
const followService = require("../services/followService.js");
const mongoose = require('mongoose');



// Acciones de prueba
const pruebaUser = (req, res) => {
  let user = req.user;
  return res.status(200).send({
    message: "Mensaje enviado desde controlador controllers/user.js",
    user,
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
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      status: "error",
      message: "Error al leer base de datos Login",
    });
  }
};

const profile = async (req, res) => {
  try {
    let id = req.params.id;
    //Chequear  si  el id es valido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status:"error",
        message:"Id ingresado no valido"
      })
    }
    let profile = await User.findById(id).select({ password: 0, role: 0 , __v:0});
    //info de seguimiento
    const followInfo = await followService.followThisUser(req.user.id, id)
    return res.status(200).json({
      status: "success",
      user: profile,
      followwing: followInfo.following,
      follower: followInfo.follower
      //////////////////////////////
    });
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: "Error o Usuario Inexsistente",
    });
  }
};

const list = async (req, res) => {
  let page = 1;
  if (req.params.page && parseInt(req.params.page)) {
    page = parseInt(req.params.page);
  }
  //Consulta con mongoose pagination
  let ItemPerPage = 5;

  User.find()
    .select("-password -email -__v -rol")
    .sort("_id")
    .paginate(page, ItemPerPage,async (error, users, total) => {
      if (error || !users) {
        return res.status(400).json({
          status: "error",
          message: "Error en consulta- no hay usuarios disponibles",
        });
      }

      //sacar un array de ids de los usuarios que me siguen y los que sigo
      let followUsersIds = await followService.followUserIds(req.user.id)

      let pages = Math.ceil(total/ItemPerPage);

      return res.status(200).json({
        status: "success",
        message: "Datos de listado de Usuario",
        page,
        ItemPerPage,
        users,
        total,
        pages,
        user_following: followUsersIds.followingList,
        user_follow_me: followUsersIds.followersList
      });
    });
};

const update = async (req, res) => {
  // Trae la informacion del usuario a actualizar
  let userIdentity = req.user; //Datos viejos del Token
  let userToUpdate = req.body; //Datos del request
  if (!userToUpdate.email || !userToUpdate.nick) {
    return res.status(400).json({
      status: "error",
      message: "Error en registro- faltan datos",
    });
  }

  // Elimino campos para que no se puedan actualizar
  delete userToUpdate.iat;
  delete userToUpdate.exp;
  delete userToUpdate.role;
  delete userToUpdate.image;

  //Comprobar si el usuario ya existe

  try {
    let users = await User.find({
      $or: [
        { email: userToUpdate.email.toLowerCase() },
        { nick: userToUpdate.nick.toLowerCase() },
      ],
    });

    let userIsset = false;
    users.forEach((user) => {
      if (user && user._id != userIdentity.id) userIsset = true;
    });

    if (userIsset) {
      return res.status(200).json({
        status: "success",
        message: "El usuario ya existe",
      });
    }
    //Cifrar la contraseña
    if (userToUpdate.password) {
      let pwd = await bcrypt.hash(userToUpdate.password, 10);
      userToUpdate.password = pwd;
    } 
    // Actualizar Base
    let userUpdate = await User.findByIdAndUpdate(
      userIdentity.id,
      userToUpdate,
      { new: true }
    ).select("-password -role -__v")

    res.status(200).json({
      status: "succes",
      message: "Update Data User",
      userUpdate,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error in update",
    });
  }
};

const uploader = async (req, res) => {
  try {
    //Recoger ficheroy ver si existe
    if (!req.file) {
      return res.status(404).json({
        status: "error",
        message: "Peticion no incluye la imagen",
      });
    }
    let image = req.file.originalname;
    // Hce validacion del archivo y si no es valido lo borra
    const imageSplit = image.split(".");
    const extension = imageSplit[1];
    if (extension != "png" && extension != "jpg" && extension != "gif") {
      const filePath = req.file.path;
      const fileDeleted = fs.unlinkSync(filePath);
      return res.status(400).json({
        status: "error",
        message: "Extensión del fichero invalido",
      });
    }

    let userUpdated = await User.findByIdAndUpdate(
      req.user.id,
      { image: req.file.filename },
      { new: true }
    );

    res.status(200).json({
      status: "success",
      user: userUpdated,
      file: req.file,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error en upload imagen",
    });
  }
};

const avatar = async (req, res) => {
  const file = req.params.file;
  // Montar el path real de la imagen
  const filePath = "./uploads/avatars/" + file;
  //Comprobar que existe con el metodo stat de file system fs.
  fs.stat(filePath, (error, exist) => {
    if (!exist) {
      return res.status(404).json({
        status: "error",
        message: "Imagen no encontrada",
        filePath,
        exist,
      });
    }
    //Devolver un file
    return res.sendFile(path.resolve(filePath));
  });
};

const counters = async (req,res) => {
      // Contar cantidad de follows, followings y publicationes
  try {
    let userId = req.user.id;
    // ver si llega el id por parametro
    if (req.params.id) userId = req.params.id;
      //Chequear  si  el id es valido
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          status:"error",
          message:"Id ingresado no valido"
        })
      }


    let quantityFollowers = await Follow.count({"user": userId});
    let quantityFollowings = await Follow.count({"followed": userId});
    let quantityPublicactions = await Publication.count({user:userId});

    return res.status(200).json({
      status:"succes",
      message:"Quantitys",
      userId,
      quantityFollowers,
      quantityFollowings,
      quantityPublicactions
    })
  } catch (error) {
    res.status(500).json({
      status: "error",
      error
    });
  }
}

// Exportar acciones
module.exports = {
  pruebaUser,
  register,
  login,
  profile,
  list,
  update,
  uploader,
  avatar,
  counters
};
