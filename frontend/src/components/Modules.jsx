import React, { useEffect, useState, useCallback } from "react";
import { getModules } from "../api/modules";
import { getTasks } from "../api/tasks";
import { ChevronDown, ChevronUp, Box, CircleCheckBig, Circle, CircleMinus, Plus } from "lucide-react";
import Loader from "./Loader";
import Avatar from "./Avatar";
import AddModuleModal from "./AddModuleModal";

export default function Modules({ projectId, projectColor, onTaskClick, isAddModalOpen, setIsAddModalOpen }) {
  const [modules, setModules] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [expandedModules, setExpandedModules] = useState({});
  const [loading, setLoading] = useState(false);

  const role = JSON.parse(localStorage.getItem("userData"))?.role || "";
  const canModify = ["admin", "Project Manager"].includes(role);

  const fetchData = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const [mRes, tRes] = await Promise.all([
        getModules(projectId),
        getTasks(projectId)
      ]);
      const mods = mRes.data?.data || mRes.data || [];
      setModules(mods);
      setTasks(tRes.data?.data || tRes.data || []);

      // Expand first module by default if not already interacted
      if (mods.length > 0 && Object.keys(expandedModules).length === 0) {
        setExpandedModules({ [mods[0].id || mods[0]._id]: true });
      }
    } catch (err) {
      console.error("Error fetching module data:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId, expandedModules]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleModule = (id) => {
    setExpandedModules(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading && modules.length === 0) return <Loader fullScreen={false} />;

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <h3 style={styles.sectionTitle}>Modules & Tasks</h3>
      </div>

      <div style={styles.moduleList}>
        {modules.map((m) => {
          const mid = m.id || m._id;
          const isExpanded = expandedModules[mid];
          const moduleTasks = tasks.filter(t => t.module_id === mid);
          const completedCount = moduleTasks.filter(t => t.status?.toLowerCase() === "done").length;
          const inProgressCount = moduleTasks.filter(t => t.status?.toLowerCase() === "in_progress").length;
          const todoCount = moduleTasks.length - completedCount - inProgressCount;

          const progress = moduleTasks.length > 0 ? (completedCount / moduleTasks.length) * 100 : 0;

          return (
            <div key={mid} style={styles.card}>
              <div style={styles.cardHeader} onClick={() => toggleModule(mid)}>
                <div style={styles.cardLeft}>
                  <div style={{ ...styles.iconBox, background: `${projectColor}15` || "#eef2ff" }}>
                    <Box size={20} color={projectColor || "#6366f1"} />
                  </div>
                  <div style={styles.headerInfo}>
                    <div style={styles.moduleName}>{m.name}</div>
                    <div style={styles.moduleSub}>{m.description || "Module description"}</div>

                    <div style={styles.statusBadges}>
                      <span style={{ ...styles.badge, background: "#fffbeb", color: "#d97706" }}>
                        {todoCount} To Do
                      </span>
                      <span style={{ ...styles.badge, background: "#eff6ff", color: "#2563eb" }}>
                        {inProgressCount} In Progress
                      </span>
                      <span style={{ ...styles.badge, background: "#f0fdf4", color: "#16a34a" }}>
                        {completedCount} Completed
                      </span>
                    </div>
                  </div>
                </div>

                <div style={styles.cardRight}>
                  <div style={styles.progressSection}>
                    <div style={styles.progressTrack}>
                      <div style={{ ...styles.progressFill, width: `${progress}%`, background: projectColor || "#3b82f6" }} />
                    </div>
                    <span style={styles.progressText}>{Math.round(progress)}%</span>
                  </div>
                  {isExpanded ? <ChevronUp size={30} color="#121315ff" /> : <ChevronDown size={30} color="#121315ff" />}
                </div>
              </div>

              {isExpanded && (
                <div style={styles.taskList}>
                  {moduleTasks.map((t) => (
                    <div
                      key={t.id || t._id}
                      style={{ ...styles.taskItem, cursor: onTaskClick ? 'pointer' : 'default' }}
                      onClick={() => onTaskClick && onTaskClick(t)}
                    >
                      <div style={styles.taskLeft}>
                        {t.status?.toLowerCase() === "done" ? (
                          <CircleCheckBig size={16} color="#16a34a" />
                        ) : t.status?.toLowerCase() === "in_progress" ? (
                          <CircleMinus size={16} color="#2563eb" />
                        ) : (
                          <Circle size={16} color="#94a3b8" />
                        )}
                        <span style={{
                          ...styles.taskTitle,
                          textDecoration: t.status?.toLowerCase() === "done" ? "line-through" : "none",
                          color: t.status?.toLowerCase() === "done" ? "#94a3b8" : "#1e293b"
                        }}>
                          {t.title || t.taskName}
                        </span>
                      </div>

                      <div style={styles.taskRight}>
                        <Avatar
                          name={t.assignee_name || t.assignedTo?.full_name || "Unassigned"}
                          id={t.assignee_id}
                          size={24}
                        />
                      </div>
                    </div>
                  ))}
                  {moduleTasks.length === 0 && (
                    <div style={styles.emptyTasks}>No tasks found in this module.</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <AddModuleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        projectId={projectId}
        onModuleAdded={fetchData}
      />
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  addBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 16px",
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 600,
    color: "#475569",
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    "&:hover": {
      background: "#f8fafc",
      color: "#1e293b",
    },
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: "#1e293b",
    margin: 0,
  },
  moduleList: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  card: {
    background: "#fff",
    borderRadius: 20,
    border: "1px solid #f1f5f9",
    overflow: "hidden",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
  },
  cardHeader: {
    padding: "20px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
    transition: "background 0.2s",
    "&:hover": {
      background: "#f8fafc",
    },
  },
  cardLeft: {
    display: "flex",
    gap: 16,
    alignItems: "flex-start",
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    background: "#eef2ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  headerInfo: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  moduleName: {
    fontSize: 16,
    fontWeight: 700,
    color: "#1e293b",
  },
  moduleSub: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 8,
  },
  statusBadges: {
    display: "flex",
    gap: 8,
  },
  badge: {
    padding: "4px 10px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
  },
  cardRight: {
    display: "flex",
    alignItems: "center",
    gap: 24,
  },
  progressSection: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flex: "0 1 180px",
    minWidth: 100,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    background: "#f1f5f9",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "#3b82f6",
    borderRadius: 10,
  },
  progressText: {
    fontSize: 12,
    fontWeight: 600,
    color: "#94a3b8",
    minWidth: 34,
  },
  taskList: {
    padding: "0 24px 20px 80px",
    display: "flex",
    flexDirection: "column",
  },
  taskItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 0",
    borderBottom: "1px solid #f1f5f9",
    "&:last-child": {
      borderBottom: "none",
    },
  },
  taskLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: 500,
  },
  taskRight: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  taskStatus: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.5px",
  },
  emptyTasks: {
    padding: "16px 0",
    fontSize: 13,
    color: "#94a3b8",
    fontStyle: "italic",
  },
};
