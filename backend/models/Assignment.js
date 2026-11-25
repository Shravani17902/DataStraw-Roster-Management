
const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
    {
        assignmentId: {
            type: String,
            required: true,
            unique: true
        },

        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true
        },

        brand: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Brand",
            required: true
        },

        process: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Process",
            required: true
        },

        minimumCoverage: {
            type: Number,
            default: 1,
            min: 1
        },

        workingDays: {
            type: [String],
            default: [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday"
            ]
        },

        weeklyOffs: {
            type: [String],
            default: ["Sunday"]
        },

        shiftStart: {
            type: String,
            default: "09:00"
        },

        shiftEnd: {
            type: String,
            default: "18:00"
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

module.exports = mongoose.model("Assignment", assignmentSchema);
