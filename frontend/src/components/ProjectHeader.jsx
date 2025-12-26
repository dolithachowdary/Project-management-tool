import React from "react";

const ProjectOverviewHeader = ({
  title,
  startDate,
  endDate,
  progress,
  members,
  timeLeft,
  modulesSummary,
  tasksSummary,
}) => {
  return (
    <div style={styles.container}>
      {/* LEFT SIDE */}
      <div style={styles.left}>
        <h2 style={styles.title}>{title}</h2>

        <div style={styles.dates}>
          📅 {startDate} – {endDate}
        </div>

        {/* PROGRESS BAR */}
        <div style={styles.progressTrack}>
          <div
            style={{
              ...styles.progressFill,
              width: `${progress}%`,
            }}
          />
        </div>

        {/* MEMBERS + TIME LEFT */}
        <div style={styles.bottomRow}>
          <div style={styles.members}>
            {members.map((m, i) => (
              <div
                key={i}
                style={{
                  ...styles.avatar,
                  background: m.color,
                }}
              >
                {m.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
            ))}
          </div>

          <span style={styles.timeLeft}>{timeLeft}</span>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div style={styles.right}>
        <button style={styles.prdBtn}>View PRD</button>

        <div style={styles.cards}>
          <div style={{ ...styles.card, background: "#f3ecff" }}>
            <strong>Modules</strong>
            <span>{modulesSummary}</span>
          </div>

          <div style={{ ...styles.card, background: "#fff2e5" }}>
            <strong>Tasks</strong>
            <span>{tasksSummary}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectOverviewHeader;

/* ================= STYLES ================= */

const styles = {
  container: {
    display: "flex",
    justifyContent: "space-between",
    background: "#fff",
    borderRadius: 14,
    padding: "20px 24px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    alignItems: "stretch",
  },

  left: {
    flex: 1,
    paddingRight: 30,
  },

  title: {
    fontSize: 20,
    fontWeight: 600,
    marginBottom: 6,
  },

  dates: {
    fontSize: 13,
    color: "#666",
    marginBottom: 16,
  },

  progressTrack: {
    height: 6,
    background: "#eee",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 16,
  },

  progressFill: {
    height: "100%",
    background: "#ff7043",
    borderRadius: 10,
  },

  bottomRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },

  members: {
    display: "flex",
    gap: 6,
  },

  avatar: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    fontSize: 11,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  timeLeft: {
    background: "#ffe0b2",
    color: "#e65100",
    padding: "4px 12px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 500,
  },

  right: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 14,
  },

  prdBtn: {
    background: "#c62828",
    color: "#fff",
    border: "none",
    borderRadius: 20,
    padding: "6px 16px",
    fontSize: 13,
    cursor: "pointer",
  },

  cards: {
    display: "flex",
    gap: 14,
  },

  card: {
    width: 150,
    height: 90,
    borderRadius: 12,
    padding: 14,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: 6,
    fontSize: 13,
  },
};
