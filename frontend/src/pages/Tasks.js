import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import TaskForm from "../components/TaskForm";
import TaskListView from "../components/TaskListView";
import TaskBoardView from "../components/TaskBoardView";
import { FaPlus, FaSearch } from "react-icons/fa";
import gridIcon from "../assets/icons/grid.svg";
import dashboardIcon from "../assets/icons/dashboard.svg";

const RED = "#C62828";

const role = localStorage.getItem("role") || "PROJECT_MANAGER";
const currentUser = localStorage.getItem("userName") || "A";

// Mock user data with roles
const userData = {
  "A": { name: "Alice", role: "Project Manager", color: "#E3F2FD" },
  "B": { name: "Bob", role: "Developer", color: "#FFF8E1" },
  "C": { name: "Charlie", role: "Designer", color: "#E8EAF6" },
  "D": { name: "David", role: "QA", color: "#E8F5E9" },
  "E": { name: "Eve", role: "Developer", color: "#FCE4EC" },
  "PM John": { name: "John", role: "Project Manager", color: "#FFE5E5" },
  "PM Alice": { name: "Alice", role: "Project Manager", color: "#E3F2FD" },
  "Current User": { name: "You", role: role, color: "#F3F4F6" }
};

const moduleList = ["UI Module", "Backend Module", "Security Module", "Database Module", "API Module", "Mobile Module", "Web Module"];

export default function Tasks() {
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedProject, setSelectedProject] = useState("All");
  const [selectedPerson, setSelectedPerson] = useState("All");
  const [showAddTask, setShowAddTask] = useState(false);

  const [tasks, setTasks] = useState([
    {
      id: "1",
      taskCode: "TASK-001",
      taskName: "Design Dashboard Layout",
      moduleName: "UI Module",
      projectName: "Analytics Dashboard",
      assignedTo: "A",
      collaborators: ["B", "C", "D"],
      createdBy: "PM John",
      status: "Done",
      startDate: "2025-11-10",
      endDate: "2025-11-14",
      priority: "High"
    },
    {
      id: "2",
      taskCode: "TASK-002",
      taskName: "API Integration",
      moduleName: "Backend Module",
      projectName: "Automation Suite",
      assignedTo: "B",
      collaborators: ["C"],
      createdBy: "PM John",
      status: "Blocked",
      startDate: "2025-11-08",
      endDate: "2025-11-12",
      priority: "Medium"
    },
    {
      id: "3",
      taskCode: "TASK-003",
      taskName: "User Authentication Setup",
      moduleName: "Security Module",
      projectName: "Enterprise Portal",
      assignedTo: "A",
      collaborators: ["D"],
      createdBy: "PM Alice",
      status: "In Progress",
      startDate: "2025-11-05",
      endDate: "2025-11-10",
      priority: "High"
    },
    {
      id: "4",
      taskCode: "TASK-004",
      taskName: "Database Optimization",
      moduleName: "Backend Module",
      projectName: "Analytics Dashboard",
      assignedTo: "C",
      collaborators: [],
      createdBy: "PM John",
      status: "To Do",
      startDate: "2025-11-12",
      endDate: "2025-11-20",
      priority: "Low"
    },
  ]);

  const statuses = ["All", "To Do", "In Progress", "Review", "Done", "Blocked"];
  const projectList = ["All", "Analytics Dashboard", "Automation Suite", "Enterprise Portal"];
  const peopleList = ["All", "A", "B", "C", "D"];

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

  const filteredTasks = tasks.filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      (!q ||
        t.taskName.toLowerCase().includes(q) ||
        t.projectName.toLowerCase().includes(q) ||
        t.moduleName.toLowerCase().includes(q) ||
        t.taskCode.toLowerCase().includes(q)) &&
      (selectedStatus === "All" || t.status === selectedStatus) &&
      (selectedProject === "All" || t.projectName === selectedProject) &&
      (selectedPerson === "All" || t.assignedTo === selectedPerson) &&
      (!selectedDate ||
        t.startDate === selectedDate ||
        t.endDate === selectedDate)
    );
  });

  const handleSaveTask = (newTask) => {
    const task = {
      id: Date.now().toString(),
      taskCode: `TASK-${String(tasks.length + 1).padStart(3, '0')}`,
      ...newTask,
      collaborators: [],
      createdBy: "Current User",
    };
    setTasks([task, ...tasks]);
    setShowAddTask(false);
  };

  const handleStatusChange = (id, newStatus) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));
  };

  const getCount = (status) => {
    if (status === "All") return tasks.length;
    return tasks.filter((t) => t.status === status).length;
  };

  const canEdit = (task) => {
    return role === "ADMIN" ||
           role === "PROJECT_MANAGER" ||
           (role === "DEVELOPER" && task.assignedTo === currentUser);
  };

  const styles = {
    pageContainer: { display: "flex", backgroundColor: "#FBFAFC", minHeight: "100vh" },
    mainContent: { flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" },
    pageInner: { padding: "24px" },
    
    // Remove pageTitle since it's in Header

    searchFilterContainer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      background: "#fff",
      borderRadius: 12,
      boxShadow: "0 4px 14px rgba(15,23,42,0.05)",
      padding: "16px 20px",
      marginBottom: 14,
      gap: 16,
      flexWrap: "nowrap",
      overflowX: "auto",
    },
    searchBox: { 
      position: "relative", 
      flex: "0 0 300px",
      minWidth: 280,
    },
    searchIcon: { 
      position: "absolute", 
      left: 14, 
      top: "50%", 
      transform: "translateY(-50%)", 
      color: "#B91C1C",
      fontSize: 14,
    },
    searchInput: {
      width: "100%",
      padding: "12px 16px 12px 42px",
      borderRadius: 10,
      border: "1px solid #E6E9EE",
      fontSize: 14,
      outline: "none",
      backgroundColor: "#fff",
    },
    toolbarControl: { 
      flex: "0 0 auto",
      minWidth: 140,
    },
    dateInput: {
      width: "100%",
      padding: "12px 14px",
      borderRadius: 10,
      border: "1px solid #E6E9EE",
      fontSize: 14,
      outline: "none",
      backgroundColor: "#fff",
    },
    selectInput: {
      width: "100%",
      padding: "12px 14px",
      borderRadius: 10,
      border: "1px solid #E6E9EE",
      fontSize: 14,
      outline: "none",
      background: "#fff",
    },
    toggleWrapper: { 
      flex: "0 0 auto",
      marginLeft: 0,
    },
    iconToggle: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderRadius: 999,
      background: "#F9FAFB",
      border: "1px solid #E5E7EB",
      padding: "4px 6px",
      width: 80,
      height: 42,
      overflow: "hidden",
      boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
    },
    toggleHighlight: {
      position: "absolute",
      top: 3,
      left: 3,
      width: "calc(50% - 6px)",
      height: "calc(100% - 6px)",
      borderRadius: "50%",
      background: "#FEE8E8",
      boxShadow: "0 4px 10px rgba(198,40,40,0.12)",
      transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      zIndex: 1,
    },
    iconButton: {
      width: 34,
      height: 34,
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      transition: "all 0.25s ease",
      zIndex: 2,
      position: "relative",
    },
    toggleIcon: {
      width: 18,
      height: 18,
      transition: "filter 0.3s ease",
    },
    addTaskBtn: {
      background: RED,
      color: "#fff",
      border: "none",
      padding: "12px 20px",
      borderRadius: 10,
      cursor: "pointer",
      fontWeight: 700,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 6px 16px rgba(198,40,40,0.18)",
      fontSize: 14,
      whiteSpace: "nowrap",
      minWidth: 120,
    },

    statusFilterContainer: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      flexWrap: "wrap",
      background: "#fff",
      borderRadius: 12,
      boxShadow: "0 4px 14px rgba(15,23,42,0.05)",
      padding: "12px 16px",
      marginBottom: 18,
    },
    statusChip: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      borderRadius: 999,
      background: "#F9FAFB",
      color: "#374151",
      border: "none",
      cursor: "pointer",
      fontSize: 13,
      fontWeight: 600,
      padding: "8px 16px",
      transition: "all 0.25s ease",
      boxShadow: "none",
      whiteSpace: "nowrap",
    },
    activeChip: {
      background: "#FFE5E5",
      color: "#C62828",
      transform: "translateY(-2px)",
      boxShadow: "0 4px 10px rgba(198,40,40,0.10)",
    },
    chipCount: {
      background: "#fff",
      color: "#C62828",
      borderRadius: 999,
      minWidth: 20,
      height: 20,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 12,
      fontWeight: 700,
      padding: "2px 6px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
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
    React.createElement(Sidebar, null),
    React.createElement("div", { style: styles.mainContent },
      React.createElement(Header, { role: role }),
      React.createElement("div", { style: styles.pageInner },
        // Removed duplicate title

        // Top Toolbar
        React.createElement("div", { style: styles.searchFilterContainer },
          React.createElement("div", { style: styles.searchBox },
            React.createElement(FaSearch, { style: styles.searchIcon }),
            React.createElement("input", {
              type: "text",
              style: styles.searchInput,
              placeholder: "Search tasks, module or project...",
              value: searchQuery,
              onChange: (e) => setSearchQuery(e.target.value)
            })
          ),

          React.createElement("div", { style: styles.toolbarControl },
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
                React.createElement("option", { key: p, value: p }, p)
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
                React.createElement("option", { key: p, value: p }, p)
              )
            )
          ),

          React.createElement("div", { style: styles.toggleWrapper },
            React.createElement("div", { style: styles.iconToggle },
              React.createElement("div", {
                style: {
                  ...styles.toggleHighlight,
                  transform: viewMode === "grid" ? "translateX(0%)" : "translateX(100%)",
                }
              }),
              React.createElement("div", {
                style: styles.iconButton,
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
                style: styles.iconButton,
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
            )
          ),

          React.createElement("div", { style: styles.toolbarControl },
            React.createElement("button", {
              style: styles.addTaskBtn,
              onClick: () => setShowAddTask(true)
            },
              React.createElement(FaPlus, { style: { marginRight: 8 } }),
              "Add Task"
            )
          )
        ),

        viewMode === "grid" && React.createElement("div", { style: styles.statusFilterContainer },
          statuses.map((status) => {
            const isActive = selectedStatus === status;
            return React.createElement("button", {
              key: status,
              style: {
                ...styles.statusChip,
                ...(isActive ? styles.activeChip : {})
              },
              onClick: () => setSelectedStatus(status)
            },
              React.createElement("span", null, status),
              React.createElement("span", { style: styles.chipCount }, getCount(status))
            );
          }),
          selectedDate && React.createElement("button", {
            style: styles.clearDateBtn,
            onClick: () => setSelectedDate("")
          }, "Clear date")
        ),

        showAddTask && React.createElement(TaskForm, {
          onSave: handleSaveTask,
          onCancel: () => setShowAddTask(false),
          projectList: projectList.filter(p => p !== "All"),
          peopleList: peopleList.filter(p => p !== "All"),
          statusList: statuses.filter(s => s !== "All"),
          moduleList: moduleList,
          userData: userData
        }),

        viewMode === "grid" 
          ? React.createElement(TaskListView, {
              tasks: filteredTasks,
              onStatusChange: handleStatusChange,
              canEdit: canEdit,
              currentUser: currentUser,
              userData: userData,
              formatShortDate: formatShortDate,
              formatFullDate: formatFullDate
            })
          : React.createElement(TaskBoardView, {
              tasks: filteredTasks,
              onStatusChange: handleStatusChange,
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