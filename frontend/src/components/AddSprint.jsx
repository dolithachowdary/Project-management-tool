import React, { useState, useEffect } from "react";
import { getProjects } from "../api/projects";
import { getModules, createModule } from "../api/modules";
import { createSprint } from "../api/sprints";

export default function AddSprint({ isOpen, onClose, onSprintAdded }) {
  /* -------- STATE -------- */
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [sprintName, setSprintName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [availableModules, setAvailableModules] = useState([]);
  const [selectedModules, setSelectedModules] = useState([]);
  const [newModules, setNewModules] = useState([]);
  const [loading, setLoading] = useState(false);

  /* -------- EFFECT -------- */
  useEffect(() => {
    if (isOpen) {
      loadProjects();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!projectId) {
      setAvailableModules([]);
      setSelectedModules([]);
      return;
    }
    loadModules(projectId);
  }, [projectId]);

  // Sprint duration logic: 7 days
  useEffect(() => {
    if (startDate) {
      const start = new Date(startDate);
      const end = new Date(start);
      end.setDate(start.getDate() + 7);
      setEndDate(end.toISOString().split("T")[0]);
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

  const loadModules = async (pid) => {
    try {
      const res = await getModules(pid);
      setAvailableModules(res.data?.data || res.data || []);
    } catch (err) {
      console.error("Failed to load modules", err);
    }
  };

  /* -------- HANDLERS -------- */
  const handleModuleToggle = (moduleId) => {
    setSelectedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const updateNewModule = (i, field, value) => {
    const copy = [...newModules];
    copy[i][field] = value;
    setNewModules(copy);
  };

  const addModuleRow = () => {
    setNewModules([...newModules, { name: "", description: "" }]);
  };

  const removeModuleRow = (i) => {
    setNewModules(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleCreate = async () => {
    if (!projectId || !sprintName || !startDate || !endDate) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      // 1. Create new modules if any
      const createdModuleIds = [];
      for (const m of newModules) {
        if (m.name.trim()) {
          const res = await createModule({
            name: m.name,
            description: m.description,
            project_id: projectId
          });
          createdModuleIds.push(res.data?.id || res.data?._id);
        }
      }

      // 2. Create Sprint
      const sprintData = {
        project_id: projectId,
        name: sprintName,
        start_date: startDate,
        end_date: endDate,
        modules: [...selectedModules, ...createdModuleIds],
      };

      await createSprint(sprintData);
      if (onSprintAdded) onSprintAdded();
      onClose();
      // Reset form
      setProjectId("");
      setSprintName("");
      setStartDate("");
      setEndDate("");
      setSelectedModules([]);
      setNewModules([]);
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
          <label style={styles.label}>Project</label>
          <select
            style={styles.select}
            value={projectId}
            onChange={e => setProjectId(e.target.value)}
          >
            <option value="">Select project</option>
            {projects.map(p => (
              <option key={p.id || p._id} value={p.id || p._id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Sprint</label>
          <input
            style={styles.input}
            placeholder="Sprint Name (e.g. Sprint 1)"
            value={sprintName}
            onChange={e => setSprintName(e.target.value)}
          />
        </div>

        <div style={styles.row}>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Start Date</label>
            <input
              type="date"
              style={styles.input}
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>End Date</label>
            <input
              type="date"
              style={styles.input}
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              readOnly
            />
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Modules</label>
          <div style={styles.moduleSelector}>
            {availableModules.length === 0 ? (
              <div style={styles.placeholder}>No existing modules</div>
            ) : (
              availableModules.map(m => (
                <div key={m.id || m._id} style={styles.moduleItem}>
                  <input
                    type="checkbox"
                    id={`mod-${m.id || m._id}`}
                    checked={selectedModules.includes(m.id || m._id)}
                    onChange={() => handleModuleToggle(m.id || m._id)}
                  />
                  <label htmlFor={`mod-${m.id || m._id}`} style={{ fontSize: 13 }}>{m.name}</label>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={styles.newModuleSection}>
          <label style={styles.label}>Add New Modules</label>
          {newModules.map((m, i) => (
            <div key={i} style={{ ...styles.row, marginBottom: 8, alignItems: "center" }}>
              <input
                placeholder="Name"
                style={{ ...styles.input, marginBottom: 0 }}
                value={m.name}
                onChange={e => updateNewModule(i, "name", e.target.value)}
              />
              <input
                placeholder="Description"
                style={{ ...styles.input, marginBottom: 0 }}
                value={m.description}
                onChange={e => updateNewModule(i, "description", e.target.value)}
              />
              <button
                onClick={() => removeModuleRow(i)}
                style={styles.removeBtn}
              >
                &times;
              </button>
            </div>
          ))}
          <button onClick={addModuleRow} style={styles.addLink}>
            + Add module
          </button>
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
    width: "550px",
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
  },
  row: {
    display: "flex",
    gap: "12px",
    marginBottom: "16px",
  },
  moduleSelector: {
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "8px 12px",
    maxHeight: "120px",
    overflowY: "auto",
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  moduleItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "#f8fafc",
    padding: "4px 8px",
    borderRadius: "6px",
    border: "1px solid #f1f5f9",
  },
  placeholder: {
    fontSize: "13px",
    color: "#94a3b8",
    fontStyle: "italic",
    padding: "4px 0",
  },
  newModuleSection: {
    marginTop: "16px",
    padding: "16px",
    background: "#fdfdfd",
    border: "1px dashed #e2e8f0",
    borderRadius: "12px",
    marginBottom: "24px",
  },
  addLink: {
    background: "none",
    border: "none",
    color: "#c62828",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    padding: "4px 0",
    marginTop: "4px",
  },
  removeBtn: {
    background: "#fee2e2",
    color: "#ef4444",
    border: "none",
    borderRadius: "4px",
    width: "24px",
    height: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: "18px",
    lineHeight: 1,
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
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

