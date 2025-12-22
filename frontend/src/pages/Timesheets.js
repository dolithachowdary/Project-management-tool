import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import WeeklyTimesheet from "../components/WeeklyTimesheet";

/* ---------------- MOCK DATA (BACKEND READY) ---------------- */

const projects = [
  {
    id: 1,
    name: "TourO Web Development",
    duration: "Jan 10, 2024 – July 30, 2024",
    color: "#e57373",
  },
  {
    id: 2,
    name: "Dashboard Portal",
    duration: "Feb 12, 2024 – Aug 12, 2024",
    color: "#f9a825",
  },
  {
    id: 3,
    name: "Designing",
    duration: "Mar 20, 2023 – Aug 20, 2024",
    color: "#26a69a",
  },
];

const weeks = ["Week 7", "Week 6", "Week 5", "Week 4", "Week 3"];

/* ---------------- COMPONENT ---------------- */

export default function Timesheets() {
  const [activeWeek, setActiveWeek] = useState({
    projectId: 1,
    week: "Week 7",
  });

  return (
    <div style={styles.page}>
      <Sidebar />

      <div style={styles.main}>
        <Header role="Project Manager" />

        {/* SPLIT VIEW */}
        <div style={styles.splitLayout}>

          {/* LEFT PANEL */}
          <div style={styles.leftPane}>
            <h2 style={styles.pageTitle}>Timesheets</h2>

            {projects.map(project => (
              <div key={project.id} style={styles.projectBlock}>
                <h3>{project.name}</h3>
                <p style={styles.duration}>{project.duration}</p>

                <div style={styles.weekRow}>
                  <span style={styles.arrow}>‹</span>

                  {weeks.map(week => {
                    const isActive =
                      activeWeek.projectId === project.id &&
                      activeWeek.week === week;

                    return (
                      <button
                        key={week}
                        style={{
                          ...styles.weekPill,
                          background: isActive
                            ? project.color
                            : "#e0e0e0",
                          color: isActive ? "#fff" : "#333",
                        }}
                        onClick={() =>
                          setActiveWeek({
                            projectId: project.id,
                            week,
                          })
                        }
                      >
                        {week}
                      </button>
                    );
                  })}

                  <span style={styles.arrow}>›</span>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT PANEL */}
          <div style={styles.rightPane}>
            <WeeklyTimesheet
              data={{
                projectId: activeWeek.projectId,
                week: activeWeek.week,
                entries: null, // backend data later
              }}
            />
          </div>

        </div>
      </div>
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const styles = {
  page: {
    display: "flex",
    height: "100vh",
    background: "#fafafa",
  },

  main: {
    flex: 1,
    overflow: "hidden",
  },

  splitLayout: {
    display: "grid",
    gridTemplateColumns: "420px 1fr",
    gap: 30,
    padding: 30,
    height: "calc(100vh - 70px)",
  },

  leftPane: {
    overflowY: "auto",
    paddingRight: 10,
  },

  rightPane: {
    overflow: "auto",
    background: "#f5f5f5",
    padding: 10,
  },

  pageTitle: {
    fontSize: "1.6rem",
    marginBottom: 20,
  },

  projectBlock: {
    marginBottom: 28,
  },

  duration: {
    color: "#777",
    marginBottom: 10,
  },

  weekRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },

  weekPill: {
    border: "none",
    borderRadius: 20,
    padding: "8px 16px",
    cursor: "pointer",
    fontSize: 14,
    whiteSpace: "nowrap",
  },

  arrow: {
    fontSize: 22,
    cursor: "pointer",
    color: "#aaa",
  },
};
