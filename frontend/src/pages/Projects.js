import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Card from "../components/Card";
import AddProject from "../components/AddProject"; 
import { useNavigate } from "react-router-dom";

const Projects = ({ role = "Project Manager" }) => {
  const navigate = useNavigate();
  const [showAddProject, setShowAddProject] = useState(false); 

  /* ---------------- MOCK DATA ---------------- */

  const allMembers = [
    { id: 1, name: "Deepak Chandra", color: "#f6c1cc" },
    { id: 2, name: "Harsha Anand", color: "#dfe6d8" },
    { id: 3, name: "Nikhil Kumar", color: "#d8edf6" },
    { id: 4, name: "Varun Chaitanya", color: "#e0e7ff" },
  ];

  const projectsByStatus = {
    "Active Projects": [
      {
        id: 1,
        title: "TourO Web Development",
        progress: 70,
        startDate: "January 10, 2024",
        endDate: "July 30, 2024",
        members: [allMembers[0], allMembers[1]],
        timeLeft: "2 Days Left",
        color: "#d47b4a",
      },
      {
        id: 2,
        title: "Dashboard Portal",
        progress: 45,
        startDate: "January 10, 2024",
        endDate: "July 30, 2024",
        members: [allMembers[2]],
        timeLeft: "2 Weeks Left",
        color: "#cddc39",
      },
      {
        id: 3,
        title: "Designing",
        progress: 55,
        startDate: "January 10, 2024",
        endDate: "July 30, 2024",
        members: [allMembers[1], allMembers[3]],
        timeLeft: "1 Month Left",
        color: "#1e88e5",
      },
    ],

    "On Hold Projects": [
      {
        id: 4,
        title: "Client Onboarding",
        progress: 20,
        startDate: "March 01, 2024",
        endDate: "August 15, 2024",
        members: [allMembers[0]],
        timeLeft: "On Hold",
        color: "#fbc02d",
      },
    ],

    "Completed Projects": [
      {
        id: 5,
        title: "Automation System",
        progress: 100,
        startDate: "January 2024",
        endDate: "June 2024",
        members: [allMembers[1]],
        timeLeft: "Completed",
        color: "#2e7d32",
      },
    ],
  };

  /* --------- COLORS ALREADY USED (FOR MODAL) --------- */
  const usedColors = Object.values(projectsByStatus)
    .flat()
    .map((p) => p.color);

  return (
    <div style={styles.pageContainer}>
      <Sidebar />

      <div style={styles.mainContent}>
        <Header role={role} />

        <div style={styles.pageInner}>


          {/* PROJECT SECTIONS */}
          {Object.entries(projectsByStatus).map(([section, projects]) => (
            <section key={section} style={styles.section}>
              <h3 style={styles.sectionTitle}>{section}</h3>

              <div style={styles.cardGrid}>
                {projects.map((project) => (
                  <div
                    key={project.id}
                    style={styles.cardWrapper}
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    <Card {...project} />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* ADD PROJECT MODAL */}
      <AddProject
        isOpen={showAddProject}
        onClose={() => setShowAddProject(false)}
        members={allMembers}
        usedColors={usedColors}
      />
      {/* FLOATING ADD PROJECT BUTTON */}
      <button
        style={styles.fab}
        onClick={() => setShowAddProject(true)}
      >
        + Add Project
      </button>

    </div>
  );
};

export default Projects;

/* ---------------- STYLES ---------------- */

const styles = {
  pageContainer: {
    display: "flex",
    height: "100vh",
    background: "#f9f9f9",
  },

  mainContent: {
    flex: 1,
    overflowY: "auto",
  },

  pageInner: {
    padding: 20,
  },

  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  pageTitle: {
    fontSize: "1.6rem",
    fontWeight: 600,
  },

  fab: {
    position: "fixed",
    bottom: 24,
    right: 24,
    padding: "14px 18px",
    background: "#4F7DFF",
    color: "#fff",
    border: "none",
    borderRadius: "999px",
    fontSize: 15,
    fontWeight: 500,
    cursor: "pointer",
    boxShadow: "0 6px 18px rgba(0,0,0,0.2)",
    zIndex: 1001,
  },

  section: {
    marginBottom: 25,
  },

  sectionTitle: {
    marginBottom: 8,
    fontWeight: 600,
    fontSize: 18,
  },

  cardGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 20,
  },

  cardWrapper: {
    flex: "1 1 300px",
    maxWidth: 340,
    minWidth: 280,
    cursor: "pointer",
  },
};
