
const express = require("express");
const router = express.Router();

const {
    getLeaves,
    getLeaveById,
    createLeave,
    updateLeave,
    deleteLeave
} = require("../controllers/leaveController");

// Get all leaves
router.get("/", getLeaves);

// Get leave by ID
router.get("/:id", getLeaveById);

// Create leave request
router.post("/", createLeave);

// Update leave request
router.put("/:id", updateLeave);

// Delete leave request
router.delete("/:id", deleteLeave);

module.exports = router;
