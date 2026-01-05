import React, { useState } from "react";
import Avatar, { AvatarGroup } from "./Avatar";
import { Pencil } from "lucide-react";

const Card = ({
  title,
  progress,
  startDate,
  endDate,
  members = [],
  availableMembers = [],
  timeLeft,
  color = "#4F7DFF",
  onEdit,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div style={styles.card}>
      {/* TITLE */}
      <div style={styles.titleRow}>
        <h4 style={styles.title}>{title}</h4>
        {onEdit && (
          <button
            style={styles.editBtn}
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            <Pencil size={14} color="#94a3b8" />
          </button>
        )}
      </div>

      {/* PROGRESS */}
      <div style={styles.labelRow}>
        <span style={styles.label}>Progress</span>
        <strong style={{ color: "#1e293b" }}>{progress}%</strong>
      </div>

      <div style={styles.progressBar}>
        <div
          style={{
            ...styles.progressFill,
            width: `${progress}%`,
            background: color,
          }}
        />
      </div>

      {/* DATE */}
      <div style={styles.metaRow}>
        <span>{startDate} – {endDate}</span>
      </div>

      {/* FOOTER */}
      <div style={styles.footer}>
        <div style={styles.membersWrapper}>
          <AvatarGroup members={members} size={28} max={2} />
        </div>

        <span style={{ ...styles.badge, background: color }}>
          {timeLeft}
        </span>
      </div>
    </div>
  );
};

export default Card;

const styles = {
  card: {
    background: "#fff",
    borderRadius: 20,
    padding: 20,
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01)",
    border: "1px solid #f1f5f9",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    height: "100%",
    boxSizing: "border-box"
  },
  titleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: 600,
    color: "#1e293b",
    margin: 0,
    flex: 1,
  },
  editBtn: {
    background: "none",
    border: "none",
    padding: 4,
    cursor: "pointer",
    borderRadius: 4,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.2s",
    "&:hover": { background: "#f1f5f9" }
  },
  labelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 13,
  },
  label: {
    color: "#64748b",
  },
  progressBar: {
    height: 8,
    background: "#f1f5f9",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 10,
    transition: "width 0.4s ease",
  },
  metaRow: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 8,
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "auto",
  },
  membersWrapper: {
    display: "flex",
    alignItems: "center",
  },
  badge: {
    padding: "6px 14px",
    borderRadius: 12,
    fontSize: 11,
    fontWeight: 700,
    color: "#fff",
    textTransform: "capitalize",
  },
};
