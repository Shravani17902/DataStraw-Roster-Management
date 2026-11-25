
const mongoose = require("mongoose");

const processSchema = new mongoose.Schema(
    {
        processId: {
            type: String,
            required: true,
            unique: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        code: {
            type: String,
            required: true,
            uppercase: true,
            trim: true
        },

        description: {
            type: String,
            default: ""
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

module.exports = mongoose.model("Process", processSchema);
