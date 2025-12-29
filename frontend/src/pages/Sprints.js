import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Card from "../components/Card";
import { useNavigate } from "react-router-dom";
import AddSprint from "../components/AddSprint";

const Sprints = ({ role = "Project Manager" }) => {
  const navigate = useNavigate();
  const [openAddSprint, setOpenAddSprint] = useState(false);

  /* ---------------- MEMBERS ---------------- */

  const allMembers = [
    { id: 1, name: "Deepak Chandra", color: "#f6c1cc" },
    { id: 2, name: "Harsha Anand", color: "#dfe6d8" },
    { id: 3, name: "Nikhil Kumar", color: "#d8edf6" },
    { id: 4, name: "Varun Chaitanya", color: "#e0e7ff" },
  ];

  /* ---------------- ACTIVE SPRINTS ---------------- */

  const activeSprints = [
    {
      id: 1,
      title: "Website Revamp – Sprint 4",
      progress: 70,
      startDate: "Dec 01, 2025",
      endDate: "Dec 15, 2025",
      members: [allMembers[0], allMembers[1]],
      availableMembers: allMembers,
      timeLeft: "5 Days Left",
      color: "#d47b4a",
    },
    {
      id: 2,
      title: "Mobile App UI – Sprint 2",
      progress: 45,
      startDate: "Dec 05, 2025",
      endDate: "Dec 20, 2025",
      members: [allMembers[2]],
      availableMembers: allMembers,
      timeLeft: "10 Days Left",
      color: "#cddc39",
    },
    {
      id: 3,
      title: "Security Upgrade – Sprint 1",
      progress: 60,
      startDate: "Dec 08, 2025",
      endDate: "Dec 25, 2025",
      members: [allMembers[1], allMembers[3]],
      availableMembers: allMembers,
      timeLeft: "12 Days Left",
      color: "#1e88e5",
    },
  ];

  /* ---------------- COMPLETED SPRINTS ---------------- */

  const completedSprints = [
    {
      id: 101,
      title: "Website Revamp – Sprint 3",
      progress: 100,
      startDate: "Nov 15, 2025",
      endDate: "Nov 30, 2025",
      members: [allMembers[0], allMembers[1]],
      availableMembers: allMembers,
      timeLeft: "Completed",
      color: "#2e7d32",
    },
    {
      id: 102,
      title: "Mobile App UI – Sprint 1",
      progress: 100,
      startDate: "Nov 01, 2025",
      endDate: "Nov 14, 2025",
      members: [allMembers[2]],
      availableMembers: allMembers,
      timeLeft: "Completed",
      color: "#2e7d32",
    },
  ];

  return (
    <div style={styles.pageContainer}>
      <Sidebar />

      <div style={styles.mainContent}>
        <Header role={role} />

        <div style={styles.pageInner}>

          {/* ACTIVE SPRINTS */}
          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>Active Sprints</h3>

            <div style={styles.cardGrid}>
              {activeSprints.map((sprint) => (
                <div
                  key={sprint.id}
                  style={styles.cardWrapper}
                  onClick={() => navigate(`/sprints/${sprint.id}`)}
                >
                  <Card {...sprint} />
                </div>
              ))}
            </div>
          </section>

          {/* COMPLETED SPRINTS */}
          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>Completed Sprints</h3>

            <div style={styles.cardGrid}>
              {completedSprints.map((sprint) => (
                <div
                  key={sprint.id}
                  style={styles.cardWrapper}
                  onClick={() => navigate(`/sprints/${sprint.id}`)}
                >
                  <Card {...sprint} />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ADD SPRINT BUTTON */}
        <button
          style={styles.addSprintBtn}
          onClick={() => setOpenAddSprint(true)}
        >
          + Add Sprint
        </button>

        {/* ADD SPRINT MODAL */}
        <AddSprint
          isOpen={openAddSprint}
          onClose={() => setOpenAddSprint(false)}
        />
      </div>
    </div>
  );
};

export default Sprints;

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

  section: {
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: "1.2rem",
    fontWeight: 600,
    marginBottom: 15,
    marginTop: 3,
  },

  cardGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 20,
  },

  cardWrapper: {
    flex: "1 1 300px",
    minWidth: 280,
    maxWidth: 340,
    cursor: "pointer",
  },

  addSprintBtn: {
    position: "fixed",
    bottom: 24,
    right: 24,
    backgroundColor: "#c71b1b",
    color: "#ffffff",
    border: "none",
    borderRadius: 999,
    padding: "12px 18px",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    zIndex: 999,
  },
};
