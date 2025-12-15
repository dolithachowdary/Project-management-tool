import React from "react";

export default function Calendar() {
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  return (
    <div style={styles.card}>
      <div style={styles.header}>November 2028</div>

      <div style={styles.grid}>
        {days.map(d => (
          <div key={d} style={styles.day}>{d}</div>
        ))}

        {[...Array(30)].map((_, i) => (
          <div key={i} style={styles.date}>{i + 1}</div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "#fff",
    borderRadius: 12,
    border: "1px solid #e5e5e5",
    padding: 14
  },
  header: {
    fontWeight: 600,
    marginBottom: 10
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 6,
    textAlign: "center",
    fontSize: 13
  },
  day: {
    fontWeight: 600,
    color: "#777"
  },
  date: {
    padding: "6px 0",
    borderRadius: 6,
    cursor: "pointer"
  }
};
