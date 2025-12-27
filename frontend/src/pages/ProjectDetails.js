import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ProjectHeader from "../components/ProjectHeader";
import Modules from "../components/Modules";
import RecentActivity from "../components/RecentActivity";

/* ================= MOCK DATA ================= */

const allMembers = [
  { name: "Deepak Chandra", color: "#f6c1cc" },
  { name: "Harsha Anand", color: "#dfe6d8" },
];

const projectDetails = {
  1: {
    title: "TourO Web Development",
    progress: 70,
    startDate: "January 10, 2024",
    endDate: "July 30, 2024",
    timeLeft: "2 Days Left",
    members: allMembers,
    modulesSummary: "4 active · 5 to do",
    tasksSummary: "4 active · 11 total",
  },
};

/* ================= COMPONENT ================= */

const ProjectDetails = ({ role = "Project Manager" }) => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const project = projectDetails[projectId];
  if (!project) return <div>Project not found</div>;

  return (
    <div style={styles.pageContainer}>
      <Sidebar />

      <div style={styles.mainContent}>
        <Header role={role} />

        <div style={styles.pageInner}>
          <button onClick={() => navigate("/projects")} style={styles.backBtn}>
            ← Back to Projects
          </button>

          {/* TOP OVERVIEW */}
          <ProjectHeader {...project} />

          {/* MODULES + ACTIVITY GRID */}
          <div style={styles.contentWrapper}>
            {/* LEFT : MODULES */}
            <div style={styles.modulesSection}>
              <Modules />
            </div>

            {/* RIGHT : RECENT ACTIVITY */}
            <div style={styles.activitySection}>
              <RecentActivity />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;

/* ================= STYLES ================= */

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
    padding: "20px 28px",
    maxWidth: "1400px",
  },

  backBtn: {
    background: "none",
    border: "none",
    color: "#c62828",
    cursor: "pointer",
    marginBottom: 16,
    fontSize: 14,
  },

  /* 🔥 THIS FIXES SINGLE COLUMN ISSUE */
  contentWrapper: {
    display: "grid",
    gridTemplateColumns: "3fr 1.2fr", // left wide, right narrow
    gap: 24,
    marginTop: 24,
    alignItems: "start",
  },

  modulesSection: {
    width: "100%",
  },

  activitySection: {
    width: "100%",
    position: "sticky",
    top: 90,
  },
};
