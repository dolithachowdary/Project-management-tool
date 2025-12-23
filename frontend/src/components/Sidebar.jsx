import React from "react";
import { StickyNote, LogOut} from 'lucide-react';
import { useNavigate, useLocation } from "react-router-dom";

import DashboardIcon from "../assets/icons/dashboard.svg";
import ProjectsIcon from "../assets/icons/projects.svg";
import SprintsIcon from "../assets/icons/sprints.svg";
import TasksIcon from "../assets/icons/tasks.svg";
import TimesheetsIcon from "../assets/icons/timesheets.svg";
import analyticsIcon from "../assets/icons/analytics.svg";
import reportsicon from "../assets/icons/reports.svg";



const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: DashboardIcon },
    { name: "Projects", path: "/projects", icon: ProjectsIcon },
    { name: "Sprints", path: "/sprints", icon: SprintsIcon },
    { name: "Tasks", path: "/tasks", icon: TasksIcon },
    { name: "Timesheets", path: "/timesheets", icon: TimesheetsIcon },
    { name: "Analytics", path: "/analytics", icon: analyticsIcon },
    { name: "Reports", path: "/reports", icon: reportsicon },
    
  ];

  const handleSignOut = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    navigate("/login");
  };
const isNotesActive = location.pathname === "/notes";

  return (
    <aside style={styles.sidebar}>
      {/* TOP */}
      <div>
        <div style={styles.logoContainer}>
          <img src="/light-redsage.png" alt="Logo" style={styles.logo} />
        </div>

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
                : "invert(0%) brightness(0%)",
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
    overflow: "hidden",        // 🔒 NO SCROLL EVER
    backgroundColor: "#fff",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    borderRight: "1px solid #e0e0e0",
    flexShrink: 0,             // 🔒 never shrink
  },

  logoContainer: {
    textAlign: "center",
    padding: "20px 0",
    borderBottom: "1px solid rgba(0,0,0,0.1)",
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
    fontFamily: "Poppins, sans-serif",
  },

  activeButton: {
    backgroundColor: "#f5f5f5",
    borderLeft: "4px solid #c71b1b",
    fontWeight: "600",
  },

  icon: {
    width: "20px",
    height: "20px",
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
    cursor: "pointer",
    fontSize: "17px",
    marginTop: "10px",
    fontFamily: "Poppins, sans-serif",
  },
};

export default Sidebar;
