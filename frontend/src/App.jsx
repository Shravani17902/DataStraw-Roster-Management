
import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:5000/api";

const navigation = [
  { id: "dashboard", icon: "▦", label: "Dashboard" },
  { id: "rosters", icon: "▤", label: "Roster Management" },
  { id: "employees", icon: "♙", label: "Employees" },
  { id: "brands", icon: "◈", label: "Brands" },
  { id: "processes", icon: "⚙", label: "Processes" },
  { id: "pods", icon: "♧", label: "Pods & Teams" },
  { id: "leaves", icon: "◷", label: "Leave Management" },
  { id: "holidays", icon: "▣", label: "Holidays" }
];

const extractList = (result, key) => {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.[key])) return result[key];
  if (Array.isArray(result?.data)) return result.data;

  if (Array.isArray(result?.[key?.toLowerCase()])) {
    return result[key.toLowerCase()];
  }

  return [];
};

const getName = (value) => {
  if (!value) return "—";

  if (typeof value === "object") {
    return (
      value.name ||
      value.employeeId ||
      value.brandId ||
      value.processId ||
      "—"
    );
  }

  return String(value);
};

const getId = (value) => {
  if (!value) return "";
  return String(typeof value === "object" ? value._id || "" : value);
};

function App() {
  const today = new Date();

  const [activePage, setActivePage] = useState("dashboard");

  const [employees, setEmployees] = useState([]);
  const [brands, setBrands] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [pods, setPods] = useState([]);
  const [rosters, setRosters] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [holidays, setHolidays] = useState([]);

  const [selectedMonth, setSelectedMonth] = useState(
    today.getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  const [selectedRoster, setSelectedRoster] = useState(null);
  const [rosterValidation, setRosterValidation] = useState(null);

  // Manual backup assignment state
  const [assigningBackup, setAssigningBackup] = useState(false);
  const [backupSelections, setBackupSelections] = useState({});

  const [rosterFilters, setRosterFilters] = useState({
    employee: "",
    brand: "",
    process: "",
    status: ""
  });

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [savingLeave, setSavingLeave] = useState(false);
  const [updatingLeaveId, setUpdatingLeaveId] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [leaveForm, setLeaveForm] = useState({
    employee: "",
    leaveType: "Planned Leave",
    startDate: "",
    endDate: "",
    reason: ""
  });

  // Load all application data
  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const endpoints = [
        ["employees", "/employees"],
        ["brands", "/brands"],
        ["processes", "/processes"],
        ["pods", "/pods"],
        ["rosters", "/rosters"],
        ["leaves", "/leaves"],
        ["holidays", "/holidays"]
      ];

      const results = await Promise.all(
        endpoints.map(async ([key, endpoint]) => {
          const response = await fetch(`${API}${endpoint}`);
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || `Unable to load ${key}`);
          }

          return [key, data];
        })
      );

      const dataMap = Object.fromEntries(results);

      setEmployees(extractList(dataMap.employees, "employees"));
      setBrands(extractList(dataMap.brands, "brands"));
      setProcesses(extractList(dataMap.processes, "processes"));
      setPods(extractList(dataMap.pods, "pods"));
      setRosters(extractList(dataMap.rosters, "rosters"));
      setLeaves(extractList(dataMap.leaves, "leaves"));
      setHolidays(extractList(dataMap.holidays, "holidays"));
    } catch (err) {
      setError(err.message || "Unable to connect to the backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Generate monthly roster
  const generateRoster = async () => {
    setGenerating(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`${API}/rosters/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          month: Number(selectedMonth),
          year: Number(selectedYear)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Roster generation failed.");
      }

      setMessage(data.message || "Roster generated successfully.");

      await loadData();
      setActivePage("rosters");
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  // Add employee leave
  const addLeave = async (e) => {
    e.preventDefault();

    setSavingLeave(true);
    setMessage("");
    setError("");

    try {
      if (!leaveForm.employee) {
        throw new Error("Please select an employee.");
      }

      if (!leaveForm.startDate || !leaveForm.endDate) {
        throw new Error("Please select both leave dates.");
      }

      if (leaveForm.endDate < leaveForm.startDate) {
        throw new Error("End date cannot be before start date.");
      }

      const response = await fetch(`${API}/leaves`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          leaveId: `LV-${Date.now()}`,
          employee: leaveForm.employee,
          leaveType: leaveForm.leaveType,
          startDate: leaveForm.startDate,
          endDate: leaveForm.endDate,
          reason: leaveForm.reason,
          status: "Pending"
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to add leave.");
      }

      setMessage(data.message || "Leave request added successfully!");

      setLeaveForm({
        employee: "",
        leaveType: "Planned Leave",
        startDate: "",
        endDate: "",
        reason: ""
      });

      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingLeave(false);
    }
  };

  // Approve or reject a leave request
  const updateLeaveStatus = async (leaveId, status) => {
    setUpdatingLeaveId(leaveId);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`${API}/leaves/${leaveId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `Unable to ${status.toLowerCase()} leave.`
        );
      }

      setMessage(
        data.message || `Leave ${status.toLowerCase()} successfully.`
      );

      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingLeaveId(null);
    }
  };

  // Open roster details and retrieve validation results
  const openRoster = async (roster) => {
    try {
      setError("");
      setMessage("");

      const response = await fetch(`${API}/rosters/${roster._id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to open roster.");
      }

      setSelectedRoster(data.roster);
      setRosterValidation(data.validation || null);
      setBackupSelections({});

      setRosterFilters({
        employee: "",
        brand: "",
        process: "",
        status: ""
      });

      setActivePage("roster-detail");
    } catch (err) {
      setError(err.message);
    }
  };

  // Assign a backup employee to a roster entry
  const assignBackup = async (entryId) => {
    const employeeId = backupSelections[entryId];

    if (!employeeId) {
      setError("Please select a backup employee.");
      return;
    }

    if (!selectedRoster?._id) {
      setError("Please open a roster before assigning a backup.");
      return;
    }

    setAssigningBackup(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API}/rosters/${selectedRoster._id}/entries/${entryId}/backup`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ employeeId })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to assign backup employee."
        );
      }

      setSelectedRoster(data.roster);
      setRosterValidation(data.validation || null);
      setBackupSelections({});

      setMessage(data.message || "Backup employee assigned successfully.");

      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setAssigningBackup(false);
    }
  };

  const currentPage = navigation.find(
    (item) => item.id === activePage
  );

  const pageTitle =
    activePage === "roster-detail"
      ? "Roster Details"
      : currentPage?.label || "Dashboard";

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC"
    });
  };

  // Reusable table
  const renderTable = (
    headers,
    rows,
    emptyMessage = "No records found."
  ) => (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.length ? (
            rows.map((row, index) => (
              <tr key={row.id || row._id || index}>
                {row.cells.map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={headers.length} className="empty-cell">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  // Dashboard
  const renderDashboard = () => (
    <>
      <div className="welcome-section">
        <div>
          <span className="eyebrow">OVERVIEW</span>
          <h1>Welcome to your workspace</h1>
          <p>
            Monitor your workforce, teams and monthly roster in one place.
          </p>
        </div>

        <button
          className="primary-btn"
          onClick={() => setActivePage("rosters")}
        >
          + Manage Roster
        </button>
      </div>

      <div className="stats-grid">
        {[
          {
            label: "Total Employees",
            value: employees.length,
            icon: "♙"
          },
          {
            label: "Total Brands",
            value: brands.length,
            icon: "◈"
          },
          {
            label: "Active Processes",
            value: processes.length,
            icon: "⚙"
          },
          {
            label: "Total Pods",
            value: pods.length,
            icon: "♧"
          }
        ].map((stat) => (
          <div className="stat-card" key={stat.label}>
            <div className="stat-icon">{stat.icon}</div>

            <div>
              <h3>{stat.label}</h3>
              <strong>{stat.value}</strong>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Monthly Roster</h2>
              <p>Generate a roster for your team</p>
            </div>

            <span className="panel-icon">▤</span>
          </div>

          <div className="generator-fields">
            <label>
              Select Month

              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                {Array.from({ length: 12 }, (_, index) => (
                  <option key={index + 1} value={index + 1}>
                    {new Date(2000, index).toLocaleString("en-IN", {
                      month: "long"
                    })}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Select Year

              <input
                type="number"
                min="2026"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              />
            </label>
          </div>

          <button
            className="primary-btn full-btn"
            onClick={generateRoster}
            disabled={generating || !selectedYear}
          >
            {generating
              ? "Generating..."
              : "Generate Monthly Roster →"}
          </button>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Recent Rosters</h2>
              <p>Your generated monthly schedules</p>
            </div>

            <button
              className="text-btn"
              onClick={() => setActivePage("rosters")}
            >
              View all
            </button>
          </div>

          {rosters.length ? (
            <div className="recent-list">
              {rosters.slice(0, 4).map((roster) => (
                <div className="recent-item" key={roster._id}>
                  <div className="recent-date">▤</div>

                  <div className="recent-info">
                    <strong>
                      {new Date(
                        roster.year,
                        roster.month - 1
                      ).toLocaleString("en-IN", {
                        month: "long",
                        year: "numeric"
                      })}
                    </strong>

                    <small>
                      {roster.assignments?.length || 0} roster entries
                    </small>
                  </div>

                  <button
                    className="small-link"
                    onClick={() => openRoster(roster)}
                  >
                    Open
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-message">
              No rosters generated yet.
            </p>
          )}
        </section>
      </div>

      <section className="panel overview-panel">
        <div className="panel-heading">
          <div>
            <h2>Workforce Overview</h2>
            <p>Quick access to your organizational data</p>
          </div>
        </div>

        <div className="quick-links">
          {navigation.slice(2).map((item) => (
            <button
              key={item.id}
              className="quick-link"
              onClick={() => setActivePage(item.id)}
            >
              <span>{item.icon}</span>
              {item.label}
              <b>→</b>
            </button>
          ))}
        </div>
      </section>
    </>
  );

  // Employees
  const renderEmployees = () =>
    renderTable(
      ["Employee ID", "Name", "Email", "Role", "Pod", "Status"],
      employees.map((employee) => ({
        id: employee._id,
        cells: [
          employee.employeeId || "—",
          employee.name || "—",
          employee.email || "—",
          employee.role || "Employee",
          getName(employee.pod),
          <span
            className={`status-pill ${
              employee.isActive ? "active" : "inactive"
            }`}
          >
            {employee.isActive ? "Active" : "Inactive"}
          </span>
        ]
      }))
    );

  // Brands
  const renderBrands = () =>
    renderTable(
      ["Brand ID", "Brand Name", "Industry", "Description", "Status"],
      brands.map((brand) => ({
        id: brand._id,
        cells: [
          brand.brandId || "—",
          brand.name || "—",
          brand.industry || "—",
          brand.description || "—",
          <span
            className={`status-pill ${
              brand.isActive ? "active" : "inactive"
            }`}
          >
            {brand.isActive ? "Active" : "Inactive"}
          </span>
        ]
      }))
    );

  // Processes
  const renderProcesses = () =>
    renderTable(
      ["Process ID", "Process Name", "Code", "Description", "Status"],
      processes.map((process) => ({
        id: process._id,
        cells: [
          process.processId || "—",
          process.name || "—",
          process.code || "—",
          process.description || "—",
          <span
            className={`status-pill ${
              process.isActive ? "active" : "inactive"
            }`}
          >
            {process.isActive ? "Active" : "Inactive"}
          </span>
        ]
      }))
    );

  // Pods
  const renderPods = () =>
    renderTable(
      ["Pod ID", "Pod Name", "Pod Lead", "Team Members", "Status"],
      pods.map((pod) => ({
        id: pod._id,
        cells: [
          pod.podId || "—",
          pod.name || "—",
          getName(pod.podLead),
          Array.isArray(pod.members) ? pod.members.length : 0,
          <span
            className={`status-pill ${
              pod.isActive ? "active" : "inactive"
            }`}
          >
            {pod.isActive ? "Active" : "Inactive"}
          </span>
        ]
      }))
    );

  // Rosters
  const renderRosters = () => (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h2>Generated Rosters</h2>
          <p>View and inspect monthly employee schedules</p>
        </div>

        <button
          className="primary-btn"
          onClick={() => setActivePage("dashboard")}
        >
          + Generate Roster
        </button>
      </div>

      {renderTable(
        ["Roster ID", "Month", "Year", "Entries", "Status", "Action"],
        rosters.map((roster) => ({
          id: roster._id,
          cells: [
            roster.rosterId,

            new Date(
              roster.year,
              roster.month - 1
            ).toLocaleString("en-IN", {
              month: "long"
            }),

            roster.year,

            roster.assignments?.length || 0,

            <span
              className={`status-pill ${
                roster.status === "Published" ? "active" : "pending"
              }`}
            >
              {roster.status || "Draft"}
            </span>,

            <button
              className="small-link"
              onClick={() => openRoster(roster)}
            >
              View details →
            </button>
          ]
        }))
      )}
    </section>
  );

  // Roster details with filters, validation and backup assignment
  const renderRosterDetail = () => {
    const assignments = selectedRoster?.assignments || [];

    const uniqueEmployees = [
      ...new Map(
        assignments.map((entry) => [
          getId(entry.employee),
          entry.employee
        ])
      ).values()
    ].filter(Boolean);

    const uniqueBrands = [
      ...new Map(
        assignments.map((entry) => [
          getId(entry.brand),
          entry.brand
        ])
      ).values()
    ].filter(Boolean);

    const uniqueProcesses = [
      ...new Map(
        assignments.map((entry) => [
          getId(entry.process),
          entry.process
        ])
      ).values()
    ].filter(Boolean);

    const filteredAssignments = assignments.filter((entry) => {
      const matchesEmployee =
        !rosterFilters.employee ||
        getId(entry.employee) === rosterFilters.employee;

      const matchesBrand =
        !rosterFilters.brand ||
        getId(entry.brand) === rosterFilters.brand;

      const matchesProcess =
        !rosterFilters.process ||
        getId(entry.process) === rosterFilters.process;

      const matchesStatus =
        !rosterFilters.status ||
        entry.status === rosterFilters.status;

      return (
        matchesEmployee &&
        matchesBrand &&
        matchesProcess &&
        matchesStatus
      );
    });

    const validationErrors = rosterValidation?.errors || [];
    const isValid = rosterValidation?.isValid;

    const activeEmployees = employees.filter(
      (employee) => employee.isActive
    );

    const clearFilters = () => {
      setRosterFilters({
        employee: "",
        brand: "",
        process: "",
        status: ""
      });
    };

    return (
      <>
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>{selectedRoster?.rosterId || "Roster"}</h2>

              <p>
                {selectedRoster
                  ? `${new Date(
                      selectedRoster.year,
                      selectedRoster.month - 1
                    ).toLocaleString("en-IN", {
                      month: "long"
                    })} ${selectedRoster.year}`
                  : ""}
              </p>
            </div>

            <button
              className="secondary-btn"
              onClick={() => setActivePage("rosters")}
            >
              ← Back to Rosters
            </button>
          </div>

          <div className="stats-grid roster-stats">
            <div className="stat-card">
              <div className="stat-icon">▤</div>
              <div>
                <h3>Total Entries</h3>
                <strong>{assignments.length}</strong>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">♙</div>
              <div>
                <h3>Employees</h3>
                <strong>{uniqueEmployees.length}</strong>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">◈</div>
              <div>
                <h3>Brands</h3>
                <strong>{uniqueBrands.length}</strong>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">⚙</div>
              <div>
                <h3>Processes</h3>
                <strong>{uniqueProcesses.length}</strong>
              </div>
            </div>
          </div>
        </section>

        {/* Validation summary */}
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Roster Validation</h2>
              <p>Scheduling conflicts and coverage checks</p>
            </div>

            {rosterValidation ? (
              <span
                className={`status-pill ${
                  isValid ? "active" : "inactive"
                }`}
              >
                {isValid ? "Valid Roster" : "Issues Found"}
              </span>
            ) : (
              <span className="status-pill pending">
                Not Available
              </span>
            )}
          </div>

          {rosterValidation ? (
            <>
              <div className="validation-summary">
                <div className="validation-item">
                  <span>Total Validation Issues</span>
                  <strong>{validationErrors.length}</strong>
                </div>

                <div className="validation-item">
                  <span>Validation Status</span>
                  <strong>
                    {isValid ? "Passed" : "Failed"}
                  </strong>
                </div>
              </div>

              {validationErrors.length > 0 ? (
                <div className="validation-list">
                  <h3>Issues requiring attention</h3>

                  {validationErrors.map((item, index) => (
                    <div
                      className="validation-error"
                      key={item._id || index}
                    >
                      <div className="validation-error-heading">
                        <strong>
                          {(item.type || item.code || "VALIDATION_ERROR")
                            .replaceAll("_", " ")}
                        </strong>

                        {item.date && (
                          <span>{formatDate(item.date)}</span>
                        )}
                      </div>

                      <p>
                        {item.message ||
                          item.description ||
                          "A roster validation issue was detected."}
                      </p>

                      {(item.brand || item.process) && (
                        <small>
                          {item.brand &&
                            `Brand: ${
                              brands.find(
                                (brand) =>
                                  brand._id === getId(item.brand)
                              )?.name || getName(item.brand)
                            }`}

                          {item.brand && item.process ? " • " : ""}

                          {item.process &&
                            `Process: ${
                              processes.find(
                                (process) =>
                                  process._id === getId(item.process)
                              )?.name || getName(item.process)
                            }`}
                        </small>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="validation-success">
                  ✓ No validation issues found in this roster.
                </div>
              )}
            </>
          ) : (
            <p className="empty-message">
              Validation information is not available for this roster.
            </p>
          )}
        </section>

        {/* Roster filters */}
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Roster Filters</h2>
              <p>Filter schedules by employee, brand, process or status</p>
            </div>

            <button
              className="text-btn"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>

          <div className="roster-filters">
            <label>
              Employee

              <select
                value={rosterFilters.employee}
                onChange={(e) =>
                  setRosterFilters({
                    ...rosterFilters,
                    employee: e.target.value
                  })
                }
              >
                <option value="">All Employees</option>

                {uniqueEmployees.map((employee) => (
                  <option
                    key={getId(employee)}
                    value={getId(employee)}
                  >
                    {employee.employeeId
                      ? `${employee.employeeId} - ${employee.name}`
                      : getName(employee)}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Brand

              <select
                value={rosterFilters.brand}
                onChange={(e) =>
                  setRosterFilters({
                    ...rosterFilters,
                    brand: e.target.value
                  })
                }
              >
                <option value="">All Brands</option>

                {uniqueBrands.map((brand) => (
                  <option
                    key={getId(brand)}
                    value={getId(brand)}
                  >
                    {getName(brand)}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Process

              <select
                value={rosterFilters.process}
                onChange={(e) =>
                  setRosterFilters({
                    ...rosterFilters,
                    process: e.target.value
                  })
                }
              >
                <option value="">All Processes</option>

                {uniqueProcesses.map((process) => (
                  <option
                    key={getId(process)}
                    value={getId(process)}
                  >
                    {getName(process)}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Status

              <select
                value={rosterFilters.status}
                onChange={(e) =>
                  setRosterFilters({
                    ...rosterFilters,
                    status: e.target.value
                  })
                }
              >
                <option value="">All Statuses</option>
                <option value="Working">Working</option>
                <option value="Weekly Off">Weekly Off</option>
                <option value="Leave">Leave</option>
                <option value="Holiday">Holiday</option>
                <option value="Comp Off">Comp Off</option>
              </select>
            </label>
          </div>

          <div className="filter-result">
            Showing <strong>{filteredAssignments.length}</strong> of{" "}
            <strong>{assignments.length}</strong> roster entries
          </div>
        </section>

        {/* Filtered roster table with backup action */}
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Employee Schedule</h2>
              <p>
                Detailed daily roster assignments and backup allocation
              </p>
            </div>
          </div>

          {renderTable(
            [
              "Date",
              "Employee",
              "Brand",
              "Process",
              "Shift",
              "Status",
              "Backup Employee"
            ],
            filteredAssignments.map((entry, index) => {
              const canAssignBackup =
                entry.status === "Leave" ||
                entry.status === "Comp Off";

              const entryId = entry._id || String(index);

              return {
                id: entryId,

                cells: [
                  formatDate(entry.date),
                  getName(entry.employee),
                  getName(entry.brand),
                  getName(entry.process),
                  `${entry.shiftStart || "—"} - ${
                    entry.shiftEnd || "—"
                  }`,

                  <span
                    className={`status-pill ${
                      entry.status === "Working"
                        ? "active"
                        : entry.status === "Leave"
                        ? "inactive"
                        : "pending"
                    }`}
                  >
                    {entry.status || "—"}
                  </span>,

                  canAssignBackup ? (
                    <div className="backup-actions">
                      <select
                        className="backup-select"
                        value={backupSelections[entryId] || ""}
                        onChange={(e) =>
                          setBackupSelections((previous) => ({
                            ...previous,
                            [entryId]: e.target.value
                          }))
                        }
                        disabled={assigningBackup}
                      >
                        <option value="">Select employee</option>

                        {activeEmployees
                          .filter(
                            (employee) =>
                              getId(employee) !== getId(entry.employee)
                          )
                          .map((employee) => (
                            <option
                              key={employee._id}
                              value={employee._id}
                            >
                              {employee.employeeId} - {employee.name}
                            </option>
                          ))}
                      </select>

                      <button
                        className="backup-btn"
                        onClick={() => assignBackup(entryId)}
                        disabled={
                          assigningBackup ||
                          !backupSelections[entryId]
                        }
                      >
                        {assigningBackup ? "Assigning..." : "Assign"}
                      </button>
                    </div>
                  ) : (
                    <span className="empty-message">
                      {entry.status === "Working"
                        ? "Already assigned"
                        : "Not applicable"}
                    </span>
                  )
                ]
              };
            }),
            "No roster entries match the selected filters."
          )}

          <p className="backup-help">
            Backup assignment is available for Leave and Comp Off entries.
            The server checks the selected employee's availability and
            overlapping shifts before saving.
          </p>
        </section>
      </>
    );
  };

  // Leave management
  const renderLeaves = () => (
    <>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Add Employee Leave</h2>
            <p>Create a leave request for an employee</p>
          </div>

          <span className="panel-icon">◷</span>
        </div>

        <form className="leave-form" onSubmit={addLeave}>
          <label>
            Select Employee

            <select
              value={leaveForm.employee}
              onChange={(e) =>
                setLeaveForm({
                  ...leaveForm,
                  employee: e.target.value
                })
              }
              required
            >
              <option value="">Choose employee</option>

              {employees
                .filter((employee) => employee.isActive)
                .map((employee) => (
                  <option
                    key={employee._id}
                    value={employee._id}
                  >
                    {employee.employeeId} - {employee.name}
                  </option>
                ))}
            </select>
          </label>

          <label>
            Leave Type

            <select
              value={leaveForm.leaveType}
              onChange={(e) =>
                setLeaveForm({
                  ...leaveForm,
                  leaveType: e.target.value
                })
              }
              required
            >
              <option value="Planned Leave">Planned Leave</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Emergency Leave">Emergency Leave</option>
              <option value="Comp Off">Comp Off</option>
            </select>
          </label>

          <label>
            Start Date

            <input
              type="date"
              value={leaveForm.startDate}
              onChange={(e) =>
                setLeaveForm({
                  ...leaveForm,
                  startDate: e.target.value
                })
              }
              required
            />
          </label>

          <label>
            End Date

            <input
              type="date"
              value={leaveForm.endDate}
              min={leaveForm.startDate || undefined}
              onChange={(e) =>
                setLeaveForm({
                  ...leaveForm,
                  endDate: e.target.value
                })
              }
              required
            />
          </label>

          <label className="leave-reason">
            Reason

            <textarea
              value={leaveForm.reason}
              onChange={(e) =>
                setLeaveForm({
                  ...leaveForm,
                  reason: e.target.value
                })
              }
              placeholder="Enter reason for leave"
              rows="3"
            />
          </label>

          <button
            className="primary-btn leave-submit"
            type="submit"
            disabled={savingLeave}
          >
            {savingLeave ? "Saving..." : "+ Add Leave Request"}
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Leave Records</h2>
            <p>Review, approve or reject employee leave requests</p>
          </div>

          <span className="panel-icon">▤</span>
        </div>

        {renderTable(
          [
            "Leave ID",
            "Employee",
            "Leave Type",
            "Start Date",
            "End Date",
            "Status",
            "Action"
          ],

          leaves.map((leave) => ({
            id: leave._id,

            cells: [
              leave.leaveId || "—",
              getName(leave.employee),
              leave.leaveType || "—",
              formatDate(leave.startDate),
              formatDate(leave.endDate),

              <span
                className={`status-pill ${
                  leave.status === "Approved"
                    ? "active"
                    : leave.status === "Rejected"
                    ? "inactive"
                    : "pending"
                }`}
              >
                {leave.status || "Pending"}
              </span>,

              leave.status === "Pending" ? (
                <div className="leave-actions">
                  <button
                    className="approve-btn"
                    onClick={() =>
                      updateLeaveStatus(leave._id, "Approved")
                    }
                    disabled={updatingLeaveId === leave._id}
                  >
                    {updatingLeaveId === leave._id
                      ? "Updating..."
                      : "Approve"}
                  </button>

                  <button
                    className="reject-btn"
                    onClick={() =>
                      updateLeaveStatus(leave._id, "Rejected")
                    }
                    disabled={updatingLeaveId === leave._id}
                  >
                    {updatingLeaveId === leave._id
                      ? "Updating..."
                      : "Reject"}
                  </button>
                </div>
              ) : (
                <span className="empty-message">No action</span>
              )
            ]
          }))
        )}
      </section>
    </>
  );

  // Holidays
  const renderHolidays = () =>
    renderTable(
      ["Holiday ID", "Holiday Name", "Date", "Description", "Status"],

      holidays.map((holiday) => ({
        id: holiday._id,

        cells: [
          holiday.holidayId || "—",
          holiday.name || "—",
          formatDate(holiday.date),
          holiday.description || "—",

          <span
            className={`status-pill ${
              holiday.isActive ? "active" : "inactive"
            }`}
          >
            {holiday.isActive ? "Active" : "Inactive"}
          </span>
        ]
      }))
    );

  // Page navigation
  const pageContent = () => {
    switch (activePage) {
      case "dashboard":
        return renderDashboard();

      case "employees":
        return renderEmployees();

      case "brands":
        return renderBrands();

      case "processes":
        return renderProcesses();

      case "pods":
        return renderPods();

      case "rosters":
        return renderRosters();

      case "roster-detail":
        return renderRosterDetail();

      case "leaves":
        return renderLeaves();

      case "holidays":
        return renderHolidays();

      default:
        return renderDashboard();
    }
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand-logo">
          <div className="logo-mark">D</div>

          <div>
            <h1>DataStraw</h1>
            <span>ROSTER MANAGEMENT</span>
          </div>
        </div>

        <div className="nav-label">WORKSPACE</div>

        <nav className="sidebar-nav">
          {navigation.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${
                activePage === item.id ? "selected" : ""
              }`}
              onClick={() => {
                setActivePage(item.id);
                setSelectedRoster(null);
                setRosterValidation(null);
                setBackupSelections({});
                setMessage("");
              }}
            >
              <span className="nav-icon">{item.icon}</span>

              {item.label}

              {activePage === item.id && (
                <span className="nav-indicator" />
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="profile-avatar">DM</div>

          <div className="profile-info">
            <strong>Workspace Admin</strong>
            <small>Administrator</small>
          </div>

          <span className="online-dot" />
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div>
            <div className="breadcrumb">
              Workspace / <strong>{pageTitle}</strong>
            </div>

            <h2>{pageTitle}</h2>
          </div>

          <div className="topbar-actions">
            <span className="today-date">
              {today.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric"
              })}
            </span>

            <button
              className="refresh-btn"
              onClick={loadData}
              title="Refresh data"
            >
              ↻
            </button>

            <div className="top-avatar">A</div>
          </div>
        </header>

        <div className="content-area">
          {message && (
            <div className="alert success-alert">
              <span>✓</span> {message}

              <button onClick={() => setMessage("")}>
                ×
              </button>
            </div>
          )}

          {error && (
            <div className="alert error-alert">
              <span>!</span> {error}

              <button onClick={() => setError("")}>
                ×
              </button>
            </div>
          )}

          {loading ? (
            <div className="loading-state">
              <div className="loader" />
              <p>Loading workspace data...</p>
            </div>
          ) : (
            pageContent()
          )}
        </div>

        <footer className="footer">
          <span>
            © {today.getFullYear()} DataStraw Roster Management
          </span>

          <span>Workforce planning made simpler</span>
        </footer>
      </main>
    </div>
  );
}

export default App;







