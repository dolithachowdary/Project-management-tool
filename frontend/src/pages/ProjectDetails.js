import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ProjectHeader from "../components/ProjectHeader";

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
    padding: 20,
  },
  backBtn: {
    background: "none",
    border: "none",
    color: "#c62828",
    cursor: "pointer",
    marginBottom: 16,
  },
};
