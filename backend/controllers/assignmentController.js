
const Assignment = require("../models/Assignment");

// GET all assignments
const getAssignments = async (req, res) => {
    try {
        const assignments = await Assignment.find()
            .populate("employee", "name employeeId")
            .populate("brand", "name brandId")
            .populate("process", "name code");

        res.status(200).json({
            success: true,
            count: assignments.length,
            assignments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// GET assignment by ID
const getAssignmentById = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id)
            .populate("employee", "name employeeId")
            .populate("brand", "name brandId")
            .populate("process", "name code");

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: "Assignment not found"
            });
        }

        res.status(200).json({
            success: true,
            assignment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// CREATE assignment
const createAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.create(req.body);

        res.status(201).json({
            success: true,
            message: "Assignment created successfully",
            assignment
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// UPDATE assignment
const updateAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: "Assignment not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Assignment updated successfully",
            assignment
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// DELETE assignment
const deleteAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findByIdAndDelete(req.params.id);

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: "Assignment not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Assignment deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getAssignments,
    getAssignmentById,
    createAssignment,
    updateAssignment,
    deleteAssignment
};
