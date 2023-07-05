import dotenv from "dotenv";

// Configura las variables de entorno definidas en el archivo .env
dotenv.config();

const port = process.argv[2] || process.env.PORT || 4000;

const dbUrl = process.env.MONGO_URL || process.env.DB_URL;

const secret = process.env.JWT_SECRET || "esta-es-la-api-burger-queen";

const adminEmail = process.env.ADMIN_EMAIL || "admin@localhost";

const adminPassword = process.env.ADMIN_PASSWORD || "changeme";

export default {
    port,
    dbUrl,
    secret,
    adminEmail,
    adminPassword,
};
