import React, { useEffect, useState } from "react";
import { getModules } from "../api/modules";
import { Box, ChevronRight, Layers } from "lucide-react";

export default function Modules({ projectId }) {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (projectId) {
      setLoading(true);
      getModules(projectId)
        .then((r) => {
          const data = r.data?.data || r.data || [];
          setModules(data);
        })
        .catch(err => console.error("Error fetching modules:", err))
        .finally(() => setLoading(false));
    }
  }, [projectId]);

  if (loading) return <div style={styles.card}>Loading modules...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <h3 style={styles.sectionTitle}>Modules</h3>
        <span style={styles.countBadge}>{modules.length}</span>
      </div>

      {modules.length === 0 ? (
        <div style={styles.empty}>No modules defined for this project.</div>
      ) : (
        modules.map((m) => (
          <div key={m.id || m._id} style={styles.card}>
            <div style={styles.cardLeft}>
              <div style={styles.iconBox}>
                <Layers size={20} color="#6366f1" />
              </div>
              <div style={styles.info}>
                <div style={styles.name}>{m.name}</div>
                <div style={styles.subText}>
                  {m.taskCount || 0} Tasks • {m.status || "In Development"}
                </div>
              </div>
            </div>
            <ChevronRight size={18} color="#94a3b8" />
          </div>
        ))
      )}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "8px"
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#1e293b",
    margin: 0
  },
  countBadge: {
    background: "#e2e8f0",
    color: "#475569",
    padding: "2px 8px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: 600
  },
  card: {
    background: "#fff",
    borderRadius: "12px",
    padding: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    border: "1px solid #f1f5f9",
    transition: "all 0.2s ease",
    cursor: "pointer",
    ":hover": {
      borderColor: "#e2e8f0",
      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)"
    }
  },
  cardLeft: {
    display: "flex",
    alignItems: "center",
    gap: "16px"
  },
  iconBox: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    background: "#f5f3ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  info: {
    display: "flex",
    flexDirection: "column"
  },
  name: {
    fontWeight: 600,
    color: "#1e293b",
    fontSize: "15px"
  },
  subText: {
    fontSize: "13px",
    color: "#64748b",
    marginTop: "2px"
  },
  empty: {
    padding: "24px",
    textAlign: "center",
    color: "#94a3b8",
    background: "#f8fafc",
    borderRadius: "12px",
    border: "1px dashed #e2e8f0",
    fontSize: "14px"
  }
};
