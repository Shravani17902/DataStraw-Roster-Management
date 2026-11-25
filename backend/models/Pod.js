
const mongoose = require("mongoose");

const podSchema = new mongoose.Schema(
    {
        podId: {
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

        podLead: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            default: null
        },

        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Employee"
            }
        ],

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Pod", podSchema);
