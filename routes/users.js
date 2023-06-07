import { requireAuth, requireAdmin } from "../middleware/auth.js";

import { createUser, deleteUser, getUser, getUsers, updateUser } from "../controller/users.js";
import User from "../model/User.js";

const initAdminUser = async (app, next) => {
    const { adminEmail, adminPassword } = app.get("config");
    if (!adminEmail || !adminPassword) {
        return next();
    }

    const adminUser = {
        email: adminEmail,
        password: adminPassword,
        role: "admin",
    };

    // TODO: crear usuaria admin
    // Primero ver si ya existe adminUser en base de
    // si no existe, hay que crearlo

    const userExists = await User.findOne({ email: adminUser.email });
    if (!userExists) {
        try {
            const user = new User(adminUser);
            await user.save();
        } catch (error) {
            console.log(error);
        }
    }
    next();
};

/*
 * Diagrama de flujo de una aplicación y petición en node - express :
 *
 * request  -> middleware1 -> middleware2 -> route
 *                                             |
 * response <- middleware4 <- middleware3   <---
 *
 * la gracia es que la petición va pasando por cada una de las funciones
 * intermedias o "middlewares" hasta llegar a la función de la ruta, luego esa
 * función genera la respuesta y esta pasa nuevamente por otras funciones
 * intermedias hasta responder finalmente a la usuaria.
 *
 * Un ejemplo de middleware podría ser una función que verifique que una usuaria
 * está realmente registrado en la aplicación y que tiene permisos para usar la
 * ruta. O también un middleware de traducción, que cambie la respuesta
 * dependiendo del idioma de la usuaria.
 *
 * Es por lo anterior que siempre veremos los argumentos request, response y
 * next en nuestros middlewares y rutas. Cada una de estas funciones tendrá
 * la oportunidad de acceder a la consulta (request) y hacerse cargo de enviar
 * una respuesta (rompiendo la cadena), o delegar la consulta a la siguiente
 * función en la cadena (invocando next). De esta forma, la petición (request)
 * va pasando a través de las funciones, así como también la respuesta
 * (response).
 */

/** @module users */
export default (app, next) => {
    /**
     * @name GET /users
     * @description Lista usuarias
     * @path {GET} /users
     * @query {String} [page=1] Página del listado a consultar
     * @query {String} [limit=10] Cantitad de elementos por página
     * @header {Object} link Parámetros de paginación
     * @header {String} link.first Link a la primera página
     * @header {String} link.prev Link a la página anterior
     * @header {String} link.next Link a la página siguiente
     * @header {String} link.last Link a la última página
     * @auth Requiere `token` de autenticación y que la usuaria sea **admin**
     * @response {Array} users
     * @response {String} users[]._id
     * @response {Object} users[].email
     * @response {Object} users[].roles
     * @response {Boolean} users[].roles.admin
     * @code {200} si la autenticación es correcta
     * @code {401} si no hay cabecera de autenticación
     * @code {403} si no es ni admin
     */
    app.get("/users", requireAdmin, getUsers);

    /**
     * @name GET /users/:uid
     * @description Obtiene información de una usuaria
     * @path {GET} /users/:uid
     * @params {String} :uid `id` o `email` de la usuaria a consultar
     * @auth Requiere `token` de autenticación y que la usuaria sea **admin** o la usuaria a consultar
     * @response {Object} user
     * @response {String} user._id
     * @response {Object} user.email
     * @response {Object} user.roles
     * @response {Boolean} user.roles.admin
     * @code {200} si la autenticación es correcta
     * @code {401} si no hay cabecera de autenticación
     * @code {403} si no es ni admin o la misma usuaria
     * @code {404} si la usuaria solicitada no existe
     */
    app.get("/users/:uid", requireAuth, getUser);

    /**
     * @name POST /users
     * @description Crea una usuaria
     * @path {POST} /users
     * @body {String} email Correo
     * @body {String} password Contraseña
     * @body {Object} [roles]
     * @body {Boolean} [roles.admin]
     * @auth Requiere `token` de autenticación y que la usuaria sea **admin**
     * @response {Object} user
     * @response {String} user._id
     * @response {Object} user.email
     * @response {Object} user.roles
     * @response {Boolean} user.roles.admin
     * @code {200} si la autenticación es correcta
     * @code {400} si no se proveen `email` o `password` o ninguno de los dos
     * @code {401} si no hay cabecera de autenticación
     * @code {403} si ya existe usuaria con ese `email`
     */
    app.post("/users", requireAdmin, createUser);

    /**
     * @name PUT /users
     * @description Modifica una usuaria
     * @params {String} :uid `id` o `email` de la usuaria a modificar
     * @path {PUT} /users
     * @body {String} email Correo
     * @body {String} password Contraseña
     * @body {Object} [roles]
     * @body {Boolean} [roles.admin]
     * @auth Requiere `token` de autenticación y que la usuaria sea **admin** o la usuaria a modificar
     * @response {Object} user
     * @response {String} user._id
     * @response {Object} user.email
     * @response {Object} user.roles
     * @response {Boolean} user.roles.admin
     * @code {200} si la autenticación es correcta
     * @code {400} si no se proveen `email` o `password` o ninguno de los dos
     * @code {401} si no hay cabecera de autenticación
     * @code {403} si no es ni admin o la misma usuaria
     * @code {403} una usuaria no admin intenta de modificar sus `roles`
     * @code {404} si la usuaria solicitada no existe
     */
    app.put("/users/:uid", requireAuth, updateUser);

    /**
     * @name DELETE /users
     * @description Elimina una usuaria
     * @params {String} :uid `id` o `email` de la usuaria a modificar
     * @path {DELETE} /users
     * @auth Requiere `token` de autenticación y que la usuaria sea **admin** o la usuaria a eliminar
     * @response {Object} user
     * @response {String} user._id
     * @response {Object} user.email
     * @response {Object} user.roles
     * @response {Boolean} user.roles.admin
     * @code {200} si la autenticación es correcta
     * @code {401} si no hay cabecera de autenticación
     * @code {403} si no es ni admin o la misma usuaria
     * @code {404} si la usuaria solicitada no existe
     */
    app.delete("/users/:uid", requireAuth, deleteUser);

    initAdminUser(app, next);
};