import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

import PMDashboard from "../components/PM-Dashboard";
import DevDashboard from "../components/Dev-Dashboard";

import DashboardCalendar from "../components/DashboardCalendar"; 
import DashboardTimeline from "../components/DashboardTimeline";

function Dashboard() {
  const [role, setRole] = useState(null);
  const [activeTab, setActiveTab] = useState("Overview"); // NEW

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

  // ======== WHAT TO RENDER INSIDE DASHBOARD BODY ========
  const renderContent = () => {
    if (activeTab === "Overview") {
      return role === "Project Manager" || role === "Admin"
        ? <PMDashboard />
        : <DevDashboard />;
    }
    if (activeTab === "Calendar") return <DashboardCalendar />;
    if (activeTab === "Timeline") return <DashboardTimeline />;
  };

  return (
    <div style={styles.container}>
      <Sidebar role={role} />
      <div style={styles.main}>
        <Header role={role} />

        {/* TOP TABS SECTION */}
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

        {/* PAGE THAT CHANGES BASED ON TAB */}
        <div style={{ padding: "20px" }}>
          {renderContent()}
        </div>

      </div>
    </div>
  );
}

// Styles
const styles = {
  container: {
    display: "flex",
    height: "100vh",
    backgroundColor: "white",
    color: "black",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  tabsRow: {
    display: "flex",
    gap: "20px",
    padding: "15px 20px",
    borderBottom: "1px solid #f0f0f0",
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
    border: "none",
    background: "transparent",
    fontSize: "16px",
    cursor: "pointer",
    borderBottom: "3px solid #c62828",
    color: "#111",
    paddingBottom: "5px",
    fontWeight: "600",
  },
};

export default Dashboard;
