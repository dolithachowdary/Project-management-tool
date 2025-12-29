import React, { useState, useEffect } from "react";

/* ================= MOCK DATA ================= */

const projects = [
  {
    id: 1,
    name: "Website Revamp",
    completedSprints: [1, 2,3 ],
    activeSprints: [4],
    modules: ["Auth", "Dashboard", "Payments"],
  },
  {
    id: 2,
    name: "Mobile App UI",
    completedSprints: [1],
    activeSprints: [2],
    modules: ["Profile", "Appointments"],
  },
];

export default function AddSprint({ isOpen, onClose }) {
  /* -------- STATE -------- */

  const [projectId, setProjectId] = useState("");
  const [sprintName, setSprintName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [availableModules, setAvailableModules] = useState([]);
  const [selectedModules, setSelectedModules] = useState([]);

  const [newModules, setNewModules] = useState([
    { name: "", description: "" },
  ]);

  /* -------- EFFECT -------- */

  useEffect(() => {
    if (!projectId) return;

    const project = projects.find(p => p.id === Number(projectId));
    if (!project) return;

    // ✅ Calculate next sprint number safely
    const allSprints = [
      ...project.completedSprints,
      ...project.activeSprints,
    ];
    const nextSprintNumber =
      allSprints.length > 0 ? Math.max(...allSprints) + 1 : 1;

    setSprintName(`Sprint ${nextSprintNumber}`);
    setAvailableModules(project.modules);
    setSelectedModules([]);
  }, [projectId]);

  /* -------- HANDLERS -------- */

  const handleModuleSelect = (e) => {
    const values = Array.from(e.target.selectedOptions, o => o.value);
    setSelectedModules(values);
  };

  const updateNewModule = (i, field, value) => {
    const copy = [...newModules];
    copy[i][field] = value;
    setNewModules(copy);
  };

  const addModuleRow = () => {
    setNewModules([...newModules, { name: "", description: "" }]);
  };

  const handleCreate = () => {
    console.log({
      projectId,
      sprintName,
      startDate,
      endDate,
      selectedModules,
      newModules,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3>Add Sprint</h3>

        <label>Project</label>
        <select
          style={styles.input}
          value={projectId}
          onChange={e => setProjectId(e.target.value)}
        >
          <option value="">Select project</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <label>Sprint</label>
        <input style={styles.input} value={sprintName} disabled />

        <div style={styles.row}>
          <input
            type="date"
            style={styles.input}
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
          <input
            type="date"
            style={styles.input}
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />
        </div>

        <label>Modules</label>
        <select
          style={styles.input}
          value={projectId}
          onChange={e => setProjectId(e.target.value)}
        >
          <option value="">Select Modules</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <label>Add New Modules</label>
        {newModules.map((m, i) => (
          <div key={i} style={styles.row}>
            <input
              placeholder="Name"
              style={styles.input}
              value={m.name}
              onChange={e => updateNewModule(i, "name", e.target.value)}
            />
            <input
              placeholder="Description"
              style={styles.input}
              value={m.description}
              onChange={e => updateNewModule(i, "description", e.target.value)}
            />
          </div>
        ))}

        <button onClick={addModuleRow} style={styles.link}>
          + Add module
        </button>

        <div style={styles.actions}>
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleCreate}>Create</button>
        </div>
      </div>
    </div>
  );
}

/* ================= STYLES (UNCHANGED) ================= */

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    background: "#fff",
    padding: 20,
    width: 500,
    borderRadius: 10,
  },
  input: {
    width: "100%",
    padding: 8,
    marginBottom: 10,
  },
  row: {
    display: "flex",
    gap: 10,
  },
  link: {
    background: "none",
    border: "none",
    color: "#c71b1b",
    cursor: "pointer",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
  },
  dropdownField: {
    border: "1px solid #ccc",
    padding: 8,
    borderRadius: 4,
    marginBottom: 10,
    cursor: "pointer",
    background: "#fff",
    },

    dropdownMenu: {
    border: "1px solid #ccc",
    borderRadius: 4,
    padding: 6,
    marginBottom: 10,
    maxHeight: 150,
    overflowY: "auto",
    background: "#fff",
    },

    dropdownItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "4px 6px",
    cursor: "pointer",
    },

};
