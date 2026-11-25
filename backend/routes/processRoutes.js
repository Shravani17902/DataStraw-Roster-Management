
const express = require("express");
const router = express.Router();

const {
    getProcesses,
    createProcess,
    updateProcess,
    deleteProcess
} = require("../controllers/processController");

// Process API routes
router.get("/", getProcesses);
router.post("/", createProcess);
router.put("/:id", updateProcess);
router.delete("/:id", deleteProcess);

module.exports = router;
