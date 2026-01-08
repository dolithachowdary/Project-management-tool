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
import AddSprint from "../components/AddSprint";
import TaskForm from "../components/TaskForm";
import FlowGraph from "../components/FlowGraph";
import { AnimatePresence } from "framer-motion";
import { getProjects } from "../api/projects";
import { createTask, updateTask } from "../api/tasks";
import toast from "react-hot-toast";

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
  const [isAddSprintModalOpen, setIsAddSprintModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [allProjects, setAllProjects] = useState([]);
  const [showFlowGraph, setShowFlowGraph] = useState(false);
  const [hierarchyData, setHierarchyData] = useState(null);
  // Add helper for module modal
  const [isAddModuleModalOpen, setIsAddModuleModalOpen] = useState(false);

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
      const [pRes, sRes, mRes, allPRes] = await Promise.all([
        getProjectById(id),
        getProjectSummary(id),
        getProjectMembers(id),
        getProjects()
      ]);

      setProject(pRes.data?.data || pRes.data);
      setSummary(sRes.data?.data || sRes.data);
      setMembers(mRes.data?.data || mRes.data || []);
      setAllProjects(allPRes.data?.data || allPRes.data || []);
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
  // Calculate sprint count from summary if available, otherwise just rely on currentSprint
  const sprintCount = summary?.sprints?.total || 0;

  const handleAddTask = async (taskData) => {
    try {
      await createTask(taskData);
      toast.success("Task created successfully!");
      setIsAddTaskModalOpen(false);
      loadData(); // Refresh summary/modules
    } catch (err) {
      console.error("Failed to create task:", err);
      toast.error("Failed to create task");
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsEditTaskModalOpen(true);
  };

  const handleUpdateTask = async (taskData) => {
    try {
      await updateTask(editingTask.id || editingTask._id, taskData);
      toast.success("Task updated successfully!");
      setIsEditTaskModalOpen(false);
      setEditingTask(null);
      loadData();
    } catch (err) {
      console.error("Failed to update task:", err);
      toast.error("Failed to update task");
    }
  };

  return (
    <div style={styles.pageContainer}>
      <Sidebar />
      <div style={styles.mainContent} className="hide-scrollbar">
        <Header role={role} />

        <div style={styles.pageInner} className="hide-scrollbar">
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
            sprintCount={sprintCount}
            modulesSummary={`${summary?.modules?.active || 0} active · ${summary?.modules?.total || 0} total`}
            tasksSummary={`${activeTasks} active · ${totalTasks} total`}
            color={project.color}
            hasDocument={!!project.document_name}
            onEdit={() => setIsEditModalOpen(true)}
            onShowFlow={handleShowFlow}
            onAddSprint={() => setIsAddSprintModalOpen(true)}
            onAddModule={() => setIsAddModuleModalOpen(true)}
            onAddTask={() => setIsAddTaskModalOpen(true)}
          />

          <div style={styles.contentLayout}>
            {/* LEFT COLUMN: MODULES & TASKS */}
            <div style={styles.leftCol}>
              <Modules
                projectId={id}
                projectColor={project.color}
                onTaskClick={handleEditTask}
                isAddModalOpen={isAddModuleModalOpen}
                setIsAddModalOpen={setIsAddModuleModalOpen}
              />
            </div>

            {/* RIGHT COLUMN: RECENT ACTIVITY */}
            <div style={styles.rightCol}>
              <div style={styles.activityCard}>
                <RecentActivity projectId={id} />
              </div>
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

      <AddSprint
        isOpen={isAddSprintModalOpen}
        onClose={() => setIsAddSprintModalOpen(false)}
        onSprintAdded={loadData}
        initialProjectId={id}
      />

      {isAddTaskModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent} className="hide-scrollbar">
            <TaskForm
              onSave={handleAddTask}
              onCancel={() => setIsAddTaskModalOpen(false)}
              projects={allProjects}
              currentUserId={userData?.id}
              initialProjectId={id}
            />
          </div>
        </div>
      )}

      {isEditTaskModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent} className="hide-scrollbar">
            <TaskForm
              onSave={handleUpdateTask}
              onCancel={() => {
                setIsEditTaskModalOpen(false);
                setEditingTask(null);
              }}
              projects={allProjects}
              currentUserId={userData?.id}
              initialData={editingTask}
              initialProjectId={id}
            />
          </div>
        </div>
      )}

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
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    overflow: "hidden",
  },
  pageInner: {
    flex: 1,
    overflowY: "auto",
    padding: "0 24px 40px",
    maxWidth: "100%",
    margin: "0 auto",
    width: "100%",
    boxSizing: "border-box",
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
    display: "flex",
    flexWrap: "wrap",
    gap: 32,
    alignItems: "start",
  },
  leftCol: {
    flex: "1 1 400px",
    display: "flex",
    flexDirection: "column",
    gap: 32,
    minWidth: 0, // Prevent flex items from overflowing
  },
  rightCol: {
    flex: "0 0 280px",
    position: "sticky",
    top: 24,
  },
  activityCard: {
    height: "calc(100vh - 420px)",
    minHeight: 450,
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
  errorContainer: {
    padding: 60,
    textAlign: "center",
    color: "#64748b",
    fontSize: 16,
    fontWeight: 500,
  }
};

export default ProjectDetails;