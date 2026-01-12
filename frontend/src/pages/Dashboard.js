import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Loader from "../components/Loader";

import PMDashboard from "../components/PM-Dashboard";
import DevDashboard from "../components/Dev-Dashboard";

import DevCalendar from "../components/Dev-Calendar";
import PMTimeline from "../components/Pm-Timeline";
import DevTimeline from "../components/Dev-Timeline";



function Dashboard() {
  const [role, setRole] = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (userData?.role) {
      setRole(userData.role);
      setUserName(userData.full_name || userData.name || "User");
    } else {
      window.location.href = "/login";
    }
  }, []);


  if (!role) {
    return <Loader />;
  }

  /* ---------- TAB CONTENT ---------- */
  const renderContent = () => {
    if (activeTab === "Overview") {
      return role === "Project Manager" || role === "admin"
        ? <PMDashboard />
        : <DevDashboard />;
    }

    if (activeTab === "Calendar" && role !== "Project Manager") {
      return <DevCalendar />;
    }

    if (activeTab === "Timeline") {
      return role === "Developer"
        ? <DevTimeline />
        : <PMTimeline />;
    }

    return null;
  };

  return (
    <div style={styles.app}>

      <Sidebar role={role} />

      <div style={styles.main}>
        <Header />

        {/* ---------- TABS ---------- */}
        <div style={styles.tabsRow}>
          <button
            style={activeTab === "Overview" ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab("Overview")}
          >
            Overview
          </button>

          {/* ✅ Calendar ONLY for Developer */}
          {role !== "Project Manager" && (
            <button
              style={activeTab === "Calendar" ? styles.tabActive : styles.tab}
              onClick={() => setActiveTab("Calendar")}
            >
              Calendar
            </button>
          )}

          {/* ✅ Timeline for BOTH, component switches by role */}
          <button
            style={activeTab === "Timeline" ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab("Timeline")}
          >
            Timeline
          </button>
          <div style={styles.welcome}>
            Welcome back, <span style={styles.name}>{userName}</span>
          </div>

        </div>
        <div style={styles.tabsDivider}></div>

        {/* ---------- SCROLL AREA ---------- */}
        <div style={styles.scrollArea}>
          {renderContent()}
        </div>

      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  app: {
    display: "flex",
    height: "100vh",
    overflow: "hidden",
    backgroundColor: "var(--bg-secondary)",
  },

  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },

  tabsRow: {
    display: "flex",
    alignItems: "center",
    gap: 24,
    padding: "0 20px",
    background: "var(--card-bg)",
    flexShrink: 0,
  },

  tabsDivider: {
    height: "1px",
    background: "var(--border-color)",
    width: "100%",
  },

  tab: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 0",
    background: "none",
    border: "none",
    borderBottom: "2px solid transparent",
    color: "var(--text-secondary)",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  tabActive: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 0",
    background: "none",
    border: "none",
    borderBottom: "2.5px solid var(--accent-color)",
    color: "var(--accent-color)",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
  },
  welcome: {
    marginLeft: "auto",
    fontSize: 14,
    color: "var(--text-secondary)",
  },
  name: {
    fontWeight: 500,
    color: "var(--text-primary)",
  },

  scrollArea: {
    flex: 1,
    overflowY: "auto",
    padding: 10,
  },
};

export default Dashboard;
