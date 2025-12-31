import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Card from "../components/Card";
import { useNavigate } from "react-router-dom";
import AddSprint from "../components/AddSprint";
import { getSprints } from "../api/sprints";
import Loader from "../components/Loader";

const Sprints = () => {
  const navigate = useNavigate();
  const [openAddSprint, setOpenAddSprint] = useState(false);
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const role = localStorage.getItem("role") || "Project Manager";

  useEffect(() => {
    loadSprints();
  }, []);

  const loadSprints = async () => {
    try {
      setLoading(true);
      const res = await getSprints();
      const data = res.data?.data || res.data || [];
      setSprints(data);
    } catch (err) {
      console.error("Failed to load sprints:", err);
    } finally {
      setLoading(false);
    }
  };

  // Progress calculation logic
  const processSprint = (s) => {
    const total = s.totalTasks || s.total_tasks || s.tasks_count || s.summary?.total_tasks || s.summary?.tasks?.total || 0;
    const completed = s.completedTasks || s.completed_tasks || s.summary?.completed_tasks || s.summary?.tasks?.completed || 0;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Status logic
    const isCompleted = s.status === "completed" || progress === 100;

    // Time left logic (simplified)
    const today = new Date();
    const end = new Date(s.end_date);
    const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    const timeLeft = isCompleted ? "Completed" : (diff > 0 ? `${diff} Days Left` : "Overdue");

    return {
      ...s,
      title: `${s.project_name || s.project?.name || "Project"} – ${s.name}`,
      progress,
      startDate: new Date(s.start_date).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      endDate: new Date(s.end_date).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      timeLeft,
      color: isCompleted ? "#2e7d32" : (s.project_color || s.color || "#1e88e5"),
      members: s.members || [], // Assuming backend returns members
    };
  };

  const processedSprints = sprints.map(processSprint);
  const activeSprints = processedSprints.filter(s => s.status !== "completed" && s.progress < 100);
  const completedSprints = processedSprints.filter(s => s.status === "completed" || s.progress === 100);

  return (
    <div style={styles.pageContainer}>
      <Sidebar />

      <div style={styles.mainContent}>
        <Header role={role} />

        <div style={styles.pageInner}>
          {loading ? (
            <Loader />
          ) : (
            <>
              {/* ACTIVE SPRINTS */}
              <section style={styles.section}>
                <h3 style={styles.sectionTitle}>Active Sprints</h3>
                <div style={styles.cardGrid}>
                  {activeSprints.length > 0 ? (
                    activeSprints.map((sprint) => (
                      <div
                        key={sprint.id || sprint._id}
                        style={styles.cardWrapper}
                        onClick={() => navigate(`/sprints/${sprint.id || sprint._id}`)}
                      >
                        <Card {...sprint} />
                      </div>
                    ))
                  ) : (
                    <div style={styles.noData}>No active sprints found</div>
                  )}
                </div>
              </section>

              {/* COMPLETED SPRINTS */}
              <section style={styles.section}>
                <h3 style={styles.sectionTitle}>Completed Sprints</h3>
                <div style={styles.cardGrid}>
                  {completedSprints.length > 0 ? (
                    completedSprints.map((sprint) => (
                      <div
                        key={sprint.id || sprint._id}
                        style={styles.cardWrapper}
                        onClick={() => navigate(`/sprints/${sprint.id || sprint._id}`)}
                      >
                        <Card {...sprint} />
                      </div>
                    ))
                  ) : (
                    <div style={styles.noData}>No completed sprints found</div>
                  )}
                </div>
              </section>
            </>
          )}
        </div>

        {/* ADD SPRINT BUTTON */}
        {["Project Manager", "admin"].includes(role) && (
          <button
            style={styles.addSprintBtn}
            onClick={() => setOpenAddSprint(true)}
          >
            + Add Sprint
          </button>
        )}

        {/* ADD SPRINT MODAL */}
        <AddSprint
          isOpen={openAddSprint}
          onClose={() => setOpenAddSprint(false)}
          onSprintAdded={loadSprints}
        />
      </div>
    </div>
  );
};

const styles = {
  pageContainer: {
    display: "flex",
    height: "100vh",
    background: "#f9f9f9",
  },
  mainContent: {
    flex: 1,
    overflowY: "auto",
  },
  pageInner: {
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#1e293b",
    marginBottom: "20px",
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "24px",
  },
  cardWrapper: {
    cursor: "pointer",
    transition: "transform 0.2s ease",
    ":hover": {
      transform: "translateY(-4px)"
    }
  },
  addSprintBtn: {
    position: "fixed",
    bottom: 32,
    right: 32,
    backgroundColor: "#c62828",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    padding: "14px 24px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    zIndex: 999,
    boxShadow: "0 10px 15px -3px rgba(198, 40, 40, 0.3)",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  noData: {
    padding: "40px",
    textAlign: "center",
    color: "#94a3b8",
    background: "#fff",
    borderRadius: "16px",
    border: "1px dashed #e2e8f0",
    gridColumn: "1 / -1",
    fontSize: "15px",
  }
};

export default Sprints;

