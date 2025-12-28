import React, { useEffect, useState } from "react";
import { createProject } from "../api/projects";
import { getAssignableUsers } from "../api/users";

export default function AddProject({ isOpen, onClose, onCreated }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [users, setUsers] = useState([]);
  const [members, setMembers] = useState([]);
  const [modules, setModules] = useState([{ name: "" }]);

  useEffect(() => {
    if (isOpen) {
      getAssignableUsers().then((r) => setUsers(r.data));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const submit = async () => {
    await createProject({
      name,
      description,
      start_date: startDate || null,
      end_date: endDate || null,
      status,
      members,
      modules: modules.filter((m) => m.name.trim()),
    });

    onCreated();
    onClose();
  };

  return (
    <div className="modal">
      <h3>Create Project</h3>

      <input placeholder="Project Name" onChange={(e) => setName(e.target.value)} />
      <textarea placeholder="Description" onChange={(e) => setDescription(e.target.value)} />

      <select onChange={(e) => setStatus(e.target.value)}>
        <option value="active">Active</option>
        <option value="on_hold">On Hold</option>
        <option value="completed">Completed</option>
      </select>

      <input type="date" onChange={(e) => setStartDate(e.target.value)} />
      <input type="date" onChange={(e) => setEndDate(e.target.value)} />

      <h4>Members</h4>
      {users.map((u) => (
        <label key={u.id}>
          <input
            type="checkbox"
            onChange={() =>
              setMembers((m) =>
                m.includes(u.id) ? m.filter((x) => x !== u.id) : [...m, u.id]
              )
            }
          />
          {u.full_name}
        </label>
      ))}

      <h4>Modules</h4>
      {modules.map((m, i) => (
        <input
          key={i}
          placeholder="Module name"
          onChange={(e) => {
            const copy = [...modules];
            copy[i].name = e.target.value;
            setModules(copy);
          }}
        />
      ))}
      <button onClick={() => setModules([...modules, { name: "" }])}>
        + Add Module
      </button>

      <button onClick={submit}>Create</button>
      <button onClick={onClose}>Cancel</button>
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
    overflow: "hidden",
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
    overflowY: "auto",
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
    position: "relative",
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
