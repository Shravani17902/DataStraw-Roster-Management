const Roster = require("../models/Roster");
const Assignment = require("../models/Assignment");
const Employee = require("../models/Employee");
const Leave = require("../models/Leave");
const Holiday = require("../models/Holiday");

// Convert date into YYYY-MM-DD format
const getDateKey = (date) => {
    return new Date(date).toISOString().split("T")[0];
};

// Get ID whether the value is populated or an ObjectId
const getId = (value) => {
    if (!value) return "";
    return value._id ? value._id.toString() : value.toString();
};

// Convert HH:MM into minutes
const getTimeInMinutes = (time) => {
    if (!time) return 0;

    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
};

// Check whether two shifts overlap
const shiftsOverlap = (start1, end1, start2, end2) => {
    const firstStart = getTimeInMinutes(start1);
    const firstEnd = getTimeInMinutes(end1);
    const secondStart = getTimeInMinutes(start2);
    const secondEnd = getTimeInMinutes(end2);

    return firstStart < secondEnd && secondStart < firstEnd;
};

// Validate roster coverage and employee shift conflicts
const validateRoster = (entries) => {
    const errors = [];
    const coverageMap = new Map();
    const employeeShifts = new Map();

    entries.forEach((entry) => {
        const dateKey = getDateKey(entry.date);
        const brandId = getId(entry.brand);
        const processId = getId(entry.process);
        const employeeId = getId(entry.employee);
        const backupEmployeeId = getId(entry.backupEmployee);

        const coverageKey = `${dateKey}-${brandId}-${processId}`;

        if (!coverageMap.has(coverageKey)) {
            coverageMap.set(coverageKey, {
                date: dateKey,
                brand: brandId,
                process: processId,
                required: 1,
                shouldCheckCoverage: false,
                workingEmployees: new Set()
            });
        }

        const coverage = coverageMap.get(coverageKey);

        coverage.required = Math.max(
            coverage.required,
            entry.minimumCoverage || 1
        );

        if (
            entry.status !== "Weekly Off" &&
            entry.status !== "Holiday"
        ) {
            coverage.shouldCheckCoverage = true;
        }

        // Count the actual worker for this roster entry.
        // A backup covers the original employee's Leave or Comp Off.
        let workerId = "";

        if (entry.status === "Working") {
            workerId = employeeId;
        } else if (
            ["Leave", "Comp Off"].includes(entry.status) &&
            backupEmployeeId
        ) {
            workerId = backupEmployeeId;
        }

        if (!workerId) return;

        coverage.workingEmployees.add(workerId);

        const shiftKey = `${dateKey}-${workerId}`;

        if (!employeeShifts.has(shiftKey)) {
            employeeShifts.set(shiftKey, []);
        }

        const shifts = employeeShifts.get(shiftKey);

        shifts.forEach((existingShift) => {
            if (
                shiftsOverlap(
                    entry.shiftStart,
                    entry.shiftEnd,
                    existingShift.shiftStart,
                    existingShift.shiftEnd
                )
            ) {
                errors.push({
                    type: "SHIFT_OVERLAP",
                    date: dateKey,
                    employee: workerId,
                    message: "Employee has overlapping shifts."
                });
            }
        });

        shifts.push(entry);
    });

    coverageMap.forEach((coverage) => {
        if (!coverage.shouldCheckCoverage) return;

        const actual = coverage.workingEmployees.size;

        if (actual < coverage.required) {
            errors.push({
                type: "COVERAGE_GAP",
                date: coverage.date,
                brand: coverage.brand,
                process: coverage.process,
                required: coverage.required,
                actual,
                message: `Insufficient coverage. Required: ${coverage.required}, Available: ${actual}`
            });
        }
    });

    return {
        isValid: errors.length === 0,
        errors
    };
};

// GET all rosters
const getRosters = async (req, res) => {
    try {
        const rosters = await Roster.find()
            .populate("assignments.employee")
            .populate("assignments.backupEmployee")
            .populate("assignments.brand")
            .populate("assignments.process")
            .populate("assignments.assignment")
            .sort({ year: -1, month: -1 });

        res.status(200).json({
            success: true,
            count: rosters.length,
            rosters
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// GET roster by ID
const getRosterById = async (req, res) => {
    try {
        const roster = await Roster.findById(req.params.id)
            .populate("assignments.employee")
            .populate("assignments.backupEmployee")
            .populate("assignments.brand")
            .populate("assignments.process")
            .populate("assignments.assignment");

        if (!roster) {
            return res.status(404).json({
                success: false,
                message: "Roster not found."
            });
        }

        const validation = validateRoster(roster.assignments);

        res.status(200).json({
            success: true,
            roster,
            validation
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// GENERATE monthly roster
const generateRoster = async (req, res) => {
    try {
        const { month, year } = req.body;

        if (
            !month ||
            !year ||
            !Number.isInteger(Number(month)) ||
            !Number.isInteger(Number(year)) ||
            Number(month) < 1 ||
            Number(month) > 12
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid month and year."
            });
        }

        const selectedMonth = Number(month);
        const selectedYear = Number(year);

        // Prevent duplicate monthly rosters
        const existingRoster = await Roster.findOne({
            month: selectedMonth,
            year: selectedYear
        });

        if (existingRoster) {
            return res.status(400).json({
                success: false,
                message: "A roster already exists for this month and year."
            });
        }

        // Get all active assignments
        const assignments = await Assignment.find({
            isActive: true
        });

        if (!assignments.length) {
            return res.status(400).json({
                success: false,
                message: "No active assignments found."
            });
        }

        // UTC boundaries for the selected month
        const monthStart = new Date(
            Date.UTC(selectedYear, selectedMonth - 1, 1)
        );

        const nextMonthStart = new Date(
            Date.UTC(selectedYear, selectedMonth, 1)
        );

        const monthEnd = new Date(
            nextMonthStart.getTime() - 1
        );

        // Get approved leaves overlapping the selected month
        const approvedLeaves = await Leave.find({
            status: "Approved",
            isActive: true,
            startDate: {
                $lte: monthEnd
            },
            endDate: {
                $gte: monthStart
            }
        });

        // Get public holidays for the selected month
        const holidays = await Holiday.find({
            isActive: true,
            date: {
                $gte: monthStart,
                $lt: nextMonthStart
            }
        });

        const rosterEntries = [];

        // Number of days in selected month
        const daysInMonth = new Date(
            Date.UTC(selectedYear, selectedMonth, 0)
        ).getUTCDate();

        // Generate roster entries
        for (const assignment of assignments) {
            for (let day = 1; day <= daysInMonth; day++) {

                // Create date using UTC to avoid timezone shifts
                const currentDate = new Date(
                    Date.UTC(selectedYear, selectedMonth - 1, day)
                );

                const dateKey = getDateKey(currentDate);

                // Get weekday using UTC
                const dayName = currentDate.toLocaleDateString(
                    "en-US",
                    {
                        weekday: "long",
                        timeZone: "UTC"
                    }
                );

                const employeeId = getId(assignment.employee);

                // Check employee leave
                const employeeLeave = approvedLeaves.find((leave) => {
                    return (
                        getId(leave.employee) === employeeId &&
                        dateKey >= getDateKey(leave.startDate) &&
                        dateKey <= getDateKey(leave.endDate)
                    );
                });

                // Check public holiday
                const isHoliday = holidays.some(
                    (holiday) =>
                        getDateKey(holiday.date) === dateKey
                );

                // Check assignment weekly off and working days
                const isWeeklyOff =
                    (assignment.weeklyOffs || []).includes(dayName) ||
                    !(assignment.workingDays || []).includes(dayName);

                // Determine employee status
                let status = "Working";

                if (employeeLeave) {
                    status =
                        employeeLeave.leaveType === "Comp Off"
                            ? "Comp Off"
                            : "Leave";
                } else if (isHoliday) {
                    status = "Holiday";
                } else if (isWeeklyOff) {
                    status = "Weekly Off";
                }

                rosterEntries.push({
                    assignment: assignment._id,
                    employee: assignment.employee,
                    brand: assignment.brand,
                    process: assignment.process,
                    minimumCoverage: assignment.minimumCoverage || 1,
                    date: currentDate,
                    shiftStart: assignment.shiftStart || "09:00",
                    shiftEnd: assignment.shiftEnd || "18:00",
                    status
                });
            }
        }

        // Validate generated roster
        const validation = validateRoster(rosterEntries);

        // Save roster as Draft
        const roster = await Roster.create({
            rosterId: `ROS-${selectedYear}-${String(selectedMonth).padStart(2, "0")}`,
            month: selectedMonth,
            year: selectedYear,
            assignments: rosterEntries,
            generatedBy: "System",
            status: "Draft"
        });

        res.status(201).json({
            success: true,
            message: validation.isValid
                ? "Monthly roster generated successfully. No validation errors found."
                : "Monthly roster generated, but validation issues were found. Review them before publishing.",
            roster,
            validation
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// UPDATE roster
const updateRoster = async (req, res) => {
    try {
        const roster = await Roster.findById(req.params.id);

        if (!roster) {
            return res.status(404).json({
                success: false,
                message: "Roster not found."
            });
        }

        const { assignments, generatedBy, status } = req.body;

        if (assignments !== undefined) {
            roster.assignments = assignments;
        }

        if (generatedBy !== undefined) {
            roster.generatedBy = generatedBy;
        }

        if (status !== undefined) {
            roster.status = status;
        }

        // Validate before publishing
        const validation = validateRoster(roster.assignments);

        if (roster.status === "Published" && !validation.isValid) {
            return res.status(400).json({
                success: false,
                message: "Roster cannot be published because validation errors exist.",
                validation
            });
        }

        await roster.save();

        res.status(200).json({
            success: true,
            message: "Roster updated successfully.",
            roster,
            validation
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// MANUALLY ASSIGN A BACKUP EMPLOYEE
const assignBackupEmployee = async (req, res) => {
    try {
        const { employeeId } = req.body;
        const { id, entryId } = req.params;

        if (!employeeId) {
            return res.status(400).json({
                success: false,
                message: "Please select a backup employee."
            });
        }

        const roster = await Roster.findById(id);

        if (!roster) {
            return res.status(404).json({
                success: false,
                message: "Roster not found."
            });
        }

        if (roster.status === "Published") {
            return res.status(400).json({
                success: false,
                message: "Published rosters cannot be modified."
            });
        }

        const targetEntry = roster.assignments.id(entryId);

        if (!targetEntry) {
            return res.status(404).json({
                success: false,
                message: "Roster entry not found."
            });
        }

        if (!["Leave", "Comp Off"].includes(targetEntry.status)) {
            return res.status(400).json({
                success: false,
                message: "A backup can only be assigned to an employee marked Leave or Comp Off."
            });
        }

        const backupEmployee = await Employee.findOne({
            _id: employeeId,
            isActive: true
        });

        if (!backupEmployee) {
            return res.status(404).json({
                success: false,
                message: "Active backup employee not found."
            });
        }

        const backupId = backupEmployee._id.toString();
        const originalEmployeeId = getId(targetEntry.employee);
        const targetDate = getDateKey(targetEntry.date);

        if (backupId === originalEmployeeId) {
            return res.status(400).json({
                success: false,
                message: "The original employee cannot be their own backup."
            });
        }

        // Check all roster entries on the same date where the selected
        // employee is either the assigned employee or an existing backup.
        const backupEntries = roster.assignments.filter((entry) => {
            return (
                getDateKey(entry.date) === targetDate &&
                entry._id.toString() !== entryId &&
                (
                    getId(entry.employee) === backupId ||
                    getId(entry.backupEmployee) === backupId
                )
            );
        });

        // If the employee's own assignment says they are unavailable,
        // do not use them as a backup.
        const unavailableEntry = backupEntries.find((entry) => {
            return (
                getId(entry.employee) === backupId &&
                [
                    "Leave",
                    "Comp Off",
                    "Holiday",
                    "Weekly Off"
                ].includes(entry.status)
            );
        });

        if (unavailableEntry) {
            return res.status(400).json({
                success: false,
                message: `The selected employee is unavailable on this date (${unavailableEntry.status}).`
            });
        }

        // Check whether the selected employee is already working or
        // covering another shift that overlaps this target shift.
        const overlappingEntry = backupEntries.find((entry) => {
            let isWorkingThisEntry = false;

            if (
                entry.status === "Working" &&
                getId(entry.employee) === backupId
            ) {
                isWorkingThisEntry = true;
            } else if (
                ["Leave", "Comp Off"].includes(entry.status) &&
                getId(entry.backupEmployee) === backupId
            ) {
                isWorkingThisEntry = true;
            }

            return (
                isWorkingThisEntry &&
                shiftsOverlap(
                    targetEntry.shiftStart,
                    targetEntry.shiftEnd,
                    entry.shiftStart,
                    entry.shiftEnd
                )
            );
        });

        if (overlappingEntry) {
            return res.status(400).json({
                success: false,
                message: "The selected employee already has an overlapping shift on this date."
            });
        }

        // Save backup separately. Keep the original employee and status.
        targetEntry.backupEmployee = backupEmployee._id;

        const validation = validateRoster(roster.assignments);

        await roster.save();

        const updatedRoster = await Roster.findById(id)
            .populate("assignments.employee")
            .populate("assignments.backupEmployee")
            .populate("assignments.brand")
            .populate("assignments.process")
            .populate("assignments.assignment");

        res.status(200).json({
            success: true,
            message: validation.isValid
                ? "Backup employee assigned successfully. Roster validation passed."
                : "Backup employee assigned successfully, but other validation issues remain.",
            roster: updatedRoster,
            validation
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// DELETE roster
const deleteRoster = async (req, res) => {
    try {
        const roster = await Roster.findByIdAndDelete(req.params.id);

        if (!roster) {
            return res.status(404).json({
                success: false,
                message: "Roster not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "Roster deleted successfully."
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getRosters,
    getRosterById,
    generateRoster,
    updateRoster,
    assignBackupEmployee,
    deleteRoster
};