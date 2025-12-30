import React from "react";
import { useNavigate } from "react-router-dom";
import { getProjects } from "../api/projects";
import { getSprints } from "../api/sprints";
import Loader from "./Loader";

import Stats from "./Stats";
import Card from "./Card";
import MiniCalendar from "./Mini-Calendar";
import Upcoming from "./Upcoming";
import RecentActivity from "./RecentActivity";
import QAPending from "./QAPending";
import WeeklyTaskGraph from "./WeeklyTaskGraph";

export default function PMDashboard() {
  const navigate = useNavigate();

  /* ---------------- STATE ---------------- */
  const [activeProjects, setActiveProjects] = React.useState([]);
  const [activeSprints, setActiveSprints] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, sprintsRes] = await Promise.all([
          getProjects(), // Assuming this fetches all projects
          getSprints()   // Assuming this fetches all sprints
        ]);

        const projectsData = projectsRes.data?.data || projectsRes.data || [];
        const sprintsData = sprintsRes.data?.data || sprintsRes.data || [];

        // Filter for active projects if needed, or take top 3 latest
        const mappedProjects = projectsData.slice(0, 3).map(p => ({
          id: p.id || p._id,
          title: p.name,
          progress: p.progress || (() => {
            const total = p.totalTasks || p.total_tasks || p.tasks_count || p.summary?.total_tasks || p.summary?.tasks?.total || 0;
            const completed = p.completedTasks || p.completed_tasks || p.summary?.completed_tasks || p.summary?.tasks?.completed || 0;
            return total > 0 ? Math.round((completed / total) * 100) : 0;
          })(),
          startDate: formatDate(p.start_date || p.startDate),
          endDate: formatDate(p.end_date || p.endDate),
          members: (p.members || []).map(m => ({
            id: m.user_id || m,
            name: m.name || "Member",
            color: m.color || "#e0e7ff"
          })),
          availableMembers: [], // Not critical for card view
          timeLeft: p.status || "Active",
          color: getRandomColor(p.id)
        }));

        const mappedSprints = sprintsData.slice(0, 3).map(s => ({
          id: s.id,
          title: s.name,
          progress: s.progress || (() => {
            const total = s.totalTasks || s.total_tasks || s.tasks_count || s.summary?.total_tasks || s.summary?.tasks?.total || 0;
            const completed = s.completedTasks || s.completed_tasks || s.summary?.completed_tasks || s.summary?.tasks?.completed || 0;
            return total > 0 ? Math.round((completed / total) * 100) : 0;
          })(),
          startDate: formatDate(s.start_date),
          endDate: formatDate(s.end_date),
          members: [],
          availableMembers: [],
          timeLeft: s.status || "Active",
          color: getRandomColor(s.id)
        }));

        setActiveProjects(mappedProjects);
        setActiveSprints(mappedSprints);
      } catch (err) {
        console.error("Dashboard fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDate = (d) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  }

  const getRandomColor = (id) => {
    const colors = ["#d47b4a", "#cddc39", "#1e88e5", "#e91e63", "#9c27b0"];
    return colors[(typeof id === 'number' ? id : 0) % colors.length] || colors[0];
  }

  if (loading) return <Loader />;

  return (
    <div style={styles.page}>
      <div style={styles.mainGrid}>

        {/* LEFT */}
        <div style={styles.left}>
          <Stats />

          <div style={styles.graphRow}>
            <div style={styles.graphWrapper}>
              <h3 style={styles.sectionTitle}>Weekly task report</h3>

              <div style={{ flex: 1, display: "flex" }}>
                <WeeklyTaskGraph />
              </div>
            </div>

            <div style={styles.recentWrapper}>
              <RecentActivity />
            </div>
          </div>
          <h3 style={styles.sectionTitle}>Active Projects</h3>
          <div style={styles.cardGrid}>
            {activeProjects.map(card => (
              <div
                key={card.id}
                style={styles.cardWrapper}
                onClick={() => navigate(`/projects/${card.id}`)}
              >
                <Card {...card} />
              </div>
            ))}
            {activeProjects.length === 0 && <p style={{ color: '#999' }}>No active projects found.</p>}
          </div>

          <h3 style={styles.sectionTitle}>Active Sprints</h3>
          <div style={styles.cardGrid}>
            {activeSprints.map(card => (
              <div
                key={card.id}
                style={styles.cardWrapper}
                onClick={() => navigate(`/sprints/${card.id}`)}
              >
                <Card {...card} />
              </div>
            ))}
            {activeSprints.length === 0 && <p style={{ color: '#999' }}>No active sprints found.</p>}
          </div>
        </div>

        {/* RIGHT */}
        <aside style={styles.right}>
          <div style={styles.sideCard}><MiniCalendar /></div>
          <div style={styles.sideCard}><Upcoming /></div>
          <div style={styles.sideCard}><QAPending /></div>
        </aside>
      </div>
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const styles = {
  page: {
    background: "#fafafa",
  },

  mainGrid: {
    display: "flex",
    gap: 20,
  },

  left: {
    flex: 1,
  },

  right: {
    width: 320,
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },

  graphRow: {
    display: "grid",
    gridTemplateColumns: "2.2fr 1.3fr",   // 🔥 zoom-safe
    gap: 15,
    marginBottom: 18,
  },

  graphWrapper: {
    background: "#fff",
    borderRadius: 12,
    border: "1px solid #e5e5e5",
    padding: 24,
    height: 360,                         // 🔥 locks layout
    display: "flex",
    flexDirection: "column",
  },

  recentWrapper: {
    background: "#fff",
    borderRadius: 12,
    border: "1px solid #e5e5e5",
    padding: 16,
    flex: 1,
    display: "flex",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 12,
  },

  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 20,
    marginBottom: 24,
  },

  cardWrapper: {
    cursor: "pointer",
  },

  sideCard: {
    background: "#fff",
    borderRadius: 12,
    border: "1px solid #e5e5e5",
    padding: 16,
  },
};
