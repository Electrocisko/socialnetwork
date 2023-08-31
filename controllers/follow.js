const Follow = require("../models/follow.js");

//Importar servicios
const followService = require("../services/followService.js");

//importar dependencias
const mongoosePaginate = require("mongoose-pagination");

// Acciones de prueba
const pruebaFollow = (req, res) => {
  return res.status(200).send({
    message: "Mensaje enviado desde controlador controllers/follow.js",
  });
};

//Accion de guardar un follow
const saveFollow = async (req, res) => {
  // conseguir datos por body
  let params = req.body;
  //sacar el id del usuario
  let identity = req.user;
  //crear objeto con el modelo follow
  let userToFollow = new Follow({
    user: identity.id,
    followed: params.followed,
  });
  // Guardar objeto en la base de datos
  try {
    const followStored = await userToFollow.save();
    return res.status(200).json({
      status: "succes",
      identity: req.user,
      follow: followStored,
    });
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: "No se pudo grabar followed",
    });
  }
};

//Accion de borrar un follow
const deleteFollow = async (req, res) => {
  //Obtener id del usuario logueado
  const userId = req.user.id;
  //Obtener id del usuario que sigo y quiero eliminar
  const followedId = req.params.id;
  //Find de coincidencias y hacer remove
  try {
    const followDeleted = await Follow.find({
      user: userId,
      followed: followedId,
    }).remove();
    if (followDeleted.deletedCount == 0) {
      return res.status(200).json({
        status: "error",
        message: "No se encontro follow",
      });
    } else {
      return res.status(200).json({
        status: "success",
        followDeleted,
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: "No se pudo borrar seguimiento",
    });
  }
};

// Accion de listar usuarios que estoy siguiendo
const following = async (req, res) => {
  // obtener el id del usuario logueado
  let userId = req.user.id;
  // ver si llega el id por parametro
  if (req.params.id) userId = req.params.id;
  //ver si e llega la pagina
  let page = 1;
  if (req.params.page) page = req.params.page;
  // cuantos usarios por pagina quiero mostrar
  let itemsPerPage = 5;

  // Find a follow , popular datos de los usuarios y paginar con mongose pagination
  Follow.find({ user: userId })
    .populate("user followed", "-password -role -__v -email")
    .paginate(page, itemsPerPage, async (error, follows, total) => {
      //sacar un array de ids de los usuarios que me siguen y los que sigo
      let followUserIds = await followService.followUserIds(req.user.id);
      if (error || !publications) {
        return res.status(400).json({
          status: "error",
          message: "No se ha podido obtener Feeds",
          error: error,
        });
      }

      return res.status(200).json({
        status: "success",
        follows,
        total,
        pages: Math.ceil(total / itemsPerPage),
        user_following: followUserIds.followingList,
        user_follow_me: followUserIds.followersList,
      });
    });
};

// Accion listado de usuarios que  me siguen
const followers = async (req, res) => {
  //Saco el id del usuario identificado
  // compruebo el id que me llega por params
  let userId = req.params.id ? req.params.id : req.user.id;
  let page = 1;
  const ITEMS_PER_PAGE = 5;

  Follow.find({ followed: userId })
    .populate("user", "-password -role -__v -email")
    .paginate(page, ITEMS_PER_PAGE, async (error, follows, total) => {
      let followUserIds = await followService.followUserIds(req.user.id);
      let pages = Math.ceil(total / ITEMS_PER_PAGE);
      if (error || !publications) {
        return res.status(400).json({
          status: "error",
          message: "No se ha podido obtener Follows",
          error: error,
        });
      }
      return res.status(200).json({
        status: "succes",
        message: "Sevuelvo el listado de seguidores que me siguen",
        follows,
        total,
        pages,
        user_following: followUserIds.followingList,
        user_follow_me: followUserIds.followersList,
      });
    });
};

// Exportar acciones
module.exports = {
  pruebaFollow,
  saveFollow,
  deleteFollow,
  following,
  followers,
};
