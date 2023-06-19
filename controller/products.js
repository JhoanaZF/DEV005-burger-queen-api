import Product from "../model/Product.js";

// Obtener una lista de productos paginada
export const getProducts = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const products = await Product.find()
        .select("-__v")
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

    res.json(products);
};

// Crear un nuevo producto
export const createProduct = async (req, res, next) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(200).json(product);
    } catch (error) {
        console.log(error);
        const err = new Error("No se pudo crear");
        return res.status(400).json({ msg: err.message });
    }
};

// Obtener un producto por su ID
export const getProduct = async (req, res, next) => {
    const { productId } = req.params;
    try {
        const product = await Product.findOne({ _id: productId }).select("-__v").lean();
        if (!product) {
            const err = new Error("El producto no existe");
            return res.status(404).json({ msg: err.message });
        }
        res.json(product);
    } catch (error) {
        console.log(error);
        const err = new Error("El producto no existe");
        return res.status(404).json({ msg: err.message });
    }
};

// Eliminar un producto por su ID
export const deleteProduct = async (req, res, next) => {
    const { productId } = req.params;
    try {
        const product = await Product.findOneAndRemove({ _id: productId });

        if (!product) {
            const err = new Error("No se encontró el producto");
            return res.status(404).json({ msg: err.message });
        }

        res.json({ msg: "Producto eliminado correctamente" });
    } catch (error) {
        console.log(error);
        const err = new Error("No se encontró el producto");
        return res.status(404).json({ msg: err.message });
    }
};

// Actualizar un producto por su ID
export const updateProduct = async (req, res, next) => {
    const { productId } = req.params;
    const updateData = req.body;
    try {
        if (typeof updateData.price !== "number") {
            return next(400);
        }
        const product = await Product.findOne({ _id: productId });
        if (!product) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }
        const updatedProduct = await Product.findByIdAndUpdate(productId, updateData, {
            new: true,
            runValidators: true,
        }).select("-password -__v");

        if (!updatedProduct) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }
        res.json(updatedProduct);
    } catch (err) {
        next(err);
    }
};
