import express from "express";
import cors from "cors";
import config from "./config.js";
import authMiddleware from "./middleware/auth.js";
import errorHandler from "./middleware/error.js";
import routes from "./routes/index.js";
import { connect } from "./connect.js";
import pkg from "./package.json" assert { type: "json" };

// Se obtienen la configuración del archivo config.js
const { port, secret } = config;

// Se crea una instancia de la aplicación Express
const app = express();

// Se establecen las configuraciones en la aplicación
app.set("config", config);

app.set("pkg", pkg);

// Se realiza la conexión a la base de datos
connect();

// Se agrega validación de CORS
const whitelist = ["http://127.0.0.1:5174", "http://localhost:5174", "http://127.0.0.1:5173", "http://localhost:5173", "http://localhost:3000", process.env.FRONTEND_URL];
const corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.includes(origin)) {
            //puede consultar la api
            callback(null, true);
        } else {
            // no esta permitido consultar la api
            callback(new Error("Errors de Cors"));
        }
    },
};
app.use(cors(corsOptions));

// parse application/x-www-form-urlencoded

// Se configura el manejo de datos codificados en la solicitud (application/x-www-form-urlencoded)
app.use(express.urlencoded({ extended: false }));

// Se configura el manejo de datos en formato JSON en la solicitud
app.use(express.json());

// Se agrega el middleware de autenticación utilizando el secreto definido en la configuración
app.use(authMiddleware(secret));

// Se registran las rutas en la aplicación
routes(app, (err) => {
    if (err) {
        throw err;
    }

    app.use(errorHandler);

    app.listen(port, () => {
        console.info(`App listening on port ${port}`);
    });
});
