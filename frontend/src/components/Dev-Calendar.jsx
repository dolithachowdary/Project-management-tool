import React, { useState } from "react";

/**
 * Full Month Calendar (Dashboard Calendar Tab)
 */

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const SAMPLE_EVENTS = {
  "2024-10-01": [
    { title: "Contact customers w...", color: "#FFE5B4" },
    { title: "Task detail modal", color: "#FFD2D2" },
    { title: "Reporting: Design co...", color: "#D5E4FF" }
  ],
  "2024-10-07": [
    { title: "Dashboard: concept", color: "#C7F5D7" }
  ],
  "2024-10-14": [
    { title: "Contact customers w...", color: "#FFE5B4" },
    { title: "Task detail modal", color: "#FFD2D2" },
    { title: "Reporting: Design co...", color: "#D5E4FF" }
  ]
};

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 9, 1)); // October 2024

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startOffset = (firstDay.getDay() + 6) % 7; // Mon-based
  const totalCells = startOffset + lastDay.getDate();

  const days = Array.from({ length: totalCells });

  const changeMonth = (dir) => {
    setCurrentDate(new Date(year, month + dir, 1));
  };

  return (
    <div style={styles.wrapper}>

      {/* HEADER */}
      <div style={styles.header}>
        <h3 style={{ margin: 0 }}>
          {currentDate.toLocaleString("default", { month: "long" })} {year}
        </h3>

        <div style={styles.controls}>
          <button onClick={() => changeMonth(-1)}>‹</button>
          <button onClick={() => setCurrentDate(new Date())}>Today</button>
          <button onClick={() => changeMonth(1)}>›</button>
        </div>
      </div>

      {/* WEEK DAYS */}
      <div style={styles.weekRow}>
        {WEEK_DAYS.map(d => (
          <div key={d} style={styles.weekDay}>{d}</div>
        ))}
      </div>

      {/* GRID */}
      <div style={styles.grid}>
        {days.map((_, i) => {
          const dateNum = i - startOffset + 1;
          if (dateNum <= 0) return <div key={i} />;

          const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(dateNum).padStart(2, "0")}`;
          const events = SAMPLE_EVENTS[dateKey] || [];

          return (
            <div key={i} style={styles.cell}>
              <div style={styles.date}>{dateNum}</div>

              {events.map((e, idx) => (
                <div
                  key={idx}
                  style={{ ...styles.event, background: e.color }}
                >
                  {e.title}
                </div>
              ))}
            </div>
          );
        })}
      </div>

    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  wrapper: {
    background: "#fff",
    borderRadius: 12,
    border: "1px solid #e5e5e5",
    padding: 16
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12
  },

  controls: {
    display: "flex",
    gap: 8
  },

  weekRow: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    marginBottom: 6,
    fontWeight: 600,
    fontSize: 13
  },

  weekDay: {
    textAlign: "center",
    color: "#666"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gridAutoRows: "120px",
    gap: 6
  },

  cell: {
    border: "1px solid #eee",
    borderRadius: 8,
    padding: 6,
    fontSize: 12,
    position: "relative"
  },

  date: {
    fontWeight: 600,
    marginBottom: 4
  },

  event: {
    borderRadius: 6,
    padding: "3px 6px",
    fontSize: 11,
    marginBottom: 4,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  }
};
