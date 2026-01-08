import { Calendar, Clock3, Box, ClipboardList, Pencil, GitGraph, Plus } from "lucide-react";
import { AvatarGroup } from "./Avatar";

const ProjectHeader = ({
  projectId,
  title,
  startDate,
  endDate,
  progress = 0,
  members = [],
  timeLeft,
  sprintSummary,
  modulesSummary,
  tasksSummary,
  currentSprintName = "Sprint 1",
  sprintProgress = 0,
  daysLeft = "2 Days Left",
  color = "#4F7DFF",
  hasDocument = false,
  onEdit,
  onShowFlow,
  onAddSprint,
  onAddTask
}) => {
  if (!title) return null;

  const roleData = JSON.parse(localStorage.getItem("userData"));
  const role = roleData?.role || "";
  const canEdit = ["admin", "Project Manager"].includes(role);

  const handleDownload = () => {
    if (!projectId) return;
    const token = JSON.parse(localStorage.getItem("userData"))?.accessToken;
    const baseUrl = process.env.REACT_APP_API_URL || "https://ptas-api.vercel.app/api";
    window.open(`${baseUrl}/projects/${projectId}/document?token=${token}`, "_blank");
  };

  return (
    <div style={styles.outerContainer}>
      <div style={styles.container}>
        {/* LEFT AREA: PROJECT INFO */}
        <div style={styles.left}>
          {/* PRD BUTTON - ONLY IF DOCUMENT EXISTS */}
          {hasDocument && (
            <button style={styles.prdBtn} onClick={handleDownload}>View PRD</button>
          )}

          <div style={styles.titleRow}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <h2 style={styles.title}>{title}</h2>
              {canEdit && (
                <button style={styles.editBtn} onClick={onEdit} title="Edit Project">
                  <Pencil size={18} color="#94a3b8" />
                </button>
              )}
              <button style={styles.editBtn} onClick={onShowFlow} title="Show Project Flow">
                <GitGraph size={18} color="#4F7DFF" strokeWidth={2.5} />
              </button>
            </div>
          </div>

          <div style={styles.dates}>
            <Calendar size={14} color="#64748b" />
            <span>{startDate} – {endDate}</span>
          </div>

          <div style={styles.progressSection}>
            <div style={styles.progressRow}>
              <div style={styles.progressTrack}>
                <div style={{ ...styles.progressFill, width: `${progress}%`, background: color }} />
              </div>
              <span style={styles.percentText}>{Math.round(progress)}%</span>
            </div>

            <div style={styles.metaRow}>
              <AvatarGroup members={members} size={28} max={2} />
              <div style={{ ...styles.daysBadge, color: color, background: `${color}15` }}>{timeLeft || daysLeft}</div>
            </div>
          </div>
        </div>

        {/* RIGHT AREA: MINI STAT CARDS */}
        <div style={styles.rightStats}>
          {/* SPRINT CARD */}
          <div style={{ ...styles.statCard, background: "#f0f7ff" }}>
            <div style={styles.cardInfo}>
              <div style={styles.cardHeaderArea}>
                <div style={{ ...styles.iconBox, background: "#fff" }}>
                  <Clock3 size={16} color="#3b82f6" />
                </div>
                {canEdit && (
                  <button style={styles.cardAddBtn} className="card-add-btn" onClick={onAddSprint} title="Add Sprint">
                    <Plus size={14} color="#3b82f6" />
                  </button>
                )}
              </div>
              <div style={styles.cardText}>
                <div style={styles.cardLabel}>{currentSprintName}</div>
                <div style={styles.cardProgressTrack}>
                  <div style={{ ...styles.cardProgressFill, width: `${sprintProgress}%`, background: "#3b82f6" }} />
                </div>
              </div>
            </div>
          </div>

          {/* MODULES CARD */}
          <div style={{ ...styles.statCard, background: "#f5f3ff" }}>
            <div style={styles.cardInfo}>
              <div style={{ ...styles.iconBox, background: "#fff" }}>
                <Box size={16} color="#8b5cf6" />
              </div>
              <div style={styles.cardText}>
                <div style={styles.cardLabel}>Modules</div>
                <div style={styles.cardVal}>{modulesSummary || "0 active"}</div>
              </div>
            </div>
          </div>

          {/* TASKS CARD */}
          <div style={{ ...styles.statCard, background: "#fff7ed" }}>
            <div style={styles.cardInfo}>
              <div style={styles.cardHeaderArea}>
                <div style={{ ...styles.iconBox, background: "#fff" }}>
                  <ClipboardList size={16} color="#f97316" />
                </div>
                {canEdit && (
                  <button style={styles.cardAddBtn} className="card-add-btn" onClick={onAddTask} title="Create Task">
                    <Plus size={14} color="#f97316" />
                  </button>
                )}
              </div>
              <div style={styles.cardText}>
                <div style={styles.cardLabel}>Tasks</div>
                <div style={styles.cardVal}>{tasksSummary || "0 active"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  outerContainer: {
    marginBottom: 32,
  },
  container: {
    background: "#fff",
    borderRadius: 24,
    padding: "24px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
    border: "1px solid #f1f5f9",
    display: "flex",
    flexWrap: "wrap",
    gap: "24px",
    alignItems: "stretch",
    boxSizing: "border-box",
  },
  left: {
    flex: "1 1 300px",
    position: "relative",
  },
  titleRow: {
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 800,
    color: "#1e293b",
    margin: 0,
  },
  editBtn: {
    background: "none",
    border: "none",
    padding: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    borderRadius: "6px",
    transition: "background 0.2s",
    "&:hover": {
      background: "#f1f5f9",
    },
  },
  prdBtn: {
    position: "absolute",
    top: 0,
    right: 0,
    background: "#C62828", // ALWAYS RED
    color: "#fff",
    border: "none",
    borderRadius: 14,
    padding: "10px 22px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(198, 40, 40, 0.25)",
    transition: "all 0.2s",
  },
  dates: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 14,
    fontWeight: 600,
    color: "#64748b",
    marginBottom: 24,
  },
  progressSection: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  progressRow: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  progressTrack: {
    flex: 1,
    height: 10,
    background: "#f1f5f9",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 10,
    transition: "width 0.4s ease",
  },
  percentText: {
    fontSize: 14,
    fontWeight: 800,
    color: "#94a3b8",
    minWidth: 40,
  },
  metaRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  daysBadge: {
    padding: "8px 16px",
    borderRadius: 14,
    fontSize: 12,
    fontWeight: 800,
  },
  rightStats: {
    flex: "2 1 400px",
    display: "flex",
    gap: 16,
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  statCard: {
    flex: "1 1 160px",
    minWidth: 160,
    borderRadius: 20,
    padding: "20px",
    display: "flex",
    alignItems: "center",
    transition: "transform 0.2s ease",
  },
  cardInfo: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    width: "100%",
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
  },
  cardHeaderArea: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardAddBtn: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    width: "24px",
    height: "24px",
    borderRadius: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
    "&:hover": {
      transform: "scale(1.1)",
      borderColor: "#cbd5e1",
    }
  },
  cardText: {
    width: "100%",
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: 800,
    color: "#1e293b",
    marginBottom: 4,
  },
  cardVal: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: 600,
    marginTop: 4,
  },
  cardProgressTrack: {
    width: "100%",
    height: 8,
    background: "rgba(255,255,255,0.5)",
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 8,
  },
  cardProgressFill: {
    height: "100%",
    borderRadius: 10,
  },
};

export default ProjectHeader;