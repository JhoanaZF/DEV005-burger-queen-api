import jwt from "jsonwebtoken";
import config from "../config.js";
import User from "../model/User.js";

const { secret } = config;

/** @module auth */
const authModule = (app, nextMain) => {
    /**
     * @name /auth
     * @description Crea token de autenticación.
     * @path {POST} /auth
     * @body {String} email Correo
     * @body {String} password Contraseña
     * @response {Object} resp
     * @response {String} resp.token Token a usar para los requests sucesivos
     * @code {200} si la autenticación es correcta
     * @code {400} si no se proveen `email` o `password` o ninguno de los dos
     * @auth No requiere autenticación
     */
    app.post("/login", async (req, resp, next) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(400);
        }

        // TODO: autenticar a la usuarix
        // Hay que confirmar si el email y password
        // coinciden con un user en la base de datos
        // Si coinciden, manda un access token creado con jwt

        const user = await User.findOne({ email });
        if (!user) {
            const error = new Error("El usuario no existe");
            return resp.status(404).json({ msg: error.message });
        }

        const { _id, role } = user;

        const accessToken = jwt.sign({ _id, email, role }, secret, {
            expiresIn: "24h", // 24 horas
        });

        if (await user.checkPassword(password)) {
            resp.json({ accessToken });
        }
        next();
    });

    return nextMain();
};

export default authModule;
