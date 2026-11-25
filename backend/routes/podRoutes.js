
const express = require("express");
const router = express.Router();

const {
    getPods,
    createPod,
    updatePod,
    deletePod
} = require("../controllers/podController");

// Pod API routes
router.get("/", getPods);
router.post("/", createPod);
router.put("/:id", updatePod);
router.delete("/:id", deletePod);

module.exports = router;
