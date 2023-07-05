import User from "../model/User.js";
import bcrypt from "bcrypt";

//validar email
const isEmail = (email) => {
    const regEmail = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g;
    return regEmail.test(email ?? "");
};

// Obtener una lista de usuarios paginada
export const getUsers = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const users = await User.find()
        .select("-password -__v")
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

    res.json(users);
};

// Crear un nuevo usuario
export const createUser = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(400);
    }

    if (!isEmail(email)) {
        return next(400);
    }

    if (password.length < 5) {
        return next(400);
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        const error = new Error("El usuario ya existe");
        return res.status(403).json({ msg: error.message });
    }

    try {
        //crear usuario
        const user = new User(req.body);
        await user.save();

        res.json({ email: user.email, _id: user._id, role: user.role });
    } catch (error) {
        console.log(error);
    }
};

// Obtener un usuario por su ID
export const getUser = async (req, res, next) => {
    const { uid } = req.params;
    try {
        const user = await User.findOne({ email: uid }).select("-password -__v").lean();
        if (!user) {
            const err = new Error("El usuario no existe");
            return res.status(404).json({ msg: err.message });
        }

        if (req.user.role === "admin") {
            return res.json(user);
        }
        if (req.user.email === user.email) {
            return res.json(user);
        }

        return next(403);
    } catch (error) {
        console.log(error);
        const err = new Error("El usuario no existe");
        return res.status(400).json({ msg: err.message });
    }
};

// Eliminar un usuario por su ID
export const deleteUser = async (req, res, next) => {
    const { uid } = req.params;
    try {
        const user = await User.findOneAndRemove({ email: uid });
        if (user) {
            res.json({ msg: "Usuario eliminado correctamente" });
        }
        if (!user) {
            const err = new Error("No se encontró el usuario");
            return res.status(404).json({ msg: err.message });
        }
    } catch (error) {
        console.log(error);
        const err = new Error("No se encontró el usuario");
        return res.status(404).json({ msg: err.message });
    }
};

// Actualizar un usuario por su ID
export const updateUser = async (req, res, next) => {
    const userId = req.params.uid;
    const updateData = req.body;

    try {
        if (!isEmail(userId)) {
            return next(405);
        }

        const user = await User.findOne({ email: userId });

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        if (req.user.role !== "admin") {
            if (req.user.email !== user.email) {
                return next(403);
            }
        }

        if (updateData.password || updateData.role) {
        } else {
            return next(400);
        }

        if (req.user.role !== "admin" && updateData.role === "admin") {
            return next(403);
        }

        if (updateData?.password) {
            const salt = await bcrypt.genSalt(10);

            updateData.password = await bcrypt.hash(updateData.password, salt);
        }

        const updatedUser = await User.findByIdAndUpdate(user._id, updateData, {
            new: true,
            runValidators: true,
        }).select("-password -__v");

        if (!updatedUser) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        res.json(updatedUser);
    } catch (err) {
        console.log(err);
        return next(404);
    }
};
