import React, { useEffect, useState } from "react";
import { getModules } from "../api/modules";
import { getTasks } from "../api/tasks";
import { ChevronRight, ChevronDown, Layers, Clock, CheckCircle2, Circle } from "lucide-react";
import Loader from "./Loader";

export default function Modules({ projectId }) {
  const [modules, setModules] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [expandedModule, setExpandedModule] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (projectId) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const [mRes, tRes] = await Promise.all([
            getModules(projectId),
            getTasks(projectId)
          ]);
          setModules(mRes.data?.data || mRes.data || []);
          setTasks(tRes.data?.data || tRes.data || []);
        } catch (err) {
          console.error("Error fetching module data:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [projectId]);

  const toggleModule = (id) => {
    setExpandedModule(expandedModule === id ? null : id);
  };

  if (loading) return <Loader fullScreen={false} />;

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <h3 style={styles.sectionTitle}>Modules & Tasks</h3>
        <span style={styles.countBadge}>{modules.length} Modules</span>
      </div>

      <div style={styles.moduleList}>
        {modules.length === 0 ? (
          <div style={styles.empty}>No modules defined for this project.</div>
        ) : (
          modules.map((m) => {
            const isExpanded = expandedModule === (m.id || m._id);
            const moduleTasks = tasks.filter(t => t.module_id === (m.id || m._id));

            return (
              <div key={m.id || m._id} style={styles.moduleWrapper}>
                <div
                  style={{
                    ...styles.card,
                    ...(isExpanded ? styles.expandedCard : {})
                  }}
                  onClick={() => toggleModule(m.id || m._id)}
                >
                  <div style={styles.cardLeft}>
                    <div style={styles.iconBox}>
                      <Layers size={18} color={isExpanded ? "#4f46e5" : "#6366f1"} />
                    </div>
                    <div style={styles.info}>
                      <div style={styles.name}>{m.name}</div>
                      <div style={styles.subText}>
                        {moduleTasks.length} Tasks • {m.status || "Active"}
                      </div>
                    </div>
                  </div>
                  {isExpanded ? <ChevronDown size={18} color="#4f46e5" /> : <ChevronRight size={18} color="#94a3b8" />}
                </div>

                {isExpanded && (
                  <div style={styles.tasksContainer}>
                    {moduleTasks.length === 0 ? (
                      <div style={styles.noTasks}>No tasks in this module.</div>
                    ) : (
                      moduleTasks.map(t => (
                        <div key={t.id || t._id} style={styles.taskItem}>
                          <div style={styles.taskTitleRow}>
                            {t.status === "Done" || t.status === "done" ? (
                              <CheckCircle2 size={14} color="#10b981" />
                            ) : (
                              <Circle size={14} color="#94a3b8" />
                            )}
                            <span style={styles.taskTitle}>{t.title || t.taskName}</span>
                          </div>
                          <div style={styles.taskMeta}>
                            <div style={styles.durationBadge}>
                              <Clock size={12} />
                              <span>{t.duration || t.computed_duration || "—"}</span>
                            </div>
                            <span style={styles.taskStatusBadge}>{t.status}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "4px"
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#1e293b",
    margin: 0
  },
  countBadge: {
    background: "#eef2ff",
    color: "#4f46e5",
    padding: "2px 10px",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: 700,
    textTransform: "uppercase"
  },
  moduleList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  moduleWrapper: {
    display: "flex",
    flexDirection: "column",
    borderRadius: "12px",
    overflow: "hidden",
    border: "1px solid #f1f5f9",
    background: "#fff",
  },
  card: {
    padding: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    transition: "all 0.2s ease",
    cursor: "pointer",
    background: "#fff",
    "&:hover": {
      background: "#f8fafc",
    }
  },
  expandedCard: {
    background: "#f5f3ff",
    borderBottom: "1px solid #eef2ff",
  },
  cardLeft: {
    display: "flex",
    alignItems: "center",
    gap: "16px"
  },
  iconBox: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    background: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
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
    fontSize: "12px",
    color: "#64748b",
    marginTop: "2px"
  },
  tasksContainer: {
    background: "#fcfcfd",
    padding: "8px 16px 16px 52px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  taskItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 0",
    borderBottom: "1px solid #f1f5f9",
    "&:last-child": {
      borderBottom: "none"
    }
  },
  taskTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },
  taskTitle: {
    fontSize: "13px",
    color: "#334155",
    fontWeight: 500
  },
  taskMeta: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  durationBadge: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "11px",
    color: "#64748b",
    background: "#f1f5f9",
    padding: "2px 8px",
    borderRadius: "4px"
  },
  taskStatusBadge: {
    fontSize: "10px",
    fontWeight: 600,
    color: "#94a3b8",
    textTransform: "uppercase"
  },
  noTasks: {
    padding: "12px 0",
    fontSize: "13px",
    color: "#94a3b8",
    fontStyle: "italic"
  },
  empty: {
    padding: "32px",
    textAlign: "center",
    color: "#94a3b8",
    background: "#f8fafc",
    borderRadius: "12px",
    border: "1px dashed #e2e8f0",
    fontSize: "14px"
  }
};
