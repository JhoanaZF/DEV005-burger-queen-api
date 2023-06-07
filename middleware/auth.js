import jwt from "jsonwebtoken";
import User from "../model/User.js";

// Middleware para autenticación y verificación de roles
export default (secret) => (req, resp, next) => {
    const { authorization } = req.headers;

    if (!authorization) {
        return next();
    }

    const [type, token] = authorization.split(" ");

    if (type.toLowerCase() !== "bearer") {
        return next();
    }

    jwt.verify(token, secret, async (err, decodedToken) => {
        if (err) {
            return next(403);
        }

        // TODO: Verificar identidad del usuario usando `decodedToken.uid`
        req.user = await User.findById(decodedToken._id).select("-password -__v");
        console.log(req.user);
        return next();
    });
};

// Función para verificar si el usuario está autenticado
export const isAuthenticated = (req) => {
    // TODO: Decidir por la información del request si la usuaria está autenticada
    if (req.user) {
        return true;
    }

    return false;
};

// Función para verificar si el usuario es un administrador
export const isAdmin = (req) => {
    // TODO: Decidir por la información del request si la usuaria es admin
    if (req.user.role === "admin") {
        return true;
    }

    return false;
};

// Middleware para requerir autenticación
export const requireAuth = (req, resp, next) => (!isAuthenticated(req) ? next(401) : next());

// Middleware para requerir rol de administrador
export const requireAdmin = (req, resp, next) =>
    // eslint-disable-next-line no-nested-ternary
    !isAuthenticated(req) ? next(401) : !isAdmin(req) ? next(403) : next();
