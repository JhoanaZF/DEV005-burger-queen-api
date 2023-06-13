import mongoose from "mongoose";
import bcrypt from "bcrypt";

// Definición del esquema del modelo de usuario
const UserSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    role: {
        type: String,
        enum: ["admin", "waiter", "chef"],
        default: "waiter",
        trim: true,
    },
});

// Función middleware ejecutada antes de guardar un usuario en la base de datos
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }

    const salt = await bcrypt.genSalt(10); 

    this.password = await bcrypt.hash(this.password, salt);

    next();
});

// Método para verificar si una contraseña coincide con la contraseña almacenada en el modelo de usuario
UserSchema.methods.checkPassword = async function (passwordForm) {
    return await bcrypt.compare(passwordForm, this.password); 
};

// Creación del modelo de usuario basado en el esquema definido
const User = mongoose.model("User", UserSchema);

export default User;
