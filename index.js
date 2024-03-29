const connection = require ("./database/connection.js");
const express = require("express");
const cors = require("cors");
const userRoutes = require('./routes/user.js');
const publicationRoutes = require('./routes/publication.js');
const followRoutes = require('./routes/follow.js');



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

//Cargar rutas  
app.use('/api/user',userRoutes );
app.use('/api/publication',  publicationRoutes);
app.use('/api/follow', followRoutes);

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