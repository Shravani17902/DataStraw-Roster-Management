
const Pod = require("../models/Pod");

// GET all pods
const getPods = async (req, res) => {
    try {
        const pods = await Pod.find()
            .populate("podLead", "name employeeId email")
            .populate("members", "name employeeId email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: pods.length,
            pods
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// CREATE pod
const createPod = async (req, res) => {
    try {
        const { podId, name, description, podLead, members } = req.body;

        const pod = await Pod.create({
            podId,
            name,
            description,
            podLead: podLead || null,
            members: members || []
        });

        const populatedPod = await Pod.findById(pod._id)
            .populate("podLead", "name employeeId email")
            .populate("members", "name employeeId email");

        res.status(201).json({
            success: true,
            message: "Pod created successfully",
            pod: populatedPod
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// UPDATE pod
const updatePod = async (req, res) => {
    try {
        const pod = await Pod.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        )
            .populate("podLead", "name employeeId email")
            .populate("members", "name employeeId email");

        if (!pod) {
            return res.status(404).json({
                success: false,
                message: "Pod not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Pod updated successfully",
            pod
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// DELETE pod
const deletePod = async (req, res) => {
    try {
        const pod = await Pod.findByIdAndDelete(req.params.id);

        if (!pod) {
            return res.status(404).json({
                success: false,
                message: "Pod not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Pod deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getPods,
    createPod,
    updatePod,
    deletePod
};
