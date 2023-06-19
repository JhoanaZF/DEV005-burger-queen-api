import dotenv from "dotenv";

// Configura las variables de entorno definidas en el archivo .env
dotenv.config();

// Obtiene el número de puerto de la variable de entorno PORT o utiliza el valor 4000 como valor predeterminado
const port = process.argv[2] || process.env.PORT || 4000;
// Obtiene la URL de la base de datos de la variable de entorno MONGO_URL o DB_URL
const dbUrl = process.env.MONGO_URL || process.env.DB_URL;
// Obtiene la clave secreta para JWT de la variable de entorno JWT_SECRET o utiliza "esta-es-la-api-burger-queen" como valor predeterminado
const secret = process.env.JWT_SECRET || "esta-es-la-api-burger-queen";
// Obtiene el correo electrónico del administrador de la variable de entorno ADMIN_EMAIL o utiliza "admin@localhost" como valor predeterminado
const adminEmail = process.env.ADMIN_EMAIL || "admin@localhost";
// Obtiene la contraseña del administrador de la variable de entorno ADMIN_PASSWORD o utiliza "changeme" como valor predeterminado
const adminPassword = process.env.ADMIN_PASSWORD || "changeme";

export default {
    port,
    dbUrl,
    secret,
    adminEmail,
    adminPassword,
};
