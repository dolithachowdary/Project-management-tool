import React, { useState } from "react";

const Calendar = () => {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];
  const daysOfWeek = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const changeMonth = (offset) => {
    const newMonth = month + offset;
    if (newMonth < 0) {
      setMonth(11); setYear(year - 1);
    } else if (newMonth > 11) {
      setMonth(0); setYear(year + 1);
    } else setMonth(newMonth);
  };

  const days = [...Array(firstDay).fill(null), ...Array(daysInMonth).fill().map((_, i) => i + 1)];

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <button onClick={() => changeMonth(-1)} style={styles.navBtn}>‹</button>
        <h3>{monthNames[month]} {year}</h3>
        <button onClick={() => changeMonth(1)} style={styles.navBtn}>›</button>
      </div>

      <div style={styles.grid}>
        {daysOfWeek.map((d) => (
          <div key={d} style={{ ...styles.day, fontWeight: "bold", color: "#c62828" }}>{d}</div>
        ))}
        {days.map((day, i) => (
          <div key={i} style={{
            ...styles.day,
            backgroundColor: day === today.getDate() && month === today.getMonth() ? "#FFEBEE" : "transparent",
            borderRadius: "10px",
          }}>
            {day}
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: "#fff",
    borderRadius: "15px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },
  navBtn: {
    background: "#fde0dc",
    border: "none",
    borderRadius: "8px",
    padding: "4px 8px",
    cursor: "pointer",
    color: "#c62828",
    fontWeight: "bold",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "10px",
    textAlign: "center",
  },
  day: {
    padding: "10px 0",
    fontSize: "0.9rem",
    color: "#333",
  },
};

export default Calendar;
