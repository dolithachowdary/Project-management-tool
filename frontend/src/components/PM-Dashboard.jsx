import React from "react";
import { useNavigate } from "react-router-dom";

import Stats from "./Stats";
import Card from "./Card";
import MiniCalendar from "./Mini-Calendar";
import Upcoming from "./Upcoming";
import RecentActivity from "./RecentActivity";
import QAPending from "./QAPending";
import WeeklyTaskGraph from "./WeeklyTaskGraph";

export default function PMDashboard() {
  const navigate = useNavigate();

  /* ---------------- MEMBERS (BACKEND READY) ---------------- */

  const allMembers = [
    { id: 1, name: "Deepak Chandra", color: "#f6c1cc" },
    { id: 2, name: "Harsha Anand", color: "#dfe6d8" },
    { id: 3, name: "Nikhil Kumar", color: "#d8edf6" },
    { id: 4, name: "Varun Chaitanya", color: "#e0e7ff" },
  ];

  /* ---------------- ACTIVE PROJECTS ---------------- */

  const activeProjects = [
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
      progress: 50,
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
      progress: 85,
      startDate: "January 10, 2024",
      endDate: "July 30, 2024",
      members: [allMembers[1], allMembers[3]],
      availableMembers: allMembers,
      timeLeft: "1 Month Left",
      color: "#1e88e5",
    },
  ];

  /* ---------------- ACTIVE SPRINTS ---------------- */

  const activeSprints = [
    {
      id: 4,
      title: "TourO Web Development, Sprint 1",
      progress: 40,
      startDate: "January 10, 2024",
      endDate: "July 30, 2024",
      members: [allMembers[0]],
      availableMembers: allMembers,
      timeLeft: "1 Week Left",
      color: "#d47b4a",
    },
    {
      id: 5,
      title: "Dashboard Portal, Sprint 2",
      progress: 65,
      startDate: "January 10, 2024",
      endDate: "July 30, 2024",
      members: [allMembers[1], allMembers[2]],
      availableMembers: allMembers,
      timeLeft: "2 Weeks Left",
      color: "#cddc39",
    },
    {
      id: 6,
      title: "Designing, Sprint 3",
      progress: 90,
      startDate: "January 10, 2024",
      endDate: "July 30, 2024",
      members: [allMembers[3]],
      availableMembers: allMembers,
      timeLeft: "1 Week Left",
      color: "#1e88e5",
    },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.mainGrid}>
        {/* ---------------- LEFT ---------------- */}
        <div style={styles.left}>
          <Stats />

          <div style={styles.graphRow}>
            <div style={styles.graphWrapper}>
              <h3 style={styles.sectionTitle}>Weekly task report</h3>
              <WeeklyTaskGraph />
            </div>

            <div style={styles.recentWrapper}>
              <RecentActivity />
            </div>
          </div>

          {/* ACTIVE PROJECTS */}
          <h3 style={styles.sectionTitle}>Active Projects</h3>
          <div style={styles.cardGrid}>
            {activeProjects.map(card => (
              <div
                key={card.id}
                style={styles.cardWrapper}
                onClick={() => navigate(`/projects/${card.id}`)}
              >
                <Card {...card} />
              </div>
            ))}
          </div>

          {/* ACTIVE SPRINTS */}
          <h3 style={styles.sectionTitle}>Active Sprints</h3>
          <div style={styles.cardGrid}>
            {activeSprints.map(card => (
              <div
                key={card.id}
                style={styles.cardWrapper}
                onClick={() => navigate(`/sprints/${card.id}`)}
              >
                <Card {...card} />
              </div>
            ))}
          </div>
        </div>

        {/* ---------------- RIGHT ---------------- */}
        <aside style={styles.right}>
          <div style={styles.sideCard}>
            <MiniCalendar />
          </div>

          <div style={styles.sideCard}>
            <Upcoming />
          </div>

          <div style={styles.sideCard}>
            <QAPending />
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const styles = {
  page: {
    background: "#fafafa",
  },

  mainGrid: {
    display: "flex",
    gap: 20,
  },

  left: {
    flex: 1,
  },

  right: {
    width: 320,
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },

  graphRow: {
    display: "grid",
    gridTemplateColumns: "2.5fr 1.5fr",
    gap: 20,
    marginBottom: 24,
  },

  graphWrapper: {
    background: "#fff",
    borderRadius: 12,
    border: "1px solid #e5e5e5",
    padding: 20,
  },

  recentWrapper: {
    background: "#fff",
    borderRadius: 12,
    border: "1px solid #e5e5e5",
    padding: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 12,
  },

  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 20,
    marginBottom: 24,
  },

  cardWrapper: {
    cursor: "pointer",
  },

  sideCard: {
    background: "#fff",
    borderRadius: 12,
    border: "1px solid #e5e5e5",
    padding: 16,
  },
};
