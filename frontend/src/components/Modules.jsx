import React, { useEffect, useState } from "react";
import { getModules } from "../api/modules";

export default function Modules({ projectId }) {
  const [modules, setModules] = useState([]);

  useEffect(() => {
    getModules(projectId).then((r) => setModules(r.data));
  }, [projectId]);

  return (
    <div>
      <h3>Modules</h3>
      {modules.map((m) => (
        <div key={m.id}>{m.name}</div>
      ))}
    </div>
  );
}


const styles = {
  card: {
    background: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    cursor: "pointer"
  },
  left: {
    display: "flex",
    gap: 12
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: "#e8f0ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  title: { fontWeight: 600 },
  phase: { fontSize: 13, color: "#777" },
  body: {
    marginTop: 12,
    fontSize: 14,
    color: "#444"
  },
  meta: {
    background: "#f3f4f6",
    padding: 10,
    borderRadius: 8
  }
};
