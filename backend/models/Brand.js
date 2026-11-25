
const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema(
    {
        brandId: {
            type: String,
            required: true,
            unique: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            default: ""
        },

        industry: {
            type: String,
            default: "E-commerce"
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Brand", brandSchema);
