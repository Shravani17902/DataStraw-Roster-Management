
const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
    {
        employeeId: {
            type: String,
            required: true,
            unique: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        role: {
            type: String,
            enum: ["Employee", "Pod Lead", "Manager"],
            default: "Employee"
        },

        pod: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Pod",
            default: null
        },

        weeklyOffs: {
            type: [String],
            default: ["Sunday"]
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

module.exports = mongoose.model("Employee", employeeSchema);
