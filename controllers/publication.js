const Publication = require("../models/publication.js");

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
const detail = async (req,res) => {
    try {
        // Obtener el id de la publicacion
        const publicactionId = req.params.id;
        //hacer un find con ese id
       
       let publicationStored = await Publication.findById(publicactionId)
        // devolver la respuesta

        return res.status(200).json({
            status: "success",
            message: "Aca muestro la publicacion en concreto",
            publicationStored
        })
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "No se ha podido obtener detail",
            error: error
          });
    }

}

//Listar todas las publicaciones de usarios que sigo

// Listar publicaciones de un usario en concreto

// Eliminar publicaciones

// SUbir ficheros

// Devolver multimedia

// Exportar acciones
module.exports = {
  pruebaPublication,
  save,
  detail
};
