import mongoose, { Schema } from "mongoose";

// Definición del esquema del modelo de Orden
const OrderSchema = mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    client: {
        type: String,
        default: "",
    },
    products: [
        {
            qty: {
                type: Number,
                default: 1,
            },
            product: {
                type: Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },
            _id: false,
        },
    ],
    status: {
        type: String,
        enum: ["pending", "canceled", "preparing", "delivering", "delivered"],
        default: "pending",
    },
    dateEntry: {
        type: Date,
        default: Date.now(),
    },
    dateProcessed: {
        type: Date,
    },
});
const Order = mongoose.model("Order", OrderSchema);

export default Order;
