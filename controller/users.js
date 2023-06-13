import User from "../model/User.js";

// Obtener una lista de usuarios paginada
export const getUsers = async (req, res, next) => {
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
    const { email } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
        const error = new Error("El usuario ya existe");
        return res.status(400).json({ msg: error.message });
    }

    try {
        const user = new User(req.body);
        await user.save();

        res.json({
            msg: "Usuario creado correctamente",
            data: user,
        });
    } catch (error) {
        console.log(error);
    }
};

// Obtener un usuario por su ID
export const getUser = async (req, res, next) => {
    const uid = req.params.uid;
    try {
        const user = await User.findOne({ _id: uid }).select("-password -__v").lean();
        res.json(user);
    } catch (error) {
        console.log(error);
        const err = new Error("El usuario no existe");
        return res.status(400).json({ msg: err.message });
    }
};

// Eliminar un usuario por su ID
export const deleteUser = async (req, res, next) => {
    const uid = req.params.uid;
    try {
        const user = await User.findOneAndRemove({ _id: uid });
        if (user) {
            res.json({ msg: "Usuario eliminado correctamente" });
        }
        if (!user) {
            const err = new Error("No se encontró el usuario");
            return res.status(400).json({ msg: err.message });
        }
    } catch (error) {
        console.log(error);
        const err = new Error("No se encontró el usuario");
        return res.status(400).json({ msg: err.message });
    }
};

// Actualizar un usuario por su ID
export const updateUser = async (req, res, next) => {
    const userId = req.params.Product;
    const updateData = req.body;

    try {
        const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
            new: true,
            runValidators: true,
        }).select("-password -__v");

        if (!updatedUser) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        res.json(updatedUser);
    } catch (err) {
        next(err);
    }
};
