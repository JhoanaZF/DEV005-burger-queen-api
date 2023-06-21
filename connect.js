import mongoose from "mongoose";
import config from "./config.js";

// Obtiene la URL de la base de datos del objeto de configuración
// eslint-disable-next-line no-unused-vars
const { dbUrl } = config;

// La función `connect` se utiliza para establecer una conexión a la base de datos
async function connect() {
    // TODO: Conexión a la Base de Datos
    try {
        await mongoose.connect(dbUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("database conectada");
    } catch (error) {
        console.log(`error: ${error.message}`);
        process.exit(1);
    }
}

export { connect };
