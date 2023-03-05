const connection = require ("./database/connection.js");
const express = require("express");
const cors = require("cors")

//Mensaje de bienvenida
console.log("API NODE JS");

//Conexion a base de datos;
connection();

//Crear servidor Node
const PORT = 8080;
const app = express();

//Cors
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// ruta de prueba 
app.use('/',(req,res) => {
    return res.status(200).json({
        "id": "1",
        "nombre": "Francisco",
        "web": "electrocisko.com.ar"
    })
});

// hacer escuchar el servidor
const server = app.listen(PORT, () => {
    console.log(`Servidor levantado en http://localhost:${PORT}`)
});