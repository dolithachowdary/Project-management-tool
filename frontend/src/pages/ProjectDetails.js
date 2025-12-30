import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ProjectHeader from "../components/ProjectHeader";
import Modules from "../components/Modules";
import RecentActivity from "../components/RecentActivity";
import { getProjectById, getProjectSummary } from "../api/projects"; //

const ProjectDetails = ({ role = "Project Manager" }) => {
  const { id } = useParams(); // ✅ Catches the ID from URL
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ Safety check: Redirect if no ID
    if (!id) {
      console.warn("No Project ID found in URL");
      navigate("/projects");
      return;
    }
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log("Fetching details for Project ID:", id); // ✅ Debug log

      // Fetch Project Details and Summary in parallel
      const [pRes, sRes] = await Promise.all([
        getProjectById(id),
        getProjectSummary(id),
      ]);

      const projectData = pRes.data?.data || pRes.data;
      const summaryData = sRes.data?.data || sRes.data;

      if (!projectData) throw new Error("No data returned");

      setProject(projectData);
      setSummary(summaryData);
    } catch (err) {
      console.error("Error loading project details:", err);
      // Optional: alert("Project not found");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

  if (loading) {
    return (
      <div style={styles.pageContainer}>
        <Sidebar />
        <div style={styles.mainContent}>
          <Header role={role} />
          <div style={{ padding: 40 }}>Loading Project Data...</div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div style={styles.pageContainer}>
        <Sidebar />
        <div style={styles.mainContent}>
          <Header role={role} />
          <div style={{ padding: 40 }}>Project not found.</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      <Sidebar />
      <div style={styles.mainContent}>
        <Header role={role} />

        <div style={styles.pageInner}>
          <button onClick={() => navigate("/projects")} style={styles.backBtn}>
            ← Back to Projects
          </button>

          <ProjectHeader
            title={project.name}
            startDate={formatDate(project.start_date)}
            endDate={formatDate(project.end_date)}
            progress={project.status === "completed" ? 100 : 70}
            members={[]} 
            timeLeft={project.status}
            sprintSummary="Sprint 1"
            modulesSummary={summary?.modules ?? 0}
            tasksSummary={
              summary?.tasks
                ? `${summary.tasks.active} active · ${summary.tasks.total} total`
                : "—"
            }
          />

          <div style={styles.contentWrapper}>
            <Modules projectId={id} />
            <RecentActivity projectId={id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;

/* ---------------- STYLES (Unchanged) ---------------- */
const styles = {
  pageContainer: { display: "flex", height: "100vh", background: "#f9f9f9" },
  mainContent: { flex: 1, overflowY: "auto" },
  pageInner: { padding: "20px 28px", maxWidth: 1400 },
  backBtn: {
    background: "none",
    border: "none",
    color: "#c62828",
    cursor: "pointer",
    marginBottom: 16,
    fontSize: 14,
  },
  contentWrapper: {
    display: "grid",
    gridTemplateColumns: "3fr 1.2fr",
    gap: 24,
    marginTop: 24,
    alignItems: "start",
  },
  modulesSection: { width: "100%" },
  activitySection: { width: "100%", position: "sticky", top: 90 },
};