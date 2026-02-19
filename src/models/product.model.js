import mongoose from "mongoose";

const productSchema = mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    image: {
        type: [{
            type: String,
            required: true
        }],
        validate: {
            validator: function(arr) {
                return arr.length >= 1 && arr.length <= 10
            },
            message: "Product must have between 1 and 10 images"
        }
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    description: {
        type: String
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    status: {
        type: String,
        enum: ["active", "out_of_stock", "coming_soon", "draft"],
        default: "active"
    },
    brand: {
        type: String,
        trim: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
    }
},{
    timestamps: true
})

productSchema.pre("save", function(next){
    if(this.stock === 0 && this.status === 'active'){
        this.status = 'out_of_stock'
    }
    if(this.stock > 0 && this.status === 'out_of_stock'){
        this.status = 'active'
    }
    next()
})

export const Product = mongoose.model("Product", productSchema)