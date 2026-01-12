import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProjects } from "../api/projects";
import { getSprints } from "../api/sprints";
import { getTasks } from "../api/tasks";
import Loader from "./Loader";

import Stats from "./Stats";
import Card from "./Card";
import MiniCalendar from "./Mini-Calendar";
import Upcoming from "./Upcoming";
import RecentActivity from "./RecentActivity";
import QAPending from "./QAPending";
import WeeklyTaskGraph from "./WeeklyTaskGraph";
import TaskForm from "./TaskForm";
import { updateTask } from "../api/tasks";
import toast from "react-hot-toast";

export default function PMDashboard() {
  const navigate = useNavigate();

  /* ---------------- STATE ---------------- */
  const [activeProjects, setActiveProjects] = useState([]);
  const [activeSprints, setActiveSprints] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [statsData, setStatsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allProjects, setAllProjects] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");


  const handleEditTask = (t) => {
    setEditingTask(t);
    setIsEditTaskModalOpen(true);
  };

  const handleTaskUpdate = async (taskData) => {
    try {
      await updateTask(editingTask.id || editingTask._id, taskData);
      toast.success("Task updated!");
      setIsEditTaskModalOpen(false);
      setEditingTask(null);
      // We need to refresh the dashboard data
      window.location.reload(); // Simple refresh for now or call fetchData
    } catch (err) {
      console.error(err);
      toast.error("Failed to update task");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [projectsRes, sprintsRes, tasksRes, weeklyRes] = await Promise.all([
          getProjects(),
          getSprints(),
          getTasks(),
          import("../api/dashboard").then(m => m.getWeeklyStats()).catch(() => ({ data: { data: [] } }))
        ]);

        const projectsData = projectsRes.data?.data || projectsRes.data || [];
        const sprintsData = sprintsRes.data?.data || sprintsRes.data || [];
        const tasksData = tasksRes.data?.data || tasksRes.data || [];
        const weeklyData = weeklyRes.data?.data || weeklyRes.data || [];

        setAllTasks(tasksData);
        setWeeklyStats(weeklyData);

        // Map Projects
        const mappedProjects = projectsData.map(p => ({
          id: p.id || p._id,
          title: p.name,
          progress: p.progress || calculateProgress(p, tasksData),
          startDate: formatDate(p.start_date || p.startDate),
          endDate: formatDate(p.end_date || p.endDate),
          members: (p.members || []).slice(0, 3).map(m => ({
            id: m.user_id || m.id || m,
            name: m.name || "Member",
            color: m.color || "#e0e7ff"
          })),
          timeLeft: p.status || "Active",
          color: p.color || getRandomColor(p.id),
          raw: p
        }));

        setAllProjects(projectsData);

        // Map Sprints
        const mappedSprints = sprintsData.map(s => {
          const total = Number(s.total_tasks) || 0;
          const completed = Number(s.completed_tasks) || 0;
          const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

          return {
            id: s.id,
            title: `${s.project_name || 'Project'} - ${s.name}`,
            progress: progress,
            startDate: formatDate(s.start_date),
            endDate: formatDate(s.end_date),
            members: [],
            timeLeft: s.status || "Active",
            color: s.project_color || getRandomColor(s.id),
            raw: s
          };
        });

        setActiveProjects(mappedProjects.slice(0, 3));
        setActiveSprints(mappedSprints.slice(0, 3));

        // Calculate Stats
        const completedCount = tasksData.filter(t => (t.status || "").toLowerCase() === "done").length;
        const totalCount = tasksData.length;
        const overdueCount = tasksData.filter(t => {
          if (!t.end_date || (t.status || "").toLowerCase() === "done") return false;
          return new Date(t.end_date) < new Date();
        }).length;

        setStatsData([
          {
            title: "Completed tasks",
            value: completedCount,
            percent: totalCount > 0 ? `${Math.round((completedCount / totalCount) * 100)}%` : "0%",
            trend: "up",
            color: "#10b981",
            graph: [5, 8, 12, 10, 15, completedCount],
          },
          {
            title: "Incompleted tasks",
            value: totalCount - completedCount,
            percent: totalCount > 0 ? `${Math.round(((totalCount - completedCount) / totalCount) * 100)}%` : "0%",
            trend: "down",
            color: "#ef4444",
            graph: [20, 18, 15, 17, 14, totalCount - completedCount],
          },
          {
            title: "Overdue tasks",
            value: overdueCount,
            percent: totalCount > 0 ? `${Math.round((overdueCount / totalCount) * 100)}%` : "0%",
            trend: overdueCount > 5 ? "up" : "down",
            color: "#64748b",
            graph: [2, 4, 3, 5, 2, overdueCount],
          },
        ]);

      } catch (err) {
        console.error("Dashboard fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const calculateProgress = (project, tasks) => {
    const pTasks = tasks.filter(t => t.project_id === (project.id || project._id));
    if (pTasks.length === 0) return 0;
    const completed = pTasks.filter(t => (t.status || "").toLowerCase() === "done").length;
    return Math.round((completed / pTasks.length) * 100);
  };

  const formatDate = (d) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const getRandomColor = (id) => {
    const colors = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];
    const index = typeof id === 'number' ? id : (id || "").length;
    return colors[index % colors.length] || colors[0];
  };

  if (loading) return <Loader />;

  return (
    <div style={styles.page}>
      <div style={styles.mainGrid}>

        {/* LEFT COLUMN */}
        <div style={styles.left}>
          <Stats data={statsData} />

          <div style={styles.topRow}>
            <div style={styles.graphWrapper}>
              <h3 style={styles.sectionTitle}>Weekly task graph</h3>
              <div style={{ flex: 1, minHeight: 0 }}>
                <WeeklyTaskGraph data={weeklyStats} />
              </div>
            </div>

            <div style={styles.recentWrapper}>
              <RecentActivity />
            </div>
          </div>

          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Active Projects</h3>
              <button style={styles.viewAll} onClick={() => navigate("/projects")}>View all</button>
            </div>
            <div style={styles.cardGrid}>
              {activeProjects.map(card => (
                <div key={card.id} style={styles.cardWrapper} onClick={() => navigate(`/projects/${card.id}`)}>
                  <Card {...card} />
                </div>
              ))}
              {activeProjects.length === 0 && <div style={styles.empty}>No active projects found.</div>}
            </div>
          </div>

          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Active Sprints</h3>
              <button style={styles.viewAll} onClick={() => navigate("/sprints")}>View all</button>
            </div>
            <div style={styles.cardGrid}>
              {activeSprints.map(card => (
                <div key={card.id} style={styles.cardWrapper} onClick={() => navigate(`/sprints/${card.id}`)}>
                  <Card
                    {...card}
                  />
                </div>
              ))}
              {activeSprints.length === 0 && <div style={styles.empty}>No active sprints found.</div>}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <aside style={styles.right}>
          <div style={styles.sideItem}>
            <MiniCalendar />
          </div>
          <div style={styles.sideItem}>
            <Upcoming tasks={allTasks} onTaskClick={handleEditTask} />
          </div>
          <div style={styles.sideItem}>
            <QAPending />
          </div>
        </aside>
      </div>


      {isEditTaskModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent} className="hide-scrollbar">
            <TaskForm
              onSave={handleTaskUpdate}
              onCancel={() => {
                setIsEditTaskModalOpen(false);
                setEditingTask(null);
              }}
              projects={allProjects}
              currentUserId={userData?.id}
              initialData={editingTask}
              initialProjectId={editingTask?.project_id}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const styles = {
  page: {
    padding: "0 10px",
  },
  mainGrid: {
    display: "flex",
    gap: 15,
    alignItems: "flex-start",
  },
  left: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 16, // Decreased from 24
  },
  right: {
    width: 340, // Reduced by ~25% from 450
    display: "flex",
    flexDirection: "column",
    gap: 16,
    position: "sticky",
    paddingRight: 4,
  },
  topRow: {
    display: "grid",
    gridTemplateColumns: "1.8fr 1fr",
    gap: 16,
    height: 380, // Standard fixed height
  },
  graphWrapper: {
    background: "var(--card-bg)",
    borderRadius: 16,
    border: "1px solid var(--border-color)",
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "var(--shadow-sm)",
    minHeight: 0,
    overflow: "hidden", // Added to ensure no leakage
  },
  recentWrapper: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    minHeight: 0, // Added to respect parent grid height
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "var(--text-primary)",
    margin: 0,
    fontFamily: "'Poppins', sans-serif",
  },
  viewAll: {
    background: "transparent",
    border: "none",
    color: "#C62828",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)", // Exactly 3 cards in one row
    gap: 16,
    paddingBottom: 4,
  },
  cardWrapper: {
    cursor: "pointer",
    transition: "transform 0.2s",
    "&:hover": {
      transform: "translateY(-4px)",
    }
  },
  sideItem: {
    flexShrink: 0,
  },
  empty: {
    padding: 40,
    textAlign: "center",
    background: "var(--card-bg)",
    borderRadius: 12,
    border: "1px dashed var(--border-color)",
    color: "var(--text-secondary)",
    gridColumn: "1 / -1",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
    backdropFilter: "blur(4px)",
  },
  modalContent: {
    width: "100%",
    maxWidth: "800px",
    maxHeight: "90vh",
    overflowY: "auto",
    padding: "15px",
  },
};
