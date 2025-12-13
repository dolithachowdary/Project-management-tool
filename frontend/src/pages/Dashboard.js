import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

import PMDashboard from "../components/PM-Dashboard";
import DevDashboard from "../components/Dev-Dashboard";

import DashboardCalendar from "../components/DashboardCalendar";
import DashboardTimeline from "../components/Pm-Timeline";

function Dashboard() {
  const [role, setRole] = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (userData?.role) {
      setRole(userData.role);
    } else {
      window.location.href = "/login";
    }
  }, []);

  if (!role) {
    return <p style={{ textAlign: "center", marginTop: "50px" }}>Loading...</p>;
  }

  /* -------- CONTENT BASED ON TAB -------- */
  const renderContent = () => {
    if (activeTab === "Overview") {
      return role === "Project Manager" || role === "Admin"
        ? <PMDashboard />
        : <DevDashboard />;
    }
    if (activeTab === "Calendar") return <DashboardCalendar />;
    if (activeTab === "Timeline") return <DashboardTimeline />;
    return null;
  };

  return (
    <div style={styles.app}>

      {/* SIDEBAR — NEVER SCROLLS */}
      <Sidebar role={role} />

      {/* MAIN AREA */}
      <div style={styles.main}>

        {/* HEADER — NEVER SCROLLS */}
        <Header role={role} />

        {/* TABS — NEVER SCROLL */}
        <div style={styles.tabsRow}>
          <button
            style={activeTab === "Overview" ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab("Overview")}
          >
            Overview
          </button>

          <button
            style={activeTab === "Calendar" ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab("Calendar")}
          >
            Calendar
          </button>

          <button
            style={activeTab === "Timeline" ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab("Timeline")}
          >
            Timeline
          </button>
        </div>

        {/* 🔥 ONLY THIS AREA SCROLLS */}
        <div style={styles.scrollArea}>
          {renderContent()}
        </div>

      </div>
    </div>
  );
}

/* ================== STYLES ================== */

const styles = {
  /* ROOT LAYOUT */
  app: {
    display: "flex",
    height: "100vh",
    overflow: "hidden", // 🔒 LOCK ENTIRE VIEWPORT
    backgroundColor: "#fafafa",
  },

  /* MAIN COLUMN (HEADER + TABS + CONTENT) */
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden", // 🔒 HEADER & TABS DO NOT SCROLL
  },

  /* TABS */
  tabsRow: {
    display: "flex",
    gap: "20px",
    padding: "15px 20px",
    borderBottom: "1px solid #f0f0f0",
    background: "#fff",
    flexShrink: 0, // 🔒 NEVER SHRINK
  },

  tab: {
    background: "transparent",
    border: "none",
    fontSize: "16px",
    cursor: "pointer",
    color: "#666",
    paddingBottom: "5px",
  },

  activeTab: {
    background: "transparent",
    border: "none",
    fontSize: "16px",
    cursor: "pointer",
    borderBottom: "3px solid #c62828",
    color: "#111",
    paddingBottom: "5px",
    fontWeight: "600",
  },

  /* ONLY SCROLLABLE AREA */
  scrollArea: {
    flex: 1,
    overflowY: "auto", // ✅ ONLY PLACE THAT SCROLLS
    padding: "20px",
  },
};

export default Dashboard;
