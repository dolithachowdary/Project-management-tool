import React, { useState } from "react";

export default function MiniCalendar() {
  const [current, setCurrent] = useState(new Date());

  const year = current.getFullYear();
  const month = current.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startOffset = firstDay.getDay(); // Sun-based
  const daysInMonth = lastDay.getDate();

  const today = new Date();

  const changeMonth = (delta) => {
    setCurrent(new Date(year, month + delta, 1));
  };

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <button onClick={() => changeMonth(-1)} style={styles.navBtn}>‹</button>
        <div style={styles.month}>
          {current.toLocaleString("default", { month: "long" })} {year}
        </div>
        <button onClick={() => changeMonth(1)} style={styles.navBtn}>›</button>
      </div>

      {/* DAYS */}
      <div style={styles.grid}>
        {["S", "M", "T", "W", "T", "F", "S"].map(d => (
          <div key={d} style={styles.day}>{d}</div>
        ))}

        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`e-${i}`} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const date = i + 1;
          const isToday =
            date === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();

          return (
            <div
              key={date}
              style={{
                ...styles.date,
                ...(isToday ? styles.today : {}),
              }}
            >
              {date}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: "#fff",
    borderRadius: 16,
    border: "1px solid #f1f5f9",
    padding: "20px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  month: {
    fontWeight: 700,
    fontSize: 15,
    color: "#1e293b",
  },

  navBtn: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: 20,
    color: "#64748b",
    padding: "0 8px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 6,
    textAlign: "center",
  },

  day: {
    fontWeight: 700,
    fontSize: 12,
    color: "#94a3b8",
    paddingBottom: 8,
  },

  date: {
    padding: "8px 0",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    color: "#475569",
    transition: "all 0.2s",
    "&:hover": {
      background: "#f1f5f9",
    }
  },

  today: {
    background: "#C62828",
    color: "#fff",
    boxShadow: "0 4px 10px rgba(198, 40, 40, 0.3)",
  },
};
