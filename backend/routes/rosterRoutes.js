
const express = require("express");
const router = express.Router();

const {
    getRosters,
    getRosterById,
    generateRoster,
    updateRoster,
    assignBackupEmployee,
    deleteRoster
} = require("../controllers/rosterController");

// GET all rosters
router.get("/", getRosters);

// GET one roster
router.get("/:id", getRosterById);

// GENERATE monthly roster
router.post("/generate", generateRoster);

// ASSIGN backup employee to a roster entry
router.put("/:id/entries/:entryId/backup", assignBackupEmployee);

// UPDATE roster
router.put("/:id", updateRoster);

// DELETE roster
router.delete("/:id", deleteRoster);

module.exports = router;


