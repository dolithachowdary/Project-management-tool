import React, { useEffect, useState } from "react";
import { createProject } from "../api/projects";
import { getAssignableUsers } from "../api/users";

const COLORS = [
  "#F6C1CC",
  "#DFE6D8",
  "#D8EDFF",
  "#E0E7FF",
  "#FFF1C1",
  "#EADCF8",
];

export default function AddProject({ isOpen, onClose, usedColors = [] }) {
  /* ---------------- STATE ---------------- */

  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");

  const [color, setColor] = useState(
    COLORS.find((c) => !usedColors.includes(c)) || COLORS[0]
  );
  const [showColors, setShowColors] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [users, setUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [showMembers, setShowMembers] = useState(false);



  const [modules, setModules] = useState([{ name: "", description: "" }]);

  /* ---------------- LOAD USERS ---------------- */

  useEffect(() => {
    if (isOpen) loadUsers();
  }, [isOpen]);

  const loadUsers = async () => {
    try {
      const res = await getAssignableUsers();
      const data = res.data?.data || res.data || [];
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load assignable users", err);
      setUsers([]);
    }
  };

  if (!isOpen) return null;

  /* ---------------- HANDLERS ---------------- */

  const toggleMember = (id) => {
    setSelectedMembers((prev) =>
      prev.includes(id)
        ? prev.filter((m) => m !== id)
        : [...prev, id]
    );
  };

  const updateModule = (index, key, value) => {
    setModules((prev) => {
      const copy = [...prev];
      copy[index][key] = value;
      return copy;
    });
  };

  const addModule = () => {
    setModules((prev) => [...prev, { name: "", description: "" }]);
  };

  /* ---------------- SUBMIT (FIXED) ---------------- */

  const submit = async () => {
    if (!projectName.trim()) return alert("Project name required");

    await createProject({
      name: projectName,
      description,
      status,
      color, // ✅ Include color
      start_date: startDate || null,
      end_date: endDate || null,
      members: selectedMembers, // ✅ UUID array
      modules: modules.filter((m) => m.name.trim()), // ✅ clean modules
    });

    onClose();
  };

  /* ---------------- UI ---------------- */

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* HEADER */}
        <div style={styles.header}>
          <h3>Create Project</h3>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        {/* BODY */}
        <div style={styles.body}>
          {/* PROJECT NAME + COLOR */}
          <div style={styles.field}>
            <label>Project name</label>
            <div style={styles.nameRow}>
              <input
                style={styles.input}
                placeholder="Enter project title"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
              <div
                style={{ ...styles.colorPreview, background: color }}
                onClick={() => setShowColors(!showColors)}
              />
              {showColors && (
                <div style={styles.colorDropdown}>
                  {COLORS.map((c) => (
                    <div
                      key={c}
                      onClick={() => {
                        setColor(c);
                        setShowColors(false);
                      }}
                      style={{ ...styles.colorCell, background: c }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* DESCRIPTION */}
          <div style={styles.field}>
            <label>Description</label>
            <textarea
              style={{ ...styles.input, minHeight: 70 }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* STATUS */}
          <div style={styles.field}>
            <label>Status</label>
            <select
              style={styles.input}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="active">Active</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* DATES */}
          <div style={styles.row}>
            <input type="date" style={styles.input} onChange={(e) => setStartDate(e.target.value)} />
            <input type="date" style={styles.input} onChange={(e) => setEndDate(e.target.value)} />
          </div>



          {/* MEMBERS */}
          <div style={styles.field}>
            <label>Add members</label>
            <div style={styles.selectBox} onClick={() => setShowMembers(!showMembers)}>
              {selectedMembers.length === 0
                ? "Select members"
                : `${selectedMembers.length} selected`}
            </div>

            {showMembers && (
              <div style={styles.dropdown}>
                {users.map((u) => (
                  <label key={u.id} style={styles.dropdownItem}>
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(u.id)}
                      onChange={() => toggleMember(u.id)}
                    />
                    {u.full_name} ({u.role})
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* MODULES */}
          <div style={styles.field}>
            <label>Modules</label>
            {modules.map((mod, i) => (
              <div key={i} style={styles.moduleRow}>
                <input
                  style={styles.input}
                  placeholder="Module name"
                  value={mod.name}
                  onChange={(e) => updateModule(i, "name", e.target.value)}
                />
                <input
                  style={styles.input}
                  placeholder="Description"
                  value={mod.description}
                  onChange={(e) => updateModule(i, "description", e.target.value)}
                />
              </div>
            ))}
            <button onClick={addModule} style={styles.addModuleBtn}>
              + Add module
            </button>
          </div>
        </div>

        {/* FOOTER */}
        <div style={styles.footer}>
          <button style={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button style={styles.createBtn} onClick={submit}>
            Create Project
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- STYLES (UNCHANGED) ---------------- */

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    width: 700,
    maxHeight: "85vh",
    background: "#fff",
    borderRadius: 12,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  header: {
    padding: "16px 20px",
    borderBottom: "1px solid #eee",
    display: "flex",
    justifyContent: "space-between",
  },
  body: { padding: 20, overflowY: "auto" },
  footer: {
    padding: "14px 20px",
    borderTop: "1px solid #eee",
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
  },
  closeBtn: { border: "none", background: "none", fontSize: 18, cursor: "pointer" },
  field: { display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 },
  row: { display: "flex", gap: 12 },
  nameRow: { display: "flex", gap: 10, alignItems: "center", position: "relative" },
  input: { padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc" },
  colorPreview: { width: 32, height: 32, borderRadius: 6, border: "1px solid #ccc", cursor: "pointer" },
  colorDropdown: { position: "absolute", top: "100%", right: 0, background: "#fff", border: "1px solid #ddd", borderRadius: 8, padding: 10, display: "grid", gridTemplateColumns: "repeat(6, 28px)", gap: 8 },
  colorCell: { width: 28, height: 28, borderRadius: 6 },
  selectBox: { padding: "8px 10px", border: "1px solid #ccc", borderRadius: 6, cursor: "pointer" },
  dropdown: { border: "1px solid #ddd", borderRadius: 6, padding: 8, maxHeight: 160, overflowY: "auto" },
  dropdownItem: { display: "flex", gap: 8, fontSize: 14 },
  moduleRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  addModuleBtn: { border: "none", background: "none", color: "#4F7DFF", cursor: "pointer" },
  cancelBtn: { padding: "6px 14px", border: "1px solid #ccc", background: "#fff" },
  createBtn: { padding: "6px 16px", background: "#4F7DFF", color: "#fff", border: "none", borderRadius: 6 },
};
