
const Holiday = require("../models/Holiday");

// GET all holidays
const getHolidays = async (req, res) => {
    try {
        const holidays = await Holiday.find().sort({ date: 1 });

        res.status(200).json({
            success: true,
            count: holidays.length,
            data: holidays
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// GET holiday by ID
const getHolidayById = async (req, res) => {
    try {
        const holiday = await Holiday.findById(req.params.id);

        if (!holiday) {
            return res.status(404).json({
                success: false,
                message: "Holiday not found"
            });
        }

        res.status(200).json({
            success: true,
            data: holiday
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// CREATE holiday
const createHoliday = async (req, res) => {
    try {
        const { holidayId, name, date, description } = req.body;

        if (!holidayId || !name || !date) {
            return res.status(400).json({
                success: false,
                message: "Holiday ID, name and date are required"
            });
        }

        const parsedDate = new Date(date);

        if (isNaN(parsedDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid holiday date"
            });
        }

        const existingHoliday = await Holiday.findOne({ holidayId });

        if (existingHoliday) {
            return res.status(409).json({
                success: false,
                message: "Holiday ID already exists"
            });
        }

        const holiday = await Holiday.create({
            holidayId,
            name,
            date: parsedDate,
            description
        });

        res.status(201).json({
            success: true,
            message: "Holiday created successfully",
            data: holiday
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// UPDATE holiday
const updateHoliday = async (req, res) => {
    try {
        const holiday = await Holiday.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!holiday) {
            return res.status(404).json({
                success: false,
                message: "Holiday not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Holiday updated successfully",
            data: holiday
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// DELETE holiday
const deleteHoliday = async (req, res) => {
    try {
        const holiday = await Holiday.findByIdAndDelete(req.params.id);

        if (!holiday) {
            return res.status(404).json({
                success: false,
                message: "Holiday not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Holiday deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getHolidays,
    getHolidayById,
    createHoliday,
    updateHoliday,
    deleteHoliday
};
