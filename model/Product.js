import mongoose from "mongoose";

// Definición del esquema del modelo de producto
const ProductSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    price: {
        type: Number,
        default: 0,
    },
    image: {
        type: String,
        required: true,
        trim: true,
    },
    type: {
        type: String,
        required: true,
        trim: true,
    },
    dataEntry: {
        type: Date,
        default: Date.now(),
    },
});

// Creación del modelo de producto basado en el esquema definido
const Product = mongoose.model("Product", ProductSchema);

export default Product;
