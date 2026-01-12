import { StickyNote, LogOut, Logs } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

import DashboardIcon from "../assets/icons/dashboard.svg";
import ProjectsIcon from "../assets/icons/projects.svg";
import SprintsIcon from "../assets/icons/sprints.svg";
import TasksIcon from "../assets/icons/tasks.svg";
import TimesheetsIcon from "../assets/icons/timesheets.svg";
import analyticsIcon from "../assets/icons/analytics.svg";
import reportsicon from "../assets/icons/reports.svg";

const Sidebar = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const role = (userData.role || "").toLowerCase(); // Normalized role


  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: DashboardIcon },
    { name: "Projects", path: "/projects", icon: ProjectsIcon },
    { name: "Sprints", path: "/sprints", icon: SprintsIcon },
    { name: "Tasks", path: "/tasks", icon: TasksIcon },

    //  Hide Timesheets for DEV
    ...(role === "project manager" || role === "admin"
      ? [{ name: "Timesheets", path: "/timesheets", icon: TimesheetsIcon }]
      : []),

    // Hide Analytics and Reports for DEV
    ...(role === "project manager" || role === "admin"
      ? [
        { name: "Analytics", path: "/analytics", icon: analyticsIcon },
        { name: "Reports", path: "/reports", icon: reportsicon },
        { name: "Logs", path: "/logs", icon: Logs }, // Using analyticsIcon as fallback if logsIcon not found
      ]
      : []),
  ];

  const handleSignOut = () => {
    localStorage.removeItem("userData");
    navigate("/login");
  };


  const isNotesActive = location.pathname === "/notes";

  return (
    <aside style={styles.sidebar}>
      {/* TOP */}
      <div>
        <div style={styles.logoContainer}>
          <img
            src={theme === 'dark' ? (process.env.PUBLIC_URL + "/dark-redsage1.png") : (process.env.PUBLIC_URL + "/light-redsage.png")}
            alt="Logo"
            style={styles.logo}
            onError={(e) => { e.target.src = process.env.PUBLIC_URL + "/redsage.png"; }}
          />
        </div>

        <nav style={styles.nav}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const isComponentIcon = typeof item.icon !== "string";

            return (
              <button
                key={item.name}
                style={{
                  ...styles.menuButton,
                  ...(isActive ? styles.activeButton : {}),
                }}
                onClick={() => navigate(item.path)}
              >
                {isComponentIcon ? (
                  <item.icon
                    size={20}
                    strokeWidth={2}
                    style={{
                      opacity: 0.85,
                      filter: isActive
                        ? "invert(28%) sepia(98%) saturate(2492%) hue-rotate(345deg) brightness(90%) contrast(95%)"
                        : theme === 'dark' ? "invert(100%) brightness(100%)" : "invert(0%) brightness(0%)",
                    }}
                  />
                ) : (
                  <img
                    src={item.icon}
                    alt={item.name}
                    style={{
                      ...styles.icon,
                      filter: isActive
                        ? "invert(28%) sepia(98%) saturate(2492%) hue-rotate(345deg) brightness(90%) contrast(95%)"
                        : theme === 'dark' ? "invert(100%) brightness(100%)" : "invert(0%) brightness(0%)",
                    }}
                  />
                )}
                {item.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* BOTTOM */}
      <div style={styles.bottomSection}>
        <button
          style={{
            ...styles.bottomButton,
            ...(isNotesActive ? styles.activeButton : {}),
          }}
          onClick={() => navigate("/notes")}
        >
          <StickyNote
            size={20}
            strokeWidth={2}
            style={{
              opacity: 0.85,
              filter: isNotesActive
                ? "invert(28%) sepia(98%) saturate(2492%) hue-rotate(345deg) brightness(90%) contrast(95%)"
                : theme === 'dark' ? "invert(100%) brightness(100%)" : "invert(0%) brightness(0%)",
            }}
          />
          Notes
        </button>

        <button style={styles.bottomButton} onClick={handleSignOut}>
          <LogOut size={20} strokeWidth={2} style={{ opacity: 0.85 }} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

const styles = {
  sidebar: {
    width: "230px",
    height: "100vh",
    overflow: "hidden",
    backgroundColor: "var(--sidebar-bg)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    borderRight: "1px solid var(--border-color)",
    flexShrink: 0,
  },

  logoContainer: {
    textAlign: "center",
    padding: "20px 0",
    borderBottom: "1px solid var(--border-color)",
  },

  logo: {
    width: "190px",
  },

  nav: {
    display: "flex",
    flexDirection: "column",
    marginTop: "10px",
  },

  menuButton: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "12px 20px",
    border: "none",
    background: "none",
    cursor: "pointer",
    fontSize: "18px",
    textAlign: "left",
    fontFamily: "'Poppins', sans-serif",
    color: "var(--text-primary)",
  },

  activeButton: {
    backgroundColor: "var(--hover-bg)",
    borderLeft: "4px solid #c71b1b",
    fontWeight: "600",
  },

  icon: {
    width: "20px",
    height: "20px",
  },

  bottomSection: {
    padding: "10px 0", // Remove horizontal padding to allow full-width buttons
    display: "flex",
    flexDirection: "column",
  },

  bottomButton: {
    display: "flex",
    alignItems: "center",
    gap: "14px", // Match menuButton gap
    padding: "12px 20px", // Match menuButton padding
    width: "100%", // Ensure full width
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "18px", // Match menuButton size
    textAlign: "left",
    fontFamily: "'Poppins', sans-serif",
    color: "var(--text-primary)",
    // marginTop: "5px", // Optional spacing
  },
};

export default Sidebar;
