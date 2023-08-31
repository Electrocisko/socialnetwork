const Publication = require("../models/publication.js");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const followService = require("../services/followService.js");

// Acciones de prueba
const pruebaPublication = (req, res) => {
  return res.status(200).send({
    status: "success",
    message: "Mensaje enviado desde controlador controllers/publicaction.js",
  });
};

// Guardar Publication
const save = async (req, res) => {
  try {
    // obtener datos de req.body
    const params = req.body;
    // Validar si llegan los datos
    if (!params.text)
      return res
        .status(400)
        .send({ status: "error", message: "Campo texto vacio" });
    //Crear y completar el objeto del modelo
    let newPublication = new Publication(params);
    newPublication.user = req.user.id;
    //Guardar el objeto en BD
    const publicationStored = await newPublication.save();
    return res.status(200).json({
      status: "success",
      message: "Publicación guardado correctamente",
      publicationStored,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error al grabar publicación",
      error,
    });
  }
};

// Obtener una publicacion en concreto
const detail = async (req, res) => {
  try {
    // Obtener el id de la publicacion
    const publicactionId = req.params.id;
    //hacer un find con ese id

    let publicationStored = await Publication.findById(publicactionId);
    // devolver la respuesta
    return res.status(200).json({
      status: "success",
      message: "Aca muestro la publicacion en concreto",
      publicationStored,
    });
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: "No se ha podido obtener detail",
      error: error,
    });
  }
};

//Listar publicaciones de un usuario

const user = async (req, res) => {
  try {
    //Obtengo el id por url
    const userId = req.params.id;
    //Obtengo la pagina
    let page = req.params.page ? parseInt(req.params.page) : 1;
    const itemPerPage = 5;

    //Find , populate, ordenar y paginar
    validId = mongoose.isValidObjectId(userId);
    if (!validId || userId == null) {
      return res.status(400).json({
        status: "error",
        message: "Id no valido o nulo",
      });
    }

    await Publication.find({ user: userId })
      .sort("-created_at")
      .populate("user", "-password -__v -role")
      .paginate(page, itemPerPage, (error, publications, total) => {
        return res.status(200).json({
          status: "success",
          message: "Listado de publicaciones ",
          publications,
          page,
          total,
          pages: Math.ceil(total / itemPerPage),
        });
      });
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: "No se ha podido obtener publicaciones",
      error: error,
    });
  }
};

// Listar  todas las publicaciones (FEED)
const feed = async (req, res) => {
  try {
    //Obtener el id del usuario que esta actualmente logeado
    const userId = req.user.id;
    //Obtener la pagina actual
    let page = req.params.page ? parseInt(req.params.page) : 1;
    //Establecer numero de elementos por pagina
    let itemPerPage = 5;
    //Obtener array de id de usuarios que yo sigo como usuario logueado
    const myFollowsList = await followService.followUserIds(userId);
    const followings = myFollowsList.followingList;

    //Find a publicaciones in, ordenar, popular, paginar
    Publication.find({ user: followings })
      .populate("user", "-password -role -__v -email")
      .sort("-created_at")
      .paginate(page, itemPerPage, (error, publications, total) => {
        if (error || !publications) {
          return res.status(400).json({
            status: "error",
            message: "No se ha podido obtener Feeds",
            error: error,
          });
        }
        return res.status(200).json({
          status: "success",
          message: "Feeds Publicaciones",
          page,
          followings,
          publications,
          total,
          pages: Math.ceil(total / itemPerPage),
        });
      });
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: "No se ha podido obtener Feeds",
      error: error,
    });
  }
};

// Eliminar publicaciones
const remove = async (req, res) => {
  try {
    const publicactionId = req.params.id;
    let publicationRemoved = await Publication.find({
      user: req.user.id,
      _id: publicactionId,
    }).remove();

    if (publicationRemoved.deletedCount == 0) {
      return res.status(400).json({
        status: "error",
        message: "No se pudo eliminar o no existe",
      });
    }
    return res.status(200).json({
      status: "success",
      message: "Mensaje Eliminado",
      publicationRemoved,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "No se ha podido remover la publicación",
      error: error,
    });
  }
};

// SUbir ficheros
const uploader = async (req, res) => {
  try {
    //Obtener el id de la publicacion
    const publicactionId = req.params.id;
    //Recoger ficheroy ver si existe
    if (!req.file) {
      return res.status(404).json({
        status: "error",
        message: "Peticion no incluye la imagen",
      });
    }
    let image = req.file.originalname;
    // Hace validacion del archivo y si no es valido lo borra
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

    let publicationUpdated = await Publication.findOneAndUpdate(
      { user: req.user.id, _id: publicactionId },
      { file: req.file.filename },
      { new: true }
    );

    res.status(200).json({
      status: "success",
      publication: publicationUpdated,
      file: req.file,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error en upload imagen",
    });
  }
};

// Devolver multimedia
const media = async (req, res) => {
  const file = req.params.file;
  // Montar el path real de la imagen
  const filePath = "./uploads/publications/" + file;
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

// Exportar acciones
module.exports = {
  pruebaPublication,
  save,
  detail,
  remove,
  user,
  uploader,
  media,
  feed,
};
