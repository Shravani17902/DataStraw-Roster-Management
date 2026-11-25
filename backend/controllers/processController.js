
const Process = require("../models/Process");

// GET all processes
const getProcesses = async (req, res) => {
    try {
        const processes = await Process.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: processes.length,
            processes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// CREATE process
const createProcess = async (req, res) => {
    try {
        const { processId, name, code, description } = req.body;

        const process = await Process.create({
            processId,
            name,
            code,
            description
        });

        res.status(201).json({
            success: true,
            message: "Process created successfully",
            process
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// UPDATE process
const updateProcess = async (req, res) => {
    try {
        const process = await Process.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!process) {
            return res.status(404).json({
                success: false,
                message: "Process not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Process updated successfully",
            process
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// DELETE process
const deleteProcess = async (req, res) => {
    try {
        const process = await Process.findByIdAndDelete(req.params.id);

        if (!process) {
            return res.status(404).json({
                success: false,
                message: "Process not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Process deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getProcesses,
    createProcess,
    updateProcess,
    deleteProcess
};
