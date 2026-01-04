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

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (userData?.role) {
      setRole(userData.role);
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
            style={activeTab === "Overview" ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab("Overview")}
          >
            Overview
          </button>

          {/* ✅ Calendar ONLY for Developer */}
          {role !== "Project Manager" && (
            <button
              style={activeTab === "Calendar" ? styles.activeTab : styles.tab}
              onClick={() => setActiveTab("Calendar")}
            >
              Calendar
            </button>
          )}

          {/* ✅ Timeline for BOTH, component switches by role */}
          <button
            style={activeTab === "Timeline" ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab("Timeline")}
          >
            Timeline
          </button>

        </div>

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
    backgroundColor: "#fafafa",
  },

  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },

  tabsRow: {
    display: "flex",
    gap: 20,
    padding: "15px 20px",
    borderBottom: "1px solid #f0f0f0",
    background: "#fff",
    flexShrink: 0,
  },

  tab: {
    background: "transparent",
    border: "none",
    fontSize: 16,
    cursor: "pointer",
    color: "#666",
    paddingBottom: 5,
  },

  activeTab: {
    background: "transparent",
    border: "none",
    fontSize: 16,
    cursor: "pointer",
    borderBottom: "3px solid #c62828",
    color: "#111",
    paddingBottom: 5,
    fontWeight: 600,
  },

  scrollArea: {
    flex: 1,
    overflowY: "auto",
    padding: 10,
  },
};

export default Dashboard;
