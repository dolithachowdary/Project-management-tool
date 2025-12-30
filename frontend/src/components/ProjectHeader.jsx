import React from "react";
import { Calendar, ClockFading, ClipboardCheck,Box } from "lucide-react";
const ProjectHeader = ({
  title,
  startDate,
  endDate,
  progress = 0,
  members = [],
  timeLeft,
  sprintSummary,
  modulesSummary,
  tasksSummary,
}) => {
  if (!title) return null;

  return (
    <div style={styles.container}>
      {/* LEFT SECTION */}
      <div style={styles.left}>
        <h2 style={styles.title}>{title}</h2>

        <div style={styles.dates}>
          <Calendar size={14} style={{ marginRight: 6 }} />
          {startDate} – {endDate}
        </div>

        <div style={styles.progressRow}>
          <div style={styles.progressTrack}>
            <div
              style={{
                ...styles.progressFill,
                width: `${progress}%`,
              }}
            />
          </div>
          <span style={styles.percent}>{progress}%</span>
        </div>

        <div style={styles.bottomRow}>
          <div style={styles.members}>
            {members.map((m, i) => (
              <div
                key={i}
                style={{
                  ...styles.avatar,
                  background: m.color,
                  left: i * 16,
                  zIndex: members.length - i,
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

      {/* RIGHT SECTION */}
      <div style={styles.right}>
        <button style={styles.prdBtn}>View PRD</button>

        <div style={styles.rightCards}>
          {/* SPRINT */}
          <div style={styles.sprintCard}>
            <div style={styles.iconWrapBlue}>
              <ClockFading size={16} />
            </div>

            <div style={styles.sprintContent}>
              <div style={styles.sprintHeader}>Sprint 5</div>
              <div style={styles.sprintDates}>{sprintSummary}</div>

              <div style={styles.sprintBar}>
                <div style={{ ...styles.sprintFill, width: "60%" }} />
              </div>
            </div>
          </div>

          {/* MODULES */}
          <div style={styles.statCardPurple}>
            <div style={styles.iconWrapPurple}>
              <Box size={16} />
            </div>

            <div>
              <div style={styles.cardTitle}>Modules</div>
              <div style={styles.cardSub}>{modulesSummary}</div>
            </div>
          </div>

          {/* TASKS */}
          <div style={styles.statCardOrange}>
            <div style={styles.iconWrapOrange}>
              <ClipboardCheck size={16} />
            </div>

            <div>
              <div style={styles.cardTitle}>Tasks</div>
              <div style={styles.cardSub}>{tasksSummary}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectHeader;

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    background: "#fff",
    borderRadius: 16,
    padding: "18px 26px",
    gap: 32,
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
  },

  /* LEFT */
  left: {
    flex: 1,
    minWidth: 420,
  },

  title: {
    fontSize: 22,
    fontWeight: 600,
    marginTop: 3,
    marginBottom: 6,
  },

  dates: {
    fontSize: 13,
    color: "#666",
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },

  progressRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },

  progressTrack: {
    width: "100%",
    height: 6,
    background: "#eee",
    borderRadius: 10,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    background: "#ff7043",
  },

  percent: {
    fontSize: 12,
    color: "#666",
    minWidth: 32,
  },

  bottomRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  members: {
    position: "relative",
    height: 28,
  },

  avatar: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: "50%",
    fontSize: 11,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid #fff",
  },

  timeLeft: {
    background: "#ffe0b2",
    color: "#e65100",
    padding: "4px 12px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 500,
  },

  /* RIGHT */
  right: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 12,
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

  rightCards: {
    display: "flex",
    gap: 16,
    alignItems: "stretch",
  },

  /* SPRINT CARD */
  sprintCard: {
    width: 240,
    background: "#eef4ff",
    borderRadius: 14,
    padding: 14,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },

  sprintHeader: {
    fontSize: 14,
    fontWeight: 600,
  },

  sprintDates: {
    fontSize: 12,
    color: "#555",
  },

  sprintBar: {
    height: 6,
    background: "#dbe6ff",
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 4,
  },

  sprintFill: {
    height: "100%",
    background: "#3b6df6",
  },

  /* MODULES CARD */
  statCardPurple: {
    width: 180,
    background: "#f3ecff",
    borderRadius: 14,
    padding: 14,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: 6,
    fontSize: 13,
  },

  /* TASKS CARD */
  statCardOrange: {
    width: 180,
    background: "#fff2e5",
    borderRadius: 14,
    padding: 14,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: 6,
    fontSize: 13,
  },
};