
const Leave = require("../models/Leave");
const Employee = require("../models/employee");

// GET all leave requests
const getLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find()
            .populate("employee", "employeeId name email")
            .sort({ startDate: 1 });

        res.status(200).json({
            success: true,
            count: leaves.length,
            data: leaves
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// GET leave request by ID
const getLeaveById = async (req, res) => {
    try {
        const leave = await Leave.findById(req.params.id)
            .populate("employee", "employeeId name email");

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: "Leave request not found"
            });
        }

        res.status(200).json({
            success: true,
            data: leave
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// CREATE leave request
const createLeave = async (req, res) => {
    try {
        const {
            leaveId,
            employee,
            leaveType,
            startDate,
            endDate,
            reason,
            status
        } = req.body;

        if (!leaveId || !employee || !leaveType || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required leave details"
            });
        }

        const employeeExists = await Employee.findById(employee);

        if (!employeeExists) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
            return res.status(400).json({
                success: false,
                message: "Please provide valid dates. End date must be on or after start date."
            });
        }

        const existingLeave = await Leave.findOne({ leaveId });

        if (existingLeave) {
            return res.status(409).json({
                success: false,
                message: "Leave ID already exists"
            });
        }

        const leave = await Leave.create({
            leaveId,
            employee,
            leaveType,
            startDate: start,
            endDate: end,
            reason,
            status: status || "Pending"
        });

        res.status(201).json({
            success: true,
            message: "Leave request created successfully",
            data: leave
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// UPDATE leave request
const updateLeave = async (req, res) => {
    try {
        const leave = await Leave.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        ).populate("employee", "employeeId name email");

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: "Leave request not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Leave request updated successfully",
            data: leave
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// DELETE leave request
const deleteLeave = async (req, res) => {
    try {
        const leave = await Leave.findByIdAndDelete(req.params.id);

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: "Leave request not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Leave request deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getLeaves,
    getLeaveById,
    createLeave,
    updateLeave,
    deleteLeave
};
