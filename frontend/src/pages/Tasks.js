import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import TaskForm from "../components/TaskForm";
import TaskListView from "../components/TaskListView";
import TaskBoardView from "../components/TaskBoardView";
import Loader from "../components/Loader";
import toast from "react-hot-toast";
import { Search, Calendar, Plus } from "lucide-react";
import gridIcon from "../assets/icons/grid.svg";
import dashboardIcon from "../assets/icons/dashboard.svg";
import { getTasks, createTask, updateTask } from "../api/tasks";
import { getProjects } from "../api/projects";
import { getAssignableUsers } from "../api/users";
import { toApiStatus, formatStatus } from "../utils/helpers";

const role = localStorage.getItem("role") || "Project Manager";
const currentUser = localStorage.getItem("userName") || "A";
const currentUserId = localStorage.getItem("userId");

// Remove mock userData and moduleList


export default function Tasks() {
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedProject, setSelectedProject] = useState("All");
  const [selectedPerson, setSelectedPerson] = useState("All");
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [userData, setUserData] = useState({});

  // Data Fetching
  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [tasksRes, projectsRes, usersRes] = await Promise.all([
          getTasks(),
          getProjects(),
          getAssignableUsers().catch(() => ({ data: [] }))
        ]);

        const tasksData = tasksRes.data?.data || tasksRes.data || [];
        const projectsData = projectsRes.data?.data || projectsRes.data || [];
        const usersData = usersRes.data?.data || usersRes.data || [];

        setTasks(tasksData);
        setProjects(projectsData);

        // Map users by id
        const userMap = {};
        usersData.forEach(u => {
          userMap[u.id || u._id] = {
            name: u.full_name || u.name,
            role: u.role,
            color: u.color || "#C62828",
            avatar_url: u.avatar_url
          };
        });
        setUserData(userMap);
      } catch (err) {
        console.error("Failed to fetch data", err);
        toast.error("Failed to fetch data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const statuses = [
    { label: "All", value: "All" },
    { label: "To Do", value: "To Do" },
    { label: "In Progress", value: "In Progress" },
    { label: "Review", value: "Review" },
    { label: "Done", value: "Done" },
    { label: "Blocked", value: "Blocked" }
  ];

  const projectList = ["All", ...projects.map(p => p.name)];
  const peopleList = ["All", ...Array.from(new Set(tasks.map(t => t.assignee_name || t.assignedTo || "Unassigned")))];

  // Format date to DD-MM-YY
  const formatShortDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}-${month}-${year}`;
  };

  // Format date to full date for hover
  const formatFullDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Robust getter for project/module/sprint names/colors
  const getProjectName = (task) => task.project_name || task.projectName || projects.find(p => (p._id || p.id) === (task.project_id || task.project?.[0]?.id))?.name || "";
  const getModuleName = (task) => task.module_name || task.moduleName || task.module?.name || "";
  const getSprintName = (task) => task.sprint_name || task.sprintName || task.sprint?.name || "";
  const getProjectColor = (task) => task.project_color || projects.find(p => (p.id === (task.project_id || task.project?.[0]?.id)))?.color || "#4F7DFF";

  // Prepare tasks with names
  const tasksWithNames = tasks.map(t => ({
    ...t,
    taskName: t.title || t.taskName || "",
    projectName: getProjectName(t),
    moduleName: getModuleName(t),
    sprintName: getSprintName(t),
    project_color: getProjectColor(t)
  }));

  // Base filtered tasks (before status filter)
  const baseFilteredTasks = tasksWithNames.filter((t) => {
    const q = searchQuery.toLowerCase();
    const pName = t.projectName.toLowerCase();
    const mName = t.moduleName.toLowerCase();
    const sName = t.sprintName.toLowerCase();
    const tName = t.taskName.toLowerCase();
    const tCode = t.taskCode?.toLowerCase() || "";

    return (
      (!q ||
        tName.includes(q) ||
        pName.includes(q) ||
        mName.includes(q) ||
        sName.includes(q) ||
        tCode.includes(q)) &&
      (selectedProject === "All" || t.projectName === selectedProject) &&
      (selectedPerson === "All" || (t.assignee_name || t.assignedTo) === selectedPerson) &&
      (!selectedDate ||
        t.startDate === selectedDate ||
        t.start_date === selectedDate ||
        t.endDate === selectedDate ||
        t.end_date === selectedDate)
    );
  });

  // Final filtered tasks (including status filter)
  const filteredTasks = baseFilteredTasks.filter((t) =>
    selectedStatus === "All" || formatStatus(t.status) === selectedStatus
  );

  const getCount = (statusValue) => {
    if (statusValue === "All") return baseFilteredTasks.length;
    return baseFilteredTasks.filter((t) => formatStatus(t.status) === statusValue).length;
  };

  const handleSaveTask = async (taskData) => {
    try {
      // Fabricate status to API format
      const payload = { ...taskData, status: toApiStatus(taskData.status) };

      let res;
      if (editingTask) {
        // Update existing
        res = await updateTask(editingTask.id, payload);
        const updated = res.data?.data || res.data;
        setTasks(prev => prev.map(t => t.id === editingTask.id ? updated : t));
      } else {
        // Create new
        res = await createTask(payload);
        const created = res.data?.data || res.data;
        setTasks([created, ...tasks]);
      }
      setShowAddTask(false);
      setEditingTask(null);
    } catch (err) {
      console.error("Failed to save task", err);
      toast.error("Failed to save task");
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowAddTask(true);
  };

  const handleCancelSave = () => {
    setShowAddTask(false);
    setEditingTask(null);
  };

  const handleStatusChange = async (id, newStatus) => {
    // Find the task we're updating to send full data if needed by PUT
    const taskToUpdate = tasks.find(t => t.id === id);
    if (!taskToUpdate) return;

    // Optimistic Update
    const previousTasks = [...tasks];
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));

    try {
      // Send a SANITIZED payload. 
      // Do NOT spread taskToUpdate directly as it may contain nested objects (project, assignee)
      // that the backend PUT endpoint might choke on if it expects simple IDs.
      const payload = {
        status: toApiStatus(newStatus),
        title: taskToUpdate.title || taskToUpdate.taskName,
        // Only include dates if they are valid strings
        start_date: taskToUpdate.start_date || taskToUpdate.startDate || null,
        end_date: taskToUpdate.end_date || taskToUpdate.endDate || null,
        // Ensure IDs are sent, not objects
        project_id: taskToUpdate.project_id || (typeof taskToUpdate.project === 'object' ? taskToUpdate.project?.id : taskToUpdate.project),
        created_by: taskToUpdate.created_by || (typeof taskToUpdate.createdBy === 'object' ? taskToUpdate.createdBy?.id : taskToUpdate.createdBy),
        assignee_id: taskToUpdate.assignee_id || (typeof taskToUpdate.assignedTo === 'object' ? taskToUpdate.assignedTo?.id : taskToUpdate.assignedTo),
        priority: taskToUpdate.priority || "Medium", // Ensure priority is preserved
        description: taskToUpdate.description || ""
      };

      const res = await updateTask(id, payload);

      const updatedTask = res.data?.data || res.data;
      setTasks(prev => prev.map(t => (t.id === id || t._id === id) ? updatedTask : t));
    } catch (err) {
      console.error("Failed to update status", err);
      // Revert on failure
      setTasks(previousTasks);
      toast.error("Failed to update task status. Please try again.");
    }
  };



  const canEdit = (task) => {
    return role === "Project Manager" || role === "admin" || (task.created_by && task.created_by === currentUserId);
  };

  const styles = {
    pageContainer: {
      display: "flex",
      backgroundColor: "#FBFAFC",
      height: "100vh",
      overflow: "hidden"
    },
    mainContent: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      overflow: "hidden"
    },
    pageInner: {
      flex: 1,
      overflowY: "auto",
      padding: "20px 10px"
    },

    // Remove pageTitle since it's in Header

    searchFilterContainer: {
      display: "flex",
      flexDirection: "column",
      gap: 16,
      marginBottom: 24,
    },
    toolbarRow: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      flexWrap: "wrap",
    },
    searchBox: {
      position: "relative",
      flex: 1,
      Width: 100,
    },
    searchIcon: {
      position: "absolute",
      left: 12,
      top: "50%",
      transform: "translateY(-50%)",
      color: "#b91c1c",
    },
    searchInput: {
      width: "70%",
      padding: "10px 12px 10px 36px",
      borderRadius: 12,
      border: "1px solid #f1f5f9",
      fontSize: 14,
      outline: "none",
      backgroundColor: "#fff",
      color: "#1e293b",
      fontWeight: 500
    },
    toolbarControl: {
      display: "flex",
      alignItems: "center",
      background: "#fff",
      borderRadius: 12,
      border: "1px solid #f1f5f9",
      padding: "0 8px",
      height: 40,
      minWidth: 120,
    },
    dateInput: {
      border: "none",
      fontSize: 13,
      outline: "none",
      background: "transparent",
      color: "#64748b",
      fontWeight: 600,
      width: "100%",
    },
    selectInput: {
      border: "none",
      fontSize: 13,
      outline: "none",
      background: "transparent",
      color: "#64748b",
      fontWeight: 600,
      width: "100%",
      cursor: "pointer"
    },
    toggleWrapper: {
      flex: "0 0 auto",
      marginLeft: 0,
    },
    addTaskBtn: {
      background: "#b91c1c",
      color: "#fff",
      border: "none",
      padding: "0 20px",
      borderRadius: 12,
      cursor: "pointer",
      fontWeight: 700,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 14,
      height: 40,
      whiteSpace: "nowrap",
      transition: "all 0.2s ease",
      gap: 8,
      boxShadow: "0 4px 12px rgba(185,28,28,0.2)"
    },
    iconToggle: {
      display: "flex",
      background: "#f1f5f9",
      padding: 4,
      borderRadius: 12,
      gap: 4,
      height: 40,
      alignItems: "center"
    },
    iconButton: {
      width: 32,
      height: 32,
      borderRadius: 8,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      transition: "all 0.2s ease",
      color: "#64748b"
    },
    activeToggle: {
      background: "#fff",
      color: "#b91c1c",
      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    },
    toggleIcon: {
      width: 18,
      height: 18,
      transition: "filter 0.3s ease",
    },

    statusFilterContainer: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "0 8px",
      marginBottom: 24,
      overflowX: "auto"
    },
    statusChip: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      borderRadius: 12,
      background: "#f8fafc",
      color: "#64748b",
      border: "1px solid #f1f5f9",
      cursor: "pointer",
      fontSize: 13,
      fontWeight: 700,
      padding: "8px 16px",
      transition: "all 0.2s ease",
      whiteSpace: "nowrap",
    },
    activeChip: {
      background: "#fee2e2",
      color: "#b91c1c",
      borderColor: "#fecaca"
    },
    chipCount: {
      background: "#fff",
      color: "inherit",
      borderRadius: 8,
      padding: "2px 8px",
      fontSize: 11,
      fontWeight: 800,
      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    },
    clearDateBtn: {
      background: "#fff",
      border: "1px solid #E5E7EB",
      color: "#374151",
      fontSize: 13,
      padding: "8px 14px",
      borderRadius: 10,
      cursor: "pointer",
      transition: "all 0.25s ease",
      marginLeft: "auto",
      whiteSpace: "nowrap",
    },
  };

  return React.createElement("div", { style: styles.pageContainer },
    isLoading && React.createElement(Loader, null),
    React.createElement(Sidebar, null),
    React.createElement("div", { style: styles.mainContent },
      React.createElement(Header, { role: role }),
      React.createElement("div", { style: styles.pageInner },
        // Removed duplicate title

        // Top Toolbar
        React.createElement("div", { style: styles.searchFilterContainer },
          React.createElement("div", { style: styles.toolbarRow }, // First row: Search & Filters
            React.createElement("div", { style: styles.searchBox },
              React.createElement(Search, { style: styles.searchIcon, size: 16 }),
              React.createElement("input", {
                type: "text",
                style: styles.searchInput,
                placeholder: "Search tasks, module or project...",
                value: searchQuery,
                onChange: (e) => setSearchQuery(e.target.value)
              })
            ),

            React.createElement("div", { style: styles.toolbarControl },
              React.createElement(Calendar, { size: 14, color: "#b91c1c", style: { marginRight: 8 } }),
              React.createElement("input", {
                type: "date",
                style: styles.dateInput,
                value: selectedDate,
                onChange: (e) => setSelectedDate(e.target.value)
              })
            ),

            React.createElement("div", { style: styles.toolbarControl },
              React.createElement("select", {
                style: styles.selectInput,
                value: selectedProject,
                onChange: (e) => setSelectedProject(e.target.value)
              },
                projectList.map((p) =>
                  React.createElement("option", { key: p, value: p }, p === "All" ? "All Projects" : p)
                )
              )
            ),

            React.createElement("div", { style: styles.toolbarControl },
              React.createElement("select", {
                style: styles.selectInput,
                value: selectedPerson,
                onChange: (e) => setSelectedPerson(e.target.value)
              },
                peopleList.map((p) =>
                  React.createElement("option", { key: p, value: p }, p === "All" ? "All Members" : p)
                )
              )
            ),

            // ViewToggle & Add Task now on the same row as filters in the provided image (based on second image)
            // But actually the 2nd image shows Search, Date, Proj, Members, Toggle, Add Task in ONE row? 
            // Wait, looking closer at image 2:
            // Input ... Date ... All Projects ... All Members ... [Toggle] ... [Add Task]
            // And then a SECOND container below it with All, To Do, etc.
            // Okay, let me re-align to exactly ONE row for tools, and ONE row for status chips.

            React.createElement("div", { style: styles.iconToggle },
              React.createElement("div", {
                style: {
                  ...styles.iconButton,
                  ...(viewMode === "grid" ? styles.activeToggle : {})
                },
                onClick: () => setViewMode("grid")
              },
                React.createElement("img", {
                  src: gridIcon,
                  alt: "Grid",
                  style: {
                    ...styles.toggleIcon,
                    filter: viewMode === "grid"
                      ? "invert(20%) sepia(90%) saturate(5000%) hue-rotate(350deg)"
                      : "invert(40%) brightness(0.5)",
                  }
                })
              ),
              React.createElement("div", {
                style: {
                  ...styles.iconButton,
                  ...(viewMode === "board" ? styles.activeToggle : {})
                },
                onClick: () => setViewMode("board")
              },
                React.createElement("img", {
                  src: dashboardIcon,
                  alt: "Board",
                  style: {
                    ...styles.toggleIcon,
                    filter: viewMode === "board"
                      ? "invert(20%) sepia(90%) saturate(5000%) hue-rotate(350deg)"
                      : "invert(40%) brightness(0.5)",
                  }
                })
              )
            ),

            React.createElement("button", {
              style: styles.addTaskBtn,
              onClick: () => setShowAddTask(true)
            },
              React.createElement(Plus, { size: 18 }),
              "Add Task"
            )
          )
        ),

        viewMode === "grid" && React.createElement("div", { style: styles.statusFilterContainer },
          statuses.map((status) => {
            const isActive = selectedStatus === status.value;
            return React.createElement("button", {
              key: status.value,
              style: {
                ...styles.statusChip,
                ...(isActive ? styles.activeChip : {})
              },
              onClick: () => setSelectedStatus(status.value)
            },
              React.createElement("span", null, status.label),
              React.createElement("span", { style: styles.chipCount }, getCount(status.value))
            );
          }),
          selectedDate && React.createElement("button", {
            style: styles.clearDateBtn,
            onClick: () => setSelectedDate("")
          }, "Clear date")
        ),

        showAddTask && React.createElement(TaskForm, {
          onSave: handleSaveTask,
          onCancel: handleCancelSave,
          projects: projects,
          projectList: projectList,
          peopleList: peopleList,
          statusList: statuses.filter(s => s.value !== "All"),
          userData: userData,
          initialData: editingTask,
          currentUserId: currentUserId
        }),

        viewMode === "grid"
          ? React.createElement(TaskListView, {
            tasks: filteredTasks,
            onStatusChange: handleStatusChange,
            onEdit: handleEditTask,
            canEdit: canEdit,
            currentUser: currentUser,
            userData: userData,
            formatShortDate: formatShortDate,
            formatFullDate: formatFullDate
          })
          : React.createElement(TaskBoardView, {
            tasks: filteredTasks,
            onStatusChange: handleStatusChange,
            onEdit: handleEditTask,
            canEdit: canEdit,
            currentUser: currentUser,
            userData: userData,
            formatShortDate: formatShortDate,
            formatFullDate: formatFullDate
          })
      )
    )
  );
}