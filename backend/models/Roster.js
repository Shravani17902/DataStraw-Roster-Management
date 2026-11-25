
const mongoose = require("mongoose");

const rosterSchema = new mongoose.Schema(
    {
        rosterId: {
            type: String,
            required: true,
            unique: true
        },

        month: {
            type: Number,
            required: true,
            min: 1,
            max: 12
        },

        year: {
            type: Number,
            required: true
        },

        assignments: [
            {
                assignment: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Assignment",
                    required: true
                },

                employee: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Employee",
                    required: true
                },

                // Backup employee assigned to cover this shift
                backupEmployee: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Employee",
                    default: null
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

                date: {
                    type: Date,
                    required: true
                },

                shiftStart: {
                    type: String,
                    default: "09:00"
                },

                shiftEnd: {
                    type: String,
                    default: "18:00"
                },

                status: {
                    type: String,
                    enum: [
                        "Working",
                        "Weekly Off",
                        "Leave",
                        "Holiday",
                        "Comp Off"
                    ],
                    default: "Working"
                }
            }
        ],

        generatedBy: {
            type: String,
            default: "System"
        },

        status: {
            type: String,
            enum: ["Draft", "Published"],
            default: "Draft"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Roster", rosterSchema);




