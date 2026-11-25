
const mongoose = require("mongoose");
const Holiday = require("../models/Holiday");
require("dotenv").config();

const holidays = [
    {
        holidayId: "HOL-001",
        name: "Republic Day",
        date: "2026-01-26",
        description: "Republic Day of India"
    },
    {
        holidayId: "HOL-002",
        name: "Independence Day",
        date: "2026-08-15",
        description: "Independence Day of India"
    },
    {
        holidayId: "HOL-003",
        name: "Gandhi Jayanti",
        date: "2026-10-02",
        description: "Birth anniversary of Mahatma Gandhi"
    },
    {
        holidayId: "HOL-004",
        name: "Christmas",
        date: "2026-12-25",
        description: "Christmas Day"
    }
];

const seedHolidays = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        await Holiday.insertMany(holidays, { ordered: false });

        console.log("Sample holidays inserted successfully!");
    } catch (error) {
        console.error("Error inserting holidays:", error.message);
    } finally {
        await mongoose.connection.close();
    }
};

seedHolidays();
