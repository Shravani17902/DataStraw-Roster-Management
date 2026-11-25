
const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema(
    {
        leaveId: {
            type: String,
            required: true,
            unique: true
        },

        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true
        },

        leaveType: {
            type: String,
            enum: ["Planned Leave", "Sick Leave", "Emergency Leave", "Comp Off"],
            required: true
        },

        startDate: {
            type: Date,
            required: true
        },

        endDate: {
            type: Date,
            required: true
        },

        reason: {
            type: String,
            default: ""
        },

        status: {
            type: String,
            enum: ["Pending", "Approved", "Rejected"],
            default: "Pending"
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

module.exports = mongoose.model("Leave", leaveSchema);
