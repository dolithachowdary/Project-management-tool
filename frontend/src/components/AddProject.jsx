import React, { useState } from "react";

const COLORS = [
  "#F6C1CC",
  "#DFE6D8",
  "#D8EDFF",
  "#E0E7FF",
  "#FFF1C1",
  "#EADCF8",
];

export default function AddProject({
  isOpen,
  onClose,
  members = [],
  usedColors = [],
}) {
  /* ---------------- STATE ---------------- */

  const [projectName, setProjectName] = useState("");
  const [color, setColor] = useState(
    COLORS.find(c => !usedColors.includes(c)) || COLORS[0]
  );
  const [showColors, setShowColors] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [selectedMembers, setSelectedMembers] = useState([]);
  const [showMembers, setShowMembers] = useState(false);

  const [modules, setModules] = useState([
    { name: "", description: "" },
  ]);

  if (!isOpen) return null;

  /* ---------------- HANDLERS ---------------- */

  const toggleMember = (id) => {
    setSelectedMembers(prev =>
      prev.includes(id)
        ? prev.filter(m => m !== id)
        : [...prev, id]
    );
  };

  const updateModule = (index, key, value) => {
    setModules(prev => {
      const copy = [...prev];
      copy[index][key] = value;
      return copy;
    });
  };

  const addModule = () => {
    setModules(prev => [...prev, { name: "", description: "" }]);
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

        {/* BODY – VERTICAL SCROLL ONLY */}
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
                  {COLORS.map((c) => {
                    const disabled = usedColors.includes(c);
                    return (
                      <div
                        key={c}
                        onClick={() => {
                          if (!disabled) {
                            setColor(c);
                            setShowColors(false);
                          }
                        }}
                        style={{
                          ...styles.colorCell,
                          background: c,
                          opacity: disabled ? 0.3 : 1,
                          cursor: disabled ? "not-allowed" : "pointer",
                          border:
                            color === c
                              ? "2px solid #333"
                              : "1px solid #ddd",
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* DATES */}
          <div style={styles.row}>
            <div style={styles.field}>
              <label>Start date</label>
              <input
                type="date"
                style={styles.input}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div style={styles.field}>
              <label>End date</label>
              <input
                type="date"
                style={styles.input}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* MEMBERS */}
          <div style={styles.field}>
            <label>Add members</label>

            <div
              style={styles.selectBox}
              onClick={() => setShowMembers(!showMembers)}
            >
              {selectedMembers.length === 0
                ? "Select members"
                : `${selectedMembers.length} selected`}
            </div>

            {showMembers && (
              <div style={styles.dropdown}>
                {members.map(m => (
                  <label key={m.id} style={styles.dropdownItem}>
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(m.id)}
                      onChange={() => toggleMember(m.id)}
                    />
                    {m.name}
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
                  onChange={(e) =>
                    updateModule(i, "name", e.target.value)
                  }
                />
                <input
                  style={styles.input}
                  placeholder="Description"
                  value={mod.description}
                  onChange={(e) =>
                    updateModule(i, "description", e.target.value)
                  }
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
          <button style={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button
            style={styles.createBtn}
            onClick={() => {
              console.log({
                projectName,
                color,
                startDate,
                endDate,
                selectedMembers,
                modules,
              });
              onClose();
            }}
          >
            Create Project
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- STYLES ---------------- */

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
    width: 520,
    maxHeight: "85vh",
    background: "#fff",
    borderRadius: 12,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden", // 🚫 horizontal scroll
    fontFamily: "Poppins, sans-serif",
  },

  header: {
    padding: "16px 20px",
    borderBottom: "1px solid #eee",
    display: "flex",
    justifyContent: "space-between",
  },

  body: {
    padding: 20,
    overflowY: "auto",   // ✅ vertical scroll
    overflowX: "hidden", // 🚫 horizontal scroll
  },

  footer: {
    padding: "14px 20px",
    borderTop: "1px solid #eee",
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
  },

  closeBtn: {
    border: "none",
    background: "none",
    fontSize: 18,
    cursor: "pointer",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    marginBottom: 16,
  },

  row: {
    display: "flex",
    gap: 12,
  },

  nameRow: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    position: "relative", // ✅ anchor dropdown
  },

  input: {
    padding: "8px 10px",
    borderRadius: 6,
    border: "1px solid #ccc",
    fontSize: 14,
    width: "100%",
  },

  colorPreview: {
    width: 32,
    height: 32,
    borderRadius: 6,
    border: "1px solid #ccc",
    cursor: "pointer",
    flexShrink: 0,
  },

  colorDropdown: {
    position: "absolute",
    top: "100%",
    right: 0,
    marginTop: 8,
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: 10,
    display: "grid",
    gridTemplateColumns: "repeat(6, 28px)",
    gap: 8,
    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
    zIndex: 20,
  },

  colorCell: {
    width: 28,
    height: 28,
    borderRadius: 6,
  },

  selectBox: {
    padding: "8px 10px",
    border: "1px solid #ccc",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 14,
  },

  dropdown: {
    border: "1px solid #ddd",
    borderRadius: 6,
    padding: 8,
    maxHeight: 150,
    overflowY: "auto",
  },

  dropdownItem: {
    display: "flex",
    gap: 8,
    fontSize: 14,
    padding: "4px 0",
  },

  moduleRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    marginBottom: 8,
  },

  addModuleBtn: {
    border: "none",
    background: "none",
    color: "#4F7DFF",
    cursor: "pointer",
    alignSelf: "flex-start",
  },

  cancelBtn: {
    padding: "6px 14px",
    border: "1px solid #ccc",
    background: "#fff",
    cursor: "pointer",
  },

  createBtn: {
    padding: "6px 16px",
    background: "#4F7DFF",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
};
