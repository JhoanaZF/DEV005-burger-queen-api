import { Types } from "mongoose";
import Order from "../model/Order.js";

// Obtener una lista de ordenes paginada
export const getOrders = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const orders = await Order.find()
        .populate({ path: "products.product", select: "-__v" })
        .populate({ path: "userId", select: "-password -__v" })
        .select("-__v")
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

    res.json(orders);
};

// Crear una nueva orden
export const createOrder = async (req, res, next) => {
    try {
        const order = new Order(req.body);
        await order.save();

        await order.populate("products.product");

        res.json(order);
    } catch (error) {
        console.log(error);
        const err = new Error("No se pudo crear");
        return res.status(400).json({ msg: err.message });
    }
};

// Obtener una orden por su ID
export const getOrder = async (req, res, next) => {
    const orderId = req.params.orderId;
    try {
        const order = await Order.findOne({ _id: orderId }).populate({ path: "products.product", select: "-__v" }).populate({ path: "userId", select: "-password -__v" }).select("-__v").lean();
        if (!order) {
            const err = new Error("La orden no existe");
            return res.status(404).json({ msg: err.message });
        }
        res.json(order);
    } catch (error) {
        console.log(error);
        const err = new Error("La orden no existe");
        return res.status(404).json({ msg: err.message });
    }
};

// Eliminar una orden por su ID
export const deleteOrder = async (req, res, next) => {
    const orderId = req.params.orderId;
    try {
        const order = await Order.findOneAndRemove({ _id: orderId });
        if (order) {
            res.json({ msg: "Orden eliminada correctamente" });
        }
        if (!order) {
            const err = new Error("No se encontró la orden");
            return res.status(400).json({ msg: err.message });
        }
    } catch (error) {
        console.log(error);
        const err = new Error("No se encontró la orden");
        return res.status(404).json({ msg: err.message });
    }
};

// Actualizar una orden por su ID
export const updateOrder = async (req, res, next) => {
    const orderId = req.params.orderId;
    const updateData = req.body;
    const statusValues = ["pending", "canceled", "preparing", "delivering", "delivered"];
    try {
        if (!Types.ObjectId.isValid(orderId)) {
            return next(404);
        }

        if (!updateData.status) {
            return next(400);
        }

        if (!statusValues.includes(updateData.status)) {
            return next(400);
        }

        if (updateData.status === "delivered") {
            updateData.dateProcessed = new Date();
        }

        const updatedOrder = await Order.findByIdAndUpdate(orderId, updateData, {
            new: true,
            runValidators: true,
        }).select("-password -__v");

        if (!updatedOrder) {
            return res.status(404).json({ message: "Orden no encontrada" });
        }
        res.json(updatedOrder);
    } catch (err) {
        console.log(err);
        next(err);
    }
};
