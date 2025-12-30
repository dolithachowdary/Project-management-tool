import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ProjectHeader from "../components/ProjectHeader";
import Modules from "../components/Modules";
import RecentActivity from "../components/RecentActivity";
import TaskListView from "../components/TaskListView";
import { getProjectById, getProjectSummary, getProjectMembers } from "../api/projects";
import { getTasks } from "../api/tasks";
import { getAssignableUsers } from "../api/users";

const ProjectDetails = ({ role = "Project Manager" }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [userData, setUserData] = useState({});

  useEffect(() => {
    if (!id) {
      navigate("/projects");
      return;
    }
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pRes, sRes, mRes, tRes, uRes] = await Promise.all([
        getProjectById(id),
        getProjectSummary(id),
        getProjectMembers(id),
        getTasks(id),
        getAssignableUsers().catch(() => ({ data: [] }))
      ]);

      const projectData = pRes.data?.data || pRes.data;
      const summaryData = sRes.data?.data || sRes.data;
      const membersData = mRes.data?.data || mRes.data || [];
      const tasksData = tRes.data?.data || tRes.data || [];
      const usersData = uRes.data?.data || uRes.data || [];

      setProject(projectData);
      setSummary(summaryData);
      setMembers(membersData);
      setTasks(tasksData);

      const userMap = {};
      usersData.forEach(u => {
        userMap[u.id || u._id] = {
          name: u.full_name || u.name,
          role: u.role,
          color: u.color,
          avatar_url: u.avatar_url
        };
      });
      setUserData(userMap);
    } catch (err) {
      console.error("Error loading project details:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading project details...</div>;
  if (!project) return <div style={{ padding: 40, textAlign: "center" }}>Project not found.</div>;

  // Robust Summary Counts
  const totalTasks = summary?.tasks?.total || summary?.total_tasks || summary?.tasks_count || tasks.length || 0;
  const completedTasks = summary?.tasks?.completed || summary?.completed_tasks || tasks.filter(t => t.status === "Done" || t.status === "done").length || 0;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

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
            startDate={formatDate(project.start_date || project.startDate)}
            endDate={formatDate(project.end_date || project.endDate)}
            progress={progress}
            members={members}
            timeLeft={project.status || "Active"}
            sprintSummary={summary?.currentSprint ? `${formatDate(summary.currentSprint.start_date)} - ${formatDate(summary.currentSprint.end_date)}` : "No active sprint"}
            currentSprintName={summary?.currentSprint?.name || "No active sprint"}
            sprintProgress={summary?.currentSprint?.progress || 0}
            modulesSummary={summary?.modules || 0}
            tasksSummary={`${completedTasks} completed · ${totalTasks} total`}
          />

          <div style={styles.contentWrapper}>
            <div style={styles.leftCol}>
              <div style={styles.sectionHeader}>
                <h3 style={styles.sectionTitle}>Project Tasks</h3>
                <span style={styles.badge}>{tasks.length}</span>
              </div>
              <TaskListView
                tasks={tasks}
                userData={userData}
                onStatusChange={() => { }} // Read-only or implement later
                onEdit={() => navigate("/tasks")} // Redirect to main tasks for now
                canEdit={() => false}
                formatShortDate={(d) => d ? new Date(d).toLocaleDateString() : "-"}
                formatFullDate={(d) => d ? new Date(d).toLocaleString() : ""}
              />

              <div style={{ marginTop: 24 }}>
                <Modules projectId={id} />
              </div>
            </div>

            <div style={styles.rightCol}>
              <RecentActivity projectId={id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  pageContainer: { display: "flex", height: "100vh", background: "#f8fafc" },
  mainContent: { flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" },
  pageInner: { padding: "24px", maxWidth: "1600px", margin: "0 auto", width: "100%" },
  backBtn: {
    background: "none",
    border: "none",
    color: "#6366f1",
    cursor: "pointer",
    marginBottom: 16,
    fontSize: 14,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: "4px"
  },
  contentWrapper: {
    display: "grid",
    gridTemplateColumns: "1fr 350px",
    gap: 24,
    marginTop: 24
  },
  leftCol: {
    display: "flex",
    flexDirection: "column",
    gap: 24
  },
  rightCol: {
    display: "flex",
    flexDirection: "column",
    gap: 24
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 8
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "#1e293b",
    margin: 0
  },
  badge: {
    background: "#e2e8f0",
    color: "#475569",
    padding: "2px 8px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: 600
  }
};

export default ProjectDetails;