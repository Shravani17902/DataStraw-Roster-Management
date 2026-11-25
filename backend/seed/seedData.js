
require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");

const Employee = require("../models/Employee");
const Brand = require("../models/Brand");
const Process = require("../models/Process");
const Pod = require("../models/Pod");
const Assignment = require("../models/Assignment");

const seedData = async () => {
    try {
        await connectDB();

        console.log("Starting sample data insertion...");

        // 1. CREATE 24 BRANDS
        const brands = [];

        for (let i = 1; i <= 24; i++) {
            const brand = await Brand.findOneAndUpdate(
                { brandId: `BR-${String(i).padStart(3, "0")}` },
                {
                    brandId: `BR-${String(i).padStart(3, "0")}`,
                    name: `Brand ${i}`,
                    description: `Sample e-commerce brand ${i}`,
                    industry: "E-commerce",
                    isActive: true
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );

            brands.push(brand);
        }

        console.log("24 brands created.");

        // 2. CREATE 5 PROCESSES
        const processNames = [
            { name: "Customer Support", code: "CS" },
            { name: "Order Management", code: "OM" },
            { name: "Returns and Refunds", code: "RR" },
            { name: "Catalog Management", code: "CM" },
            { name: "Quality Assurance", code: "QA" }
        ];

        const processes = [];

        for (let i = 0; i < processNames.length; i++) {
            const item = processNames[i];

            const process = await Process.findOneAndUpdate(
                { processId: `PR-${String(i + 1).padStart(3, "0")}` },
                {
                    processId: `PR-${String(i + 1).padStart(3, "0")}`,
                    name: item.name,
                    code: item.code,
                    description: `${item.name} operations`,
                    isActive: true
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );

            processes.push(process);
        }

        console.log("5 processes created.");

        // 3. CREATE 30 EMPLOYEES
        const employees = [];

        for (let i = 1; i <= 30; i++) {
            const employee = await Employee.findOneAndUpdate(
                { employeeId: `EMP-${String(i).padStart(3, "0")}` },
                {
                    employeeId: `EMP-${String(i).padStart(3, "0")}`,
                    name: `Employee ${i}`,
                    email: `employee${i}@datastraw.demo`,
                    role: i % 6 === 0 ? "Pod Lead" : "Employee",
                    weeklyOffs: i % 2 === 0
                        ? ["Sunday", "Monday"]
                        : ["Sunday", "Saturday"],
                    isActive: true
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );

            employees.push(employee);
        }

        console.log("30 employees created.");

        // 4. CREATE 5 PODS WITH 6 EMPLOYEES EACH
        const pods = [];

        for (let i = 0; i < 5; i++) {
            const members = employees.slice(i * 6, (i + 1) * 6);

            const pod = await Pod.findOneAndUpdate(
                { podId: `POD-${String(i + 1).padStart(2, "0")}` },
                {
                    podId: `POD-${String(i + 1).padStart(2, "0")}`,
                    name: `Operations Pod ${i + 1}`,
                    description: `Operations team ${i + 1}`,
                    podLead: members[0]._id,
                    members: members.map(employee => employee._id),
                    isActive: true
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );

            pods.push(pod);

            // Link employees to their pod
            for (const employee of members) {
                await Employee.findByIdAndUpdate(employee._id, {
                    pod: pod._id
                });
            }
        }

        console.log("5 pods created.");

        // 5. CREATE 30 EMPLOYEE-BRAND-PROCESS ASSIGNMENTS
        // First 20 employees: one dedicated employee per brand.
        // Remaining 10 employees: shared across 4 brands.

        const assignmentPairs = [];

        // 20 dedicated brand assignments
        for (let i = 0; i < 20; i++) {
            assignmentPairs.push({
                employee: employees[i],
                brand: brands[i],
                process: processes[i % processes.length]
            });
        }

        // Shared brands: 3, 3, 2 and 2 employees
        const sharedGroups = [
            [20, 21, 22],
            [23, 24, 25],
            [26, 27],
            [28, 29]
        ];

        for (let groupIndex = 0; groupIndex < sharedGroups.length; groupIndex++) {
            for (const employeeIndex of sharedGroups[groupIndex]) {
                assignmentPairs.push({
                    employee: employees[employeeIndex],
                    brand: brands[20 + groupIndex],
                    process: processes[employeeIndex % processes.length]
                });
            }
        }

        for (let i = 0; i < assignmentPairs.length; i++) {
            const item = assignmentPairs[i];

            await Assignment.findOneAndUpdate(
                { assignmentId: `ASG-${String(i + 1).padStart(3, "0")}` },
                {
                    assignmentId: `ASG-${String(i + 1).padStart(3, "0")}`,
                    employee: item.employee._id,
                    brand: item.brand._id,
                    process: item.process._id,
                    minimumCoverage: 1,
                    workingDays: [
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday",
                        "Saturday",
                        "Sunday"
                    ],
                    weeklyOffs: item.employee.weeklyOffs,
                    shiftStart: "09:00",
                    shiftEnd: "18:00",
                    isActive: true
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
        }

        console.log("30 assignments created.");

        console.log("\nSAMPLE DATA INSERTED SUCCESSFULLY!");
        console.log("24 Brands");
        console.log("5 Processes");
        console.log("30 Employees");
        console.log("5 Pods");
        console.log("30 Assignments");

    } catch (error) {
        console.error("Sample data insertion failed:", error.message);
    } finally {
        await mongoose.disconnect();
        console.log("MongoDB connection closed.");
    }
};

seedData();
