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
import TaskListComponent from "./TaskOverviewList";

export default function PMDashboard() {
  const navigate = useNavigate();

  /* ---------------- STATE ---------------- */
  const [activeProjects, setActiveProjects] = useState([]);
  const [activeSprints, setActiveSprints] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [statsData, setStatsData] = useState([]);
  const [loading, setLoading] = useState(true);

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
        const mappedProjects = projectsData.slice(0, 6).map(p => ({
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
          color: getRandomColor(p.id)
        }));

        // Map Sprints
        const mappedSprints = sprintsData.slice(0, 6).map(s => ({
          id: s.id,
          title: s.name,
          progress: s.progress || 0,
          startDate: formatDate(s.start_date),
          endDate: formatDate(s.end_date),
          members: [],
          timeLeft: s.status || "Active",
          color: getRandomColor(s.id)
        }));

        setActiveProjects(mappedProjects);
        setActiveSprints(mappedSprints);

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
            title: "Open tasks",
            value: totalCount - completedCount,
            percent: totalCount > 0 ? `${Math.round(((totalCount - completedCount) / totalCount) * 100)}%` : "0%",
            trend: "down",
            color: "#3b82f6",
            graph: [20, 18, 15, 17, 14, totalCount - completedCount],
          },
          {
            title: "Overdue tasks",
            value: overdueCount,
            percent: totalCount > 0 ? `${Math.round((overdueCount / totalCount) * 100)}%` : "0%",
            trend: overdueCount > 5 ? "up" : "down",
            color: "#ef4444",
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
              <h3 style={styles.sectionTitle}>Weekly Task Performance</h3>
              <div style={{ flex: 1 }}>
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
                  <Card {...card} />
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
            <TaskListComponent tasks={allTasks} role="Project Manager" />
          </div>
          <div style={styles.sideItem}>
            <Upcoming tasks={allTasks} />
          </div>
          <div style={styles.sideItem}>
            <QAPending />
          </div>
        </aside>
      </div>
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
    gap: 24,
    alignItems: "flex-start",
  },
  left: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },
  right: {
    width: 320,
    display: "flex",
    flexDirection: "column",
    gap: 24,
    position: "sticky",
    top: 20,
    paddingRight: 4,
  },
  topRow: {
    display: "grid",
    gridTemplateColumns: "1.8fr 1.2fr",
    gap: 20,
    minHeight: 400,
  },
  graphWrapper: {
    background: "#fff",
    borderRadius: 16,
    border: "1px solid #f1f5f9",
    padding: 24,
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
  },
  recentWrapper: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
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
    fontSize: 18,
    fontWeight: 700,
    color: "#1e293b",
    margin: 0,
  },
  viewAll: {
    background: "transparent",
    border: "none",
    color: "#6366f1",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 20,
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
    background: "#fff",
    borderRadius: 12,
    border: "1px dashed #e2e8f0",
    color: "#94a3b8",
    gridColumn: "1 / -1",
  }
};
