import React, { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { createProject } from "../api/projects";
import { getAssignableUsers } from "../api/users";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import Avatar from "./Avatar";
import DatePicker from "./DatePicker";

const COLORS = [
  "#9e2a2b",
  "#bf5000",
  "#124559",
  "#3d348b",
  "#AB274F",
  "#E6A817",
  "#AF6E4D",
  "#008080",
  "#3AA8C1",
  "#645394",
  "#C04000",
];

export default function AddProject({ isOpen, onClose, usedColors = [] }) {
  /* ---------------- STATE ---------------- */

  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  // Removed status state as per request

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

  const colorDropdownRef = useRef(null);
  const memberDropdownRef = useRef(null);
  const colorPickerBtnRef = useRef(null);
  const memberSelectBtnRef = useRef(null);

  /* ---------------- CLICK OUTSIDE ---------------- */

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Color Dropdown
      if (
        showColors &&
        colorDropdownRef.current &&
        !colorDropdownRef.current.contains(event.target) &&
        colorPickerBtnRef.current &&
        !colorPickerBtnRef.current.contains(event.target)
      ) {
        setShowColors(false);
      }

      // Member Dropdown
      if (
        showMembers &&
        memberDropdownRef.current &&
        !memberDropdownRef.current.contains(event.target) &&
        memberSelectBtnRef.current &&
        !memberSelectBtnRef.current.contains(event.target)
      ) {
        setShowMembers(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showColors, showMembers]);

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

  const removeModule = (index) => {
    if (modules.length === 1) {
      setModules([{ name: "", description: "" }]); // Just clear it if it's the last one
    } else {
      setModules((prev) => prev.filter((_, i) => i !== index));
    }
  };


  /* ---------------- SUBMIT ---------------- */

  const submit = async () => {
    if (!projectName.trim()) return toast.error("Project name required");

    // Use FormData for file upload
    const formData = new FormData();
    formData.append("name", projectName);
    formData.append("description", description);
    formData.append("color", color);
    if (startDate) formData.append("start_date", startDate);
    if (endDate) formData.append("end_date", endDate);
    formData.append("members", JSON.stringify(selectedMembers));
    formData.append("modules", JSON.stringify(modules.filter((m) => m.name.trim())));


    try {
      await createProject(formData);
      onClose();
    } catch (err) {
      console.error("Failed to create project", err);
      toast.error(err.response?.data?.message || "Failed to create project");
    }
  };

  /* ---------------- UI ---------------- */

  const getSelectedMemberNames = () => {
    return users
      .filter((u) => selectedMembers.includes(u.id))
      .map((u) => u.full_name)
      .join(", ");
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* HEADER */}
        <div style={styles.header}>
          <h3>Create Project</h3>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        {/* BODY */}
        <div style={styles.body} className="hide-scrollbar">
          {/* PROJECT NAME + COLOR */}
          {/* NAME & COLOR ROW */}
          <div style={styles.row}>
            {/* PROJECT NAME */}
            <div style={{ ...styles.field, flex: 1, marginBottom: 0 }}>
              <label style={styles.label}>Project name</label>
              <input
                style={styles.input}
                placeholder="Enter project title"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>

            {/* COLOR PICKER */}
            <div style={{ ...styles.field, marginBottom: 0 }}>
              <label style={styles.label}>Color</label>
              <div style={styles.nameRow}>
                <div
                  ref={colorPickerBtnRef}
                  style={styles.colorTrigger}
                  onClick={() => setShowColors(!showColors)}
                >
                  <div style={{ ...styles.colorPreview, background: color }} />
                  <ChevronDown size={14} color="#666" />
                </div>

                {showColors && (
                  <div ref={colorDropdownRef} style={styles.colorDropdown}>
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
          </div>

          <div style={{ marginBottom: 20 }} /> {/* Spacer since fields inside row had marginBottom: 0 */}

          {/* DESCRIPTION */}
          <div style={styles.field}>
            <label style={styles.label}>Description</label>
            <textarea
              style={{ ...styles.input, minHeight: 70 }}
              placeholder="Enter project description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* DATES */}
          <div style={styles.row}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          {/* MEMBERS */}
          <div style={styles.field}>
            <label style={styles.label}>Add members</label>
            <div
              ref={memberSelectBtnRef}
              style={styles.selectBox}
              onClick={() => setShowMembers(!showMembers)}
            >
              {selectedMembers.length === 0
                ? <span style={{ color: "#999" }}>Select members</span>
                : getSelectedMemberNames()}
              <ChevronDown size={16} color="#666" />
            </div>

            {showMembers && (
              <div ref={memberDropdownRef} style={styles.dropdown} className="hide-scrollbar">
                {users.map((u) => (
                  <div
                    key={u.id}
                    style={styles.dropdownItem}
                    onClick={() => toggleMember(u.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(u.id)}
                      readOnly
                    />
                    <Avatar name={u.full_name} id={u.id} size={24} />
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontWeight: 500, fontSize: 13 }}>{u.full_name}</span>
                      <span style={{ fontSize: 11, color: "#666" }}>{u.role}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ ...styles.field, marginTop: 10 }}>
            <label style={styles.label}>Modules</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {modules.map((mod, i) => (
                <div key={i} style={styles.moduleRow}>
                  <input
                    style={{ ...styles.input, flex: 1 }}
                    placeholder="Module name"
                    value={mod.name}
                    onChange={(e) => updateModule(i, "name", e.target.value)}
                  />
                  <input
                    style={{ ...styles.input, flex: 2 }}
                    placeholder="Description"
                    value={mod.description}
                    onChange={(e) => updateModule(i, "description", e.target.value)}
                  />
                  <div style={{ display: "flex", gap: 4 }}>
                    <button
                      onClick={addModule}
                      style={styles.actionBtn}
                      title="Add Module"
                    >
                      <Plus size={16} color="#c62828" />
                    </button>
                    <button
                      onClick={() => removeModule(i)}
                      style={styles.actionBtn}
                      title="Remove Module"
                    >
                      <Trash2 size={16} color="#ef4444" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
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
    background: "var(--modal-overlay)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    backdropFilter: "blur(4px)",
  },
  modal: {
    width: 600,
    maxHeight: "90vh",
    background: "var(--card-bg)",
    borderRadius: 16,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxShadow: "var(--shadow-md)",
  },
  header: {
    padding: "16px 20px",
    borderBottom: "1px solid var(--border-color)",
    display: "flex",
    justifyContent: "space-between",
    color: "var(--text-primary)",
  },
  body: { padding: 20, overflowY: "auto", flex: 1 },
  footer: {
    padding: "14px 20px",
    borderTop: "1px solid var(--border-color)",
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    backgroundColor: "var(--bg-secondary)",
  },
  closeBtn: { border: "none", background: "none", fontSize: 18, cursor: "pointer", color: "#64748b" },
  field: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 600, color: "var(--text-primary)" },
  row: { display: "flex", gap: 16 },
  nameRow: { display: "flex", gap: 10, alignItems: "center", position: "relative" },
  input: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid var(--border-color)",
    fontSize: 14,
    color: "var(--text-primary)",
    background: "var(--input-bg)",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  },
  colorTrigger: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 12px",
    borderRadius: 8,
    border: "1px solid var(--border-color)",
    cursor: "pointer",
    background: "var(--input-bg)",
    width: "fit-content",
  },
  colorPreview: { width: 24, height: 24, borderRadius: 6, border: "1px solid var(--border-color)" },
  colorDropdown: {
    position: "absolute",
    top: "calc(100% + 5px)",
    right: 0,
    background: "var(--card-bg)",
    border: "1px solid var(--border-color)",
    borderRadius: 12,
    padding: 12,
    display: "grid",
    gridTemplateColumns: "repeat(4, 28px)",
    gap: 10,
    zIndex: 100,
    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
  },
  colorCell: { width: 28, height: 28, borderRadius: 6, cursor: "pointer", border: "1px solid rgba(0,0,0,0.05)" },
  selectBox: {
    padding: "10px 12px",
    border: "1px solid var(--border-color)",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 14,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "var(--input-bg)",
    color: "var(--text-primary)",
    minHeight: 40,
  },
  dropdown: {
    border: "1px solid var(--border-color)",
    borderRadius: 12,
    padding: 8,
    maxHeight: 250,
    overflowY: "auto",
    background: "var(--card-bg)",
    boxShadow: "var(--shadow-md)",
    marginTop: 5,
  },
  dropdownItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "8px 12px",
    cursor: "pointer",
    borderRadius: 8,
    transition: "background 0.2s",
    color: "var(--text-primary)",
    "&:hover": { background: "var(--hover-bg)" },
  },
  moduleRow: { display: "flex", gap: 12, alignItems: "center" },
  actionBtn: {
    background: "var(--bg-secondary)",
    border: "1px solid var(--border-color)",
    borderRadius: 6,
    width: 28,
    height: 28,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s",
    "&:hover": { background: "var(--hover-bg)", borderColor: "var(--text-secondary)" }
  },
  cancelBtn: { padding: "10px 20px", borderRadius: 8, border: "1px solid var(--border-color)", background: "var(--card-bg)", color: "var(--text-secondary)", fontWeight: 600, cursor: "pointer" },
  createBtn: {
    padding: "10px 24px",
    background: "#c62828",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 4px 6px -1px rgba(198, 40, 40, 0.2)",
  },
};
