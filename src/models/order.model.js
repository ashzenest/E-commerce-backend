import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        quantity: {
            type: Number,
            default: 1,
        },
        priceAtOrderTime: {
            type: Number,
            required: true
        }
    }],
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
        default: "processing"
    },
    paymentMethod: {
        type: String,
        enum: ["card", "upi", "netbanking", "wallet", "cod"],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ["paid", "pending", "failed"],
    },
    paidAt: {
        type: Date
    },
    expectedDeliveryDate: {
        type: Date,
        required: true
    },
    shippingAddress: {
        type: String,
        required: true
    }
},{timestamps: true})

export const Order = mongoose.model("Order", orderSchema)