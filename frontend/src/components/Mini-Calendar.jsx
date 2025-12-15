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
    <div>
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
        {["S","M","T","W","T","F","S"].map(d => (
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
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  month: {
    fontWeight: 600,
    fontSize: 14,
  },

  navBtn: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: 18,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 6,
    textAlign: "center",
    fontSize: 12,
  },

  day: {
    fontWeight: 600,
    color: "#777",
  },

  date: {
    padding: "6px 0",
    borderRadius: 6,
    cursor: "pointer",
  },

  today: {
    background: "#C62828",
    color: "#fff",
    fontWeight: 600,
  },
};
