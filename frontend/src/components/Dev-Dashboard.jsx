import React, { useEffect, useState } from "react";
import TaskOverviewList from "./TaskOverviewList";
import DevTaskPie from "./DevTaskPie";
import WeeklyTaskGraph from "./WeeklyTaskGraph";
import RecentActivity from "./RecentActivity";
import Loader from "./Loader";
import { getTasks, updateTask } from "../api/tasks";
import { getProjects } from "../api/projects";
import TaskForm from "./TaskForm";
import toast from "react-hot-toast";

const DevDashboard = ({ role }) => {
  const [tasks, setTasks] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allProjects, setAllProjects] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);

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
      window.location.reload();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update task");
    }
  };

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const currentUserId = userData.id || userData.user_id;
  const userName = userData.name || userData.full_name;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [tasksRes, weeklyRes, projectsRes] = await Promise.all([
          getTasks(),
          import("../api/dashboard").then(m => m.getWeeklyStats()).catch(() => ({ data: { data: [] } })),
          getProjects()
        ]);

        const tasksData = tasksRes.data?.data || tasksRes.data || [];
        const weeklyData = weeklyRes.data?.data || weeklyRes.data || [];
        const projectsData = projectsRes.data?.data || projectsRes.data || [];

        setWeeklyStats(weeklyData);
        setAllProjects(projectsData);

        // Filter tasks for current dev
        const myTasks = tasksData.filter(t => {
          const assignedId = t.assignee_id || t.assigned_to_id || t.assignedTo;
          if (Array.isArray(assignedId)) return assignedId.includes(currentUserId) || assignedId.includes(userName);
          if (typeof assignedId === 'object' && assignedId !== null) return assignedId.id === currentUserId || assignedId.name === userName;
          return assignedId === currentUserId || assignedId === userName;
        });

        setTasks(myTasks);

        // Calculate Pie Data
        const projectGroups = myTasks.reduce((acc, t) => {
          const pName = t.project_name || t.projectName || "General";
          if (!acc[pName]) acc[pName] = { total: 0, completed: 0, color: getRandomColor(pName) };
          acc[pName].total++;
          if ((t.status || "").toLowerCase() === "done") acc[pName].completed++;
          return acc;
        }, {});

        const mappedPieData = Object.keys(projectGroups).map(name => ({
          project: name,
          ...projectGroups[name]
        }));

        setPieData(mappedPieData);

      } catch (err) {
        console.error("Dev Dashboard fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUserId, userName]);

  const getRandomColor = (str) => {
    const colors = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  if (loading) return <Loader />;

  return (
    <div style={styles.page}>

      {/* HEADER */}
      <div style={styles.headerRow}>
        <h2 style={styles.title}>Developer Overview</h2>
        <div style={styles.welcome}>Welcome back, <span style={styles.name}>{userName}</span></div>
      </div>

      {/* ================= TOP ROW ================= */}
      <div style={styles.topRow}>
        <div style={styles.listWrapper}>
          <TaskOverviewList
            role="Developer"
            tasks={tasks}
            currentUserId={currentUserId}
            currentUser={userName}
            onTaskClick={handleEditTask}
          />
        </div>

        <div style={styles.pieWrapper}>
          <DevTaskPie data={pieData} />
        </div>
      </div>

      {/* ================= BOTTOM ROW ================= */}
      <div style={styles.bottomRow}>
        <div style={styles.graphWrapper}>
          <h3 style={styles.sectionTitle}>Task Progress</h3>
          <WeeklyTaskGraph data={weeklyStats} />
        </div>
        <div style={styles.activityWrapper}>
          <RecentActivity />
        </div>
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
};

/* ================= STYLES ================= */

const styles = {
  page: {
    padding: "0 10px",
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },

  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 22,
    fontWeight: 700,
    color: "#1e293b",
    margin: 0,
  },

  welcome: {
    fontSize: 14,
    color: "#64748b",
  },

  name: {
    fontWeight: 700,
    color: "#4f46e5",
  },

  topRow: {
    display: "grid",
    gridTemplateColumns: "1.8fr 1.2fr",
    gap: 24,
    alignItems: "stretch",
  },

  bottomRow: {
    display: "grid",
    gridTemplateColumns: "1.8fr 1.2fr",
    gap: 24,
  },

  listWrapper: {
    height: "100%",
  },

  pieWrapper: {
    height: "100%",
  },

  graphWrapper: {
    background: "#fff",
    borderRadius: 16,
    border: "1px solid #f1f5f9",
    padding: 24,
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 16,
    color: "#1e293b",
  },

  activityWrapper: {
    display: "flex",
    flexDirection: "column",
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
    padding: "20px",
  },
};

export default DevDashboard;
