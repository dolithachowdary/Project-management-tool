import React from "react";
import { FaSignOutAlt, FaStickyNote } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";

// 🖼️ Import Figma-exported SVG icons
import DashboardIcon from "../assets/icons/dashboard.svg";
import ProjectsIcon from "../assets/icons/projects.svg";
import SprintsIcon from "../assets/icons/sprints.svg";
import TasksIcon from "../assets/icons/tasks.svg";
import TimesheetsIcon from "../assets/icons/timesheets.svg";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Updated menu items (Meetings removed)
  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: DashboardIcon },
    { name: "Projects", path: "/projects", icon: ProjectsIcon },
    { name: "Sprints", path: "/sprints", icon: SprintsIcon },
    { name: "Tasks", path: "/tasks", icon: TasksIcon },
    { name: "Timesheets", path: "/timesheets", icon: TimesheetsIcon },
  ];

  const handleSignOut = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  return (
    <aside style={styles.sidebar}>
      {/* === Top Section === */}
      <div>
        <div style={styles.logoContainer}>
          <img src="/light-redsage.png" alt="Logo" style={styles.logo} />
        </div>

        {/* === Menu Buttons === */}
        <nav style={styles.nav}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.name}
                style={{
                  ...styles.menuButton,
                  ...(isActive ? styles.activeButton : {}),
                }}
                onClick={() => navigate(item.path)}
              >
                <img
                  src={item.icon}
                  alt={item.name}
                  style={{
                    ...styles.icon,
                    filter: isActive
                      ? "invert(28%) sepia(98%) saturate(2492%) hue-rotate(345deg) brightness(90%) contrast(95%)"
                      : "invert(0%) brightness(0%)",
                  }}
                />
                {item.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* === Bottom Section === */}
      <div style={styles.bottomSection}>
        <button style={styles.bottomButton}>
          <FaStickyNote /> Notes
        </button>

        <button style={styles.bottomButton} onClick={handleSignOut}>
          <FaSignOutAlt /> Sign Out
        </button>
      </div>
    </aside>
  );
};

const styles = {
  sidebar: {
    width: "230px",
    backgroundColor: "#fff",
    color: "black",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    height: "100vh",
    borderRight: "1px solid #e0e0e0",
  },
  logoContainer: {
    textAlign: "center",
    padding: "20px 0",
    borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
  },
  logo: {
    width: "190px",
  },
  nav: {
    marginTop: "10px",
    display: "flex",
    flexDirection: "column",
  },
  menuButton: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    width: "100%",
    padding: "12px 20px",
    border: "none",
    background: "none",
    color: "black",
    textAlign: "left",
    cursor: "pointer",
    fontSize: "18px",
    fontFamily: "Poppins, sans-serif",
    transition: "all 0.3s ease",
  },
  activeButton: {
    backgroundColor: "#f5f5f5",
    borderLeft: "4px solid #c71b1b",
    fontWeight: "600",
  },
  icon: {
    width: "20px",
    height: "20px",
    objectFit: "contain",
    transition: "filter 0.2s ease",
  },
  bottomSection: {
    padding: "10px 20px",
  },
  bottomButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "none",
    border: "none",
    color: "black",
    cursor: "pointer",
    fontSize: "17px",
    marginTop: "10px",
    fontFamily: "Poppins, sans-serif",
  },
};

export default Sidebar;
