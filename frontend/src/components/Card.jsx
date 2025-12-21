import React, { useState } from "react";

const Card = ({
  title,
  progress,
  startDate,
  endDate,
  members = [],
  availableMembers = [],
  timeLeft,
  color = "#d47b4a",
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const getInitials = (name) =>
    name
      .split(" ")
      .map(w => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <div style={styles.card}>
      {/* TITLE */}
      <h4 style={styles.title}>{title}</h4>

      {/* PROGRESS */}
      <div style={styles.label}>Progress</div>

      <div style={styles.progressBar}>
        <div
          style={{
            ...styles.progressFill,
            width: `${progress}%`,
            background: color,
          }}
        />
      </div>

      {/* DATE + % */}
      <div style={styles.metaRow}>
        <span>{startDate} – {endDate}</span>
        <strong>{progress}%</strong>
      </div>

      {/* FOOTER */}
      <div style={styles.footer}>
        {/* MEMBERS */}
        <div style={styles.membersWrapper}>
          {members.map((m, i) => (
            <div
              key={m.id}
              title={m.name}
              style={{
                ...styles.avatar,
                background: m.color,
                marginLeft: i === 0 ? 0 : -6,
              }}
            >
              {getInitials(m.name)}
            </div>
          ))}

          {/* ADD MEMBER */}
          <div
            style={styles.addAvatar}
            onClick={() => setShowDropdown(!showDropdown)}
          >
            +
          </div>

          {/* DROPDOWN */}
          {showDropdown && (
            <div style={styles.dropdown}>
              {availableMembers.map(m => (
                <div key={m.id} style={styles.dropdownItem}>
                  <div
                    style={{
                      ...styles.smallAvatar,
                      background: m.color,
                    }}
                  >
                    {getInitials(m.name)}
                  </div>
                  {m.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TIME LEFT */}
        <button
          style={{
            ...styles.badge,
            background: color,
          }}
        >
          {timeLeft}
        </button>
      </div>
    </div>
  );
};

export default Card;

/* ---------------- STYLES ---------------- */

const styles = {
  card: {
    background: "#fff",
    borderRadius: 16,
    padding: 16,
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
    position: "relative",
  },

  title: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 10,
  },

  label: {
    fontSize: 13,
    color: "#777",
    marginBottom: 6,
  },

  progressBar: {
    height: 8,
    background: "#eee",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 6,
  },

  progressFill: {
    height: "100%",
  },

  metaRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 12,
    color: "#555",
    marginBottom: 12,
  },

  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  membersWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },

  avatar: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 600,
    color: "#333",
    border: "2px solid #fff",
  },

  addAvatar: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: "#f1f1f1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    fontWeight: 600,
    marginLeft: 6,
    cursor: "pointer",
  },

  dropdown: {
    position: "absolute",
    top: 36,
    left: 0,
    background: "#fff",
    border: "1px solid #e5e5e5",
    borderRadius: 8,
    boxShadow: "0 6px 14px rgba(0,0,0,0.08)",
    padding: 8,
    width: 200,
    zIndex: 10,
  },

  dropdownItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 8px",
    fontSize: 13,
    cursor: "pointer",
    borderRadius: 6,
  },

  smallAvatar: {
    width: 22,
    height: 22,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 600,
  },

  badge: {
    border: "none",
    color: "#fff",
    padding: "6px 14px",
    borderRadius: 18,
    fontSize: 12,
    fontWeight: 500,
  },
};
