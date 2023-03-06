// Acciones de prueba
const pruebaPublication  = (req, res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde controlador controllers/publicaction.js"
    })
}

// Exportar acciones
module.exports = {
    pruebaPublication
}