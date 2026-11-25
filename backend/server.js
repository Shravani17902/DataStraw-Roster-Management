
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

// Import routes
const employeeRoutes = require("./routes/employeeRoutes");
const brandRoutes = require("./routes/brandRoutes");
const processRoutes = require("./routes/processRoutes");
const podRoutes = require("./routes/podRoutes");
const rosterRoutes = require("./routes/rosterRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const holidayRoutes = require("./routes/holidayRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Main route
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "DataStraw Roster Management API is running!"
    });
});

// API routes
app.use("/api/employees", employeeRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/processes", processRoutes);
app.use("/api/pods", podRoutes);
app.use("/api/rosters", rosterRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/holidays", holidayRoutes);


// Server configuration
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
};

startServer();




