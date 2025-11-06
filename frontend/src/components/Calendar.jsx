import React, { useState } from "react";
 
const Calendar = () => {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
 
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
 
  const changeMonth = (offset) => {
    const newMonth = month + offset;
    if (newMonth < 0) {
      setMonth(11);
      setYear(year - 1);
    } else if (newMonth > 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(newMonth);
    }
  };
 
  const days = [...Array(firstDay).fill(null), ...Array(daysInMonth).fill().map((_, i) => i + 1)];
 
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => changeMonth(-1)} style={styles.btn}>◀</button>
        <h3>{monthNames[month]} {year}</h3>
        <button onClick={() => changeMonth(1)} style={styles.btn}>▶</button>
      </div>
 
      <div style={styles.grid}>
        {daysOfWeek.map((d) => (
          <div key={d} style={{ fontWeight: "bold", color: "#c62828" }}>{d}</div>
        ))}
        {days.map((day, i) => (
          <div key={i} style={{ color: day ? "#111" : "transparent" }}>
            {day}
          </div>
        ))}
      </div>
    </div>
  );
};
 
const styles = {
  container: {
    padding: "10px",
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  btn: {
    backgroundColor: "#c62828",
    color: "white",
    border: "none",
    borderRadius: "5px",
    padding: "5px 10px",
    cursor: "pointer",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "5px",
    textAlign: "center",
  },
};
 
export default Calendar;