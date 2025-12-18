import React from "react";
import { useParams, useNavigate } from "react-router-dom";

/* Mock project data */
const projects = [
  {
    id: "1",
    title: "TourO Web Development",
    status: "Active",
    startDate: "2024-01-10",
    endDate: "2024-07-30",
    description:
      "TourO is a travel web platform that allows users to explore destinations, manage bookings, and receive personalized travel recommendations.",

    members: [
      { name: "Xavier", role: "Frontend Developer" },
      { name: "Jack", role: "Backend Developer" },
      { name: "Max", role: "UI/UX Designer" },
      { name: "Jonas", role: "QA Engineer" },
    ],

    resources: ["React", "Node.js", "MongoDB", "Figma", "AWS"],
  },

  {
    id: "2",
    title: "Dashboard Portal",
    status: "Active",
    startDate: "2024-02-01",
    endDate: "2024-06-15",
    description:
      "An internal analytics dashboard providing insights, reports, and KPI tracking for management.",

    members: [
      { name: "Leo", role: "Full Stack Developer" },
      { name: "Noah", role: "Data Analyst" },
      { name: "Ethan", role: "QA Engineer" },
    ],

    resources: ["React", "Chart.js", "PostgreSQL"],
  },
];

function ProjectDetails() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const project = projects.find((p) => p.id === projectId);

  if (!project) {
    return (
      <div style={styles.page}>
        <button onClick={() => navigate("/projects")} style={styles.backBtn}>
          ← Back to Projects
        </button>
        <p>Project not found</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Back */}
      <button onClick={() => navigate("/projects")} style={styles.backBtn}>
        ← Back to Projects
      </button>

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>{project.title}</h1>
        <span
          style={{
            ...styles.badge,
            ...(project.status === "Active"
              ? styles.active
              : project.status === "On Hold"
              ? styles.hold
              : styles.completed),
          }}
        >
          {project.status}
        </span>
      </div>

      {/* Dates */}
      <div style={styles.infoGrid}>
        <InfoCard label="Start Date" value={project.startDate} />
        <InfoCard label="End Date" value={project.endDate} />
      </div>

      {/* Description */}
      <Section title="Project Description">
        <p style={styles.text}>{project.description}</p>
      </Section>

      {/* Members */}
      <Section title="Team Members">
        <div style={styles.memberGrid}>
          {project.members.map((m, i) => (
            <div key={i} style={styles.memberCard}>
              <div style={styles.avatar}>{m.name.charAt(0)}</div>
              <div>
                <strong>{m.name}</strong>
                <div style={styles.role}>{m.role}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Resources */}
      <Section title="Resources Used">
        <div style={styles.resourceGrid}>
          {project.resources.map((r, i) => (
            <span key={i} style={styles.resourceChip}>
              {r}
            </span>
          ))}
        </div>
      </Section>
    </div>
  );
}

/* ===== Reusable Components ===== */
const InfoCard = ({ label, value }) => (
  <div style={styles.infoCard}>
    <span style={styles.infoLabel}>{label}</span>
    <span>{value}</span>
  </div>
);

const Section = ({ title, children }) => (
  <div style={styles.section}>
    <h3 style={styles.sectionTitle}>{title}</h3>
    {children}
  </div>
);

/* ================= STYLES ================= */
const styles = {
  page: {
    padding: "32px",
    background: "#f9f9f9",
    minHeight: "100vh",
  },

  backBtn: {
    background: "none",
    border: "none",
    color: "#c62828",
    fontSize: "15px",
    cursor: "pointer",
    marginBottom: "20px",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  },

  title: {
    fontSize: "2rem",
    fontWeight: 600,
    margin: 0,
  },

  badge: {
    padding: "6px 16px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: 500,
    color: "#fff",
  },
  active: { background: "#c62828" },
  hold: { background: "#fbc02d", color: "#222" },
  completed: { background: "#2e7d32" },

  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },

  infoCard: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  infoLabel: {
    fontSize: "13px",
    color: "#777",
    fontWeight: 500,
  },

  section: {
    background: "#fff",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    marginBottom: "30px",
  },

  sectionTitle: {
    marginBottom: "16px",
    fontSize: "1.1rem",
    fontWeight: 600,
  },

  text: {
    color: "#444",
    lineHeight: 1.6,
  },

  memberGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
  },

  memberCard: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "14px",
    borderRadius: "10px",
    background: "#f7f7f7",
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: "50%",
    background: "#c62828",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 600,
  },

  role: {
    fontSize: "13px",
    color: "#666",
  },

  resourceGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },

  resourceChip: {
    padding: "6px 14px",
    borderRadius: "20px",
    background: "#eee",
    fontSize: "13px",
    fontWeight: 500,
  },
};

export default ProjectDetails;
