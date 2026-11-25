
const express = require("express");
const router = express.Router();

const {
    getHolidays,
    getHolidayById,
    createHoliday,
    updateHoliday,
    deleteHoliday
} = require("../controllers/holidayController");

// Get all holidays
router.get("/", getHolidays);

// Get holiday by ID
router.get("/:id", getHolidayById);

// Create holiday
router.post("/", createHoliday);

// Update holiday
router.put("/:id", updateHoliday);

// Delete holiday
router.delete("/:id", deleteHoliday);

module.exports = router;
