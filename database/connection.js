// const mongoose = require("mongoose");
import mongoose from "mongoose";

const connectionString = "mongodb://localhost:27017/social-zuchi";

const connection = async () => {
        try {
            await mongoose.connect(connectionString);
            console.log('Conectado correctamente a social-zuchi')
        } catch (error) {
            console.log(error);
            throw new Error("No se ha podido conectar a la base de datos");
        }
}

// module.exports = connection;
export default connection;
