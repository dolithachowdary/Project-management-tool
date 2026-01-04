import React, { useState, useEffect } from "react";
import { getProjects } from "../api/projects";
import { createSprint, getNextSprintNumber } from "../api/sprints";
import { Plus, Trash2 } from "lucide-react";
import DatePicker from "./DatePicker";

export default function AddSprint({ isOpen, onClose, onSprintAdded, initialProjectId }) {
  /* -------- STATE -------- */
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState(initialProjectId || "");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("active");
  const [goals, setGoals] = useState([{ text: "" }]); // Start with one empty goal
  const [nextSprintNum, setNextSprintNum] = useState(null);

  // Validation State
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  /* -------- EFFECT -------- */
  useEffect(() => {
    if (isOpen) {
      loadProjects();
      // Reset state on open, but preserve initialProjectId if provided
      setProjectId(initialProjectId || "");
      setStartDate("");
      setEndDate("");
      setStatus("active");
      setGoals([{ text: "" }]);
      setNextSprintNum(null);
      setErrors({});
    }
  }, [isOpen, initialProjectId]);

  useEffect(() => {
    if (!projectId) {
      setNextSprintNum(null);
      return;
    }
    fetchNextSprintNum(projectId);
  }, [projectId]);

  // Manual end date - calculation removed per user request

  const loadProjects = async () => {
    try {
      const res = await getProjects();
      setProjects(res.data?.data || res.data || []);
    } catch (err) {
      console.error("Failed to load projects", err);
    }
  };

  const fetchNextSprintNum = async (pid) => {
    try {
      const res = await getNextSprintNumber(pid);
      setNextSprintNum(res.data?.next_number || res.data?.data?.next_number);
    } catch (err) {
      console.error("Failed to fetch next sprint number", err);
    }
  };

  const addGoal = () => setGoals([...goals, { text: "" }]);

  const removeGoal = (index) => {
    if (goals.length > 1) {
      const newGoals = goals.filter((_, i) => i !== index);
      setGoals(newGoals);
    } else {
      setGoals([{ text: "" }]); // Clear if last one
    }
  };

  const updateGoal = (index, value) => {
    const newGoals = [...goals];
    newGoals[index] = { text: value };
    setGoals(newGoals);
  };

  /* -------- HANDLERS -------- */
  const validate = () => {
    const newErrors = {};
    if (!projectId) newErrors.projectId = "Project is required";
    if (!startDate) newErrors.startDate = "Start date is required";
    if (!endDate) newErrors.endDate = "End date is required";
    if (goals.every(g => !g.text.trim())) newErrors.goals = "At least one goal is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const sprintData = {
        project_id: projectId,
        start_date: startDate,
        end_date: endDate,
        status: status,
        goal: JSON.stringify(goals.filter(g => g.text.trim())),
      };

      await createSprint(sprintData);
      if (onSprintAdded) onSprintAdded();
      onClose();
    } catch (err) {
      console.error("Failed to create sprint", err);
      alert("Error creating sprint");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal} className="hide-scrollbar">
        <h3 style={styles.modalTitle}>Add Sprint</h3>

        {!initialProjectId ? (
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Project <span style={styles.required}>*</span>
            </label>
            <select
              style={{ ...styles.select, borderColor: errors.projectId ? "#ef4444" : "#e2e8f0" }}
              value={projectId}
              onChange={e => {
                setProjectId(e.target.value);
                if (errors.projectId) setErrors(prev => ({ ...prev, projectId: null }));
              }}
            >
              <option value="">Select project</option>
              {projects.map(p => (
                <option key={p.id || p._id} value={p.id || p._id}>{p.name}</option>
              ))}
            </select>
            {errors.projectId && <div style={styles.errorMsg}>{errors.projectId}</div>}
          </div>
        ) : (
          <div style={styles.formGroup}>
            <label style={styles.label}>Project</label>
            <div style={styles.staticField}>
              {projects.find(p => (p.id || p._id) === initialProjectId)?.name || "Current Project"}
            </div>
          </div>
        )}

        {/* Static Sprint Number Display */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Sprint Name</label>
          <div style={styles.staticField}>
            {projectId && nextSprintNum
              ? `Sprint ${nextSprintNum}`
              : <span style={styles.placeholderText}>Select a project to see sprint number</span>}
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Status</label>
          <select
            style={styles.select}
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
            <option value="active">Active</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div style={styles.row}>
          <DatePicker
            label="Start Date"
            required
            value={startDate}
            onChange={e => {
              setStartDate(e.target.value);
              if (errors.startDate) setErrors(prev => ({ ...prev, startDate: null }));
            }}
          />
          <DatePicker
            label="End Date"
            required
            value={endDate}
            onChange={e => {
              setEndDate(e.target.value);
              if (errors.endDate) setErrors(prev => ({ ...prev, endDate: null }));
            }}
          />
        </div>

        <div style={styles.formGroup}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <label style={styles.label}>
              Sprint Goals <span style={styles.required}>*</span>
            </label>
            <button
              onClick={addGoal}
              style={styles.addGoalIconButton}
              title="Add Goal"
            >
              <Plus size={18} color="#c62828" />
            </button>
          </div>
          <div style={styles.goalsList} className="hide-scrollbar">
            {goals.map((g, i) => (
              <div key={i} style={styles.goalRow}>
                <div style={styles.goalInputStack}>
                  <input
                    style={{ ...styles.input, marginBottom: 0 }}
                    placeholder={`Goal ${i + 1}`}
                    value={g.text}
                    onChange={e => {
                      updateGoal(i, e.target.value);
                      if (errors.goals) setErrors(prev => ({ ...prev, goals: null }));
                    }}
                  />
                </div>
                <button
                  onClick={() => removeGoal(i)}
                  style={styles.actionBtn}
                  title="Remove Goal"
                >
                  <Trash2 size={16} color="#ef4444" />
                </button>
              </div>
            ))}
          </div>
          {errors.goals && <div style={styles.errorMsg}>{errors.goals}</div>}
        </div>

        <div style={styles.actions}>
          <button style={styles.cancelBtn} onClick={onClose} disabled={loading}>Cancel</button>
          <button style={styles.createBtn} onClick={handleCreate} disabled={loading}>
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
    backdropFilter: "blur(4px)",
  },
  modal: {
    background: "#fff",
    padding: "24px",
    width: "500px",
    maxHeight: "90vh",
    overflowY: "auto",
    borderRadius: "16px",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  },
  modalTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "24px",
    marginTop: 0,
    textAlign: "center"
  },
  formGroup: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "500",
    color: "#475569",
    marginBottom: "6px",
  },
  required: {
    color: "#ef4444",
    marginLeft: "2px",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    color: "#1e293b",
    outline: "none",
    marginBottom: "4px",
    boxSizing: "border-box",
    fontFamily: "inherit",
    transition: "border-color 0.2s",
  },
  select: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    color: "#1e293b",
    outline: "none",
    background: "#fff",
    transition: "border-color 0.2s",
  },
  errorMsg: {
    fontSize: "12px",
    color: "#ef4444",
    marginTop: "2px",
  },
  staticField: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #f1f5f9",
    background: "#f8fafc",
    fontSize: "14px",
    color: "#1e293b",
    marginBottom: "4px",
    boxSizing: "border-box",
    minHeight: "42px",
    display: "flex",
    alignItems: "center",
  },
  placeholderText: {
    color: "#94a3b8",
    fontStyle: "italic",
    fontSize: "13px",
  },
  row: {
    display: "flex",
    gap: "12px",
    marginBottom: "16px",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "32px"
  },
  cancelBtn: {
    padding: "10px 20px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    background: "#fff",
    color: "#64748b",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
  },
  createBtn: {
    padding: "10px 24px",
    borderRadius: "8px",
    border: "none",
    background: "#c62828",
    color: "#fff",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    boxShadow: "0 4px 6px -1px rgba(198, 40, 40, 0.2)",
  },
  addGoalIconButton: {
    background: "none",
    border: "none",
    padding: 4,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  goalsList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    maxHeight: "250px",
    overflowY: "auto",
    paddingRight: 4,
  },
  goalRow: {
    display: "flex",
    gap: "8px",
    alignItems: "flex-start",
  },
  goalInputStack: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  },
  progressRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "0 4px"
  },
  rangeInput: {
    flex: 1,
    height: "6px",
    borderRadius: "3px",
    appearance: "none",
    background: "#e2e8f0",
    outline: "none",
    accentColor: "#c62828",
  },
  progressLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#64748b",
    minWidth: "35px",
    textAlign: "right"
  },
  actionBtn: {
    background: "none",
    border: "1px solid #fee2e2",
    padding: "8px",
    borderRadius: "8px",
    cursor: "pointer",
    margin: "auto 0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
    flexShrink: 0,
    "&:hover": { background: "#fee2e2" }
  },
};

