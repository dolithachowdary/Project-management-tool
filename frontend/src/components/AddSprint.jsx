import React, { useState, useEffect } from "react";
import { getProjects } from "../api/projects";
import { createSprint, getNextSprintNumber } from "../api/sprints";

export default function AddSprint({ isOpen, onClose, onSprintAdded }) {
  /* -------- STATE -------- */
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [goal, setGoal] = useState("");
  const [nextSprintNum, setNextSprintNum] = useState(null);

  // Validation State
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  /* -------- EFFECT -------- */
  useEffect(() => {
    if (isOpen) {
      loadProjects();
      // Reset state on open
      setProjectId("");
      setStartDate("");
      setEndDate("");
      setGoal("");
      setNextSprintNum(null);
      setErrors({});
    }
  }, [isOpen]);

  useEffect(() => {
    if (!projectId) {
      setNextSprintNum(null);
      return;
    }
    fetchNextSprintNum(projectId);
  }, [projectId]);

  // Sprint duration logic: 7 days
  useEffect(() => {
    if (startDate) {
      const start = new Date(startDate);
      const end = new Date(start);
      end.setDate(start.getDate() + 7);
      setEndDate(end.toISOString().split("T")[0]);
    } else {
      setEndDate("");
    }
  }, [startDate]);

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

  /* -------- HANDLERS -------- */
  const validate = () => {
    const newErrors = {};
    if (!projectId) newErrors.projectId = "Project is required";
    if (!startDate) newErrors.startDate = "Start date is required";
    if (!goal.trim()) newErrors.goal = "Goal is required";

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
        goal: goal,
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
      <div style={styles.modal}>
        <h3 style={styles.modalTitle}>Add Sprint</h3>

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

        {/* Static Sprint Number Display */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Sprint Name</label>
          <div style={styles.staticField}>
            {projectId && nextSprintNum
              ? `Sprint ${nextSprintNum}`
              : <span style={styles.placeholderText}>Select a project to see sprint number</span>}
          </div>
        </div>

        <div style={styles.row}>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>
              Start Date <span style={styles.required}>*</span>
            </label>
            <input
              type="date"
              style={{ ...styles.input, borderColor: errors.startDate ? "#ef4444" : "#e2e8f0" }}
              value={startDate}
              onChange={e => {
                setStartDate(e.target.value);
                if (errors.startDate) setErrors(prev => ({ ...prev, startDate: null }));
              }}
            />
            {errors.startDate && <div style={styles.errorMsg}>{errors.startDate}</div>}
          </div>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>End Date</label>
            <input
              type="date"
              style={styles.input}
              value={endDate}
              readOnly
              disabled
            />
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>
            Sprint Goal <span style={styles.required}>*</span>
          </label>
          <textarea
            style={{ ...styles.input, minHeight: "80px", resize: "vertical", borderColor: errors.goal ? "#ef4444" : "#e2e8f0" }}
            placeholder="Define the main goal for this sprint..."
            value={goal}
            onChange={e => {
              setGoal(e.target.value);
              if (errors.goal) setErrors(prev => ({ ...prev, goal: null }));
            }}
          />
          {errors.goal && <div style={styles.errorMsg}>{errors.goal}</div>}
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
};

