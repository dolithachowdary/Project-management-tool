import React from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Card from "../components/Card";
import { useNavigate } from "react-router-dom";

const Projects = ({ role = "Project Manager" }) => {
  const navigate = useNavigate();

  /* ---------------- MOCK DATA (BACKEND READY) ---------------- */

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
        availableMembers: allMembers,
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
        availableMembers: allMembers,
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
        availableMembers: allMembers,
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
        availableMembers: allMembers,
        timeLeft: "On Hold",
        color: "#fbc02d",
      },
      {
        id: 5,
        title: "Legacy Migration",
        progress: 30,
        startDate: "February 10, 2024",
        endDate: "September 30, 2024",
        members: [allMembers[2]],
        availableMembers: allMembers,
        timeLeft: "On Hold",
        color: "#fbc02d",
      },
    ],

    "Completed Projects": [
      {
        id: 6,
        title: "Automation System",
        progress: 100,
        startDate: "January 2024",
        endDate: "June 2024",
        members: [allMembers[1]],
        availableMembers: allMembers,
        timeLeft: "Completed",
        color: "#2e7d32",
      },
      {
        id: 7,
        title: "Marketing Dashboard",
        progress: 100,
        startDate: "February 2024",
        endDate: "May 2024",
        members: [allMembers[3]],
        availableMembers: allMembers,
        timeLeft: "Completed",
        color: "#2e7d32",
      },
    ],
  };

  return (
    <div style={styles.pageContainer}>
      <Sidebar />

      <div style={styles.mainContent}>
        <Header role={role} />

        <div style={styles.pageInner}>
          <h2 style={styles.pageTitle}>Projects</h2>

          {Object.entries(projectsByStatus).map(([section, projects]) => (
            <section key={section} style={styles.section}>
              <h3 style={styles.sectionTitle}>{section}</h3>

              <div style={styles.cardGrid}>
                {projects.map(project => (
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
    padding: 30,
  },

  pageTitle: {
    fontSize: "1.5rem",
    fontWeight: 600,
    marginBottom: 25,
  },

  section: {
    marginBottom: 40,
  },

  sectionTitle: {
    marginBottom: 15,
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
