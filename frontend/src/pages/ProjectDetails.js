import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ProjectHeader from "../components/ProjectHeader";
import Modules from "../components/Modules";
import RecentActivity from "../components/RecentActivity";
import { getProjectById, getProjectSummary, getProjectMembers, getProjectHierarchy } from "../api/projects";
import Loader from "../components/Loader";
import { formatStatus } from "../utils/helpers";
import EditProjectModal from "../components/EditProjectModal";
import FlowGraph from "../components/FlowGraph";
import { AnimatePresence } from "framer-motion";

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("userData"));
  const role = userData?.role || "Project Manager";

  const [project, setProject] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showFlowGraph, setShowFlowGraph] = useState(false);
  const [hierarchyData, setHierarchyData] = useState(null);

  const handleShowFlow = async () => {
    try {
      if (!hierarchyData) {
        const res = await getProjectHierarchy(id);
        setHierarchyData(res.data?.data || res.data);
      }
      setShowFlowGraph(true);
    } catch (err) {
      console.error("Failed to load hierarchy:", err);
    }
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [pRes, sRes, mRes] = await Promise.all([
        getProjectById(id),
        getProjectSummary(id),
        getProjectMembers(id)
      ]);

      const projectData = pRes.data?.data || pRes.data;
      const summaryData = sRes.data?.data || sRes.data;
      const membersData = mRes.data?.data || mRes.data || [];

      setProject(projectData);
      setSummary(summaryData);
      setMembers(membersData);
    } catch (err) {
      console.error("Error loading project details:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) {
      navigate("/projects");
      return;
    }
    loadData();
  }, [id, loadData, navigate]);

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

  if (loading) return <Loader />;
  if (!project) return <div style={styles.errorContainer}>Project not found.</div>;

  // Summaries
  const totalTasks = summary?.tasks?.total || 0;
  const completedTasks = summary?.tasks?.completed || 0;
  const activeTasks = totalTasks - completedTasks;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div style={styles.pageContainer}>
      <Sidebar />
      <div style={styles.mainContent}>
        <Header role={role} />

        <div style={styles.pageInner}>
          <button onClick={() => navigate("/projects")} style={styles.backBtn}>
            <span style={styles.backArrow}>‹</span> Back to Projects
          </button>

          <ProjectHeader
            projectId={id}
            title={project.name}
            startDate={formatDate(project.start_date)}
            endDate={formatDate(project.end_date)}
            progress={progress}
            members={members}
            timeLeft={project.status === "active" ? "Active" : formatStatus(project.status)}
            currentSprintName={summary?.currentSprint?.name || "No active sprint"}
            sprintProgress={summary?.currentSprint?.progress || 0}
            modulesSummary={`${summary?.modules?.active || 0} active · ${summary?.modules?.total || 0} total`}
            tasksSummary={`${activeTasks} active · ${totalTasks} total`}
            color={project.color}
            hasDocument={!!project.document_name}
            onEdit={() => setIsEditModalOpen(true)}
            onShowFlow={handleShowFlow}
          />

          <div style={styles.contentLayout}>
            {/* LEFT COLUMN: MODULES & TASKS */}
            <div style={styles.leftCol}>
              <Modules projectId={id} projectColor={project.color} />
            </div>

            {/* RIGHT COLUMN: RECENT ACTIVITY */}
            <div style={styles.rightCol}>
              <RecentActivity projectId={id} />
            </div>
          </div>
        </div>
      </div>

      <EditProjectModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        project={project}
        onProjectUpdated={loadData}
        onProjectDeleted={() => navigate("/projects")}
      />

      <AnimatePresence>
        {showFlowGraph && (
          <FlowGraph
            type="project"
            data={hierarchyData}
            onClose={() => setShowFlowGraph(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const styles = {
  pageContainer: {
    display: "flex",
    height: "100vh",
    background: "#f9fafb", // Match Dashboard/Notes background
    overflow: "hidden",
  },
  mainContent: {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
  },
  pageInner: {
    padding: "0 32px 40px",
    maxWidth: 1440,
    margin: "0 auto",
    width: "100%",
  },
  backBtn: {
    background: "none",
    border: "none",
    color: "#c62828",
    cursor: "pointer",
    margin: "12px 0 20px",
    fontSize: 14,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: 4,
    padding: 0,
    transition: "transform 0.2s",
    "&:hover": {
      transform: "translateX(-4px)",
    }
  },
  backArrow: {
    fontSize: 18,
    lineHeight: 1,
  },
  contentLayout: {
    display: "grid",
    gridTemplateColumns: "1fr 340px",
    gap: 32,
    alignItems: "start",
  },
  leftCol: {
    display: "flex",
    flexDirection: "column",
    gap: 32,
  },
  rightCol: {
    position: "sticky",
    top: 24,
  },
  errorContainer: {
    padding: 60,
    textAlign: "center",
    color: "#64748b",
    fontSize: 16,
    fontWeight: 500,
  }
};

export default ProjectDetails;