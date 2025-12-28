import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ProjectHeader from "../components/ProjectHeader";
import Modules from "../components/Modules";
import { getProjectById } from "../api/projects";

export default function ProjectDetails() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);

  useEffect(() => {
    getProjectById(projectId).then((r) => setProject(r.data));
  }, [projectId]);

  if (!project) return null;

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Header />

        <div style={{ padding: 24 }}>
          <ProjectHeader
            title={project.name}
            startDate={project.start_date}
            endDate={project.end_date}
            progress={0}
            members={[]}
            timeLeft={project.status}
          />

          <Modules projectId={projectId} />
        </div>
      </div>
    </div>
  );
}


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
