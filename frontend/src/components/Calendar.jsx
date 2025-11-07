import React, { useState } from "react";
<<<<<<< HEAD
import "./Calendar.css"; // ✅ Correct import for your CSS file name
=======
>>>>>>> 8e0d0990b6cadb9df65d014f74ee22d6cf4e9a70

const Calendar = () => {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
<<<<<<< HEAD
  const [selectedDate, setSelectedDate] = useState(null);

  // 🔹 Mock data for now (frontend only)
  const tasks = [
    { id: 1, name: "Design Homepage", project: "Website Revamp", dueDate: "2025-11-07", status: "Pending" },
    { id: 2, name: "Fix Login Bug", project: "Mobile App UI", dueDate: "2025-11-07", status: "Pending" },
    { id: 3, name: "Database Audit", project: "Security Upgrade", dueDate: "2025-11-08", status: "Completed" },
    { id: 4, name: "Client Review", project: "Client Onboarding", dueDate: "2025-11-09", status: "Pending" },
  ];

=======
>>>>>>> 8e0d0990b6cadb9df65d014f74ee22d6cf4e9a70
  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];
<<<<<<< HEAD
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

=======
  const daysOfWeek = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
>>>>>>> 8e0d0990b6cadb9df65d014f74ee22d6cf4e9a70
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const changeMonth = (offset) => {
    const newMonth = month + offset;
    if (newMonth < 0) {
      setMonth(11); setYear(year - 1);
    } else if (newMonth > 11) {
<<<<<<< HEAD
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(newMonth);
    }
    setSelectedDate(null);
  };

  const days = [
    ...Array(firstDay).fill(null),
    ...Array(daysInMonth).fill().map((_, i) => i + 1)
  ];

  const handleDateClick = (day) => {
    if (!day) return;
    const clickedDate = new Date(year, month, day)
      .toISOString()
      .split("T")[0];
    setSelectedDate(clickedDate);
  };

  const pendingTasks = tasks.filter(
    (t) => t.dueDate === selectedDate && t.status === "Pending"
  );

  return (
    <div className="calendar-container">
      {/* ===== Header ===== */}
      <div className="calendar-header">
        <button className="nav-btn" onClick={() => changeMonth(-1)}>◀</button>
        <h3 className="calendar-title">
          {monthNames[month]} {year}
        </h3>
        <button className="nav-btn" onClick={() => changeMonth(1)}>▶</button>
      </div>

      {/* ===== Calendar Grid ===== */}
      <div className="calendar-grid">
        {daysOfWeek.map((day) => (
          <div key={day} className="calendar-day-name">{day}</div>
=======
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
>>>>>>> 8e0d0990b6cadb9df65d014f74ee22d6cf4e9a70
        ))}

        {days.map((day, i) => {
          if (!day) return <div key={i} className="calendar-day empty"></div>;

          const dateStr = new Date(year, month, day).toISOString().split("T")[0];
          const hasPending = tasks.some(
            (t) => t.dueDate === dateStr && t.status === "Pending"
          );

          let dayClass = "calendar-day";
          if (dateStr === selectedDate) dayClass += " selected";
          if (
            dateStr === today.toISOString().split("T")[0] &&
            month === today.getMonth() &&
            year === today.getFullYear()
          )
            dayClass += " today";

          return (
            <div
              key={i}
              className={dayClass}
              onClick={() => handleDateClick(day)}
              style={
                hasPending
                  ? { border: "1px solid #b71c1c", fontWeight: "500" }
                  : {}
              }
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* ===== Pending Tasks Section ===== */}
      <div className="calendar-tasks">
        {selectedDate ? (
          <>
            <h4>Pending Tasks for {selectedDate}</h4>
            {pendingTasks.length > 0 ? (
              pendingTasks.map((task) => (
                <div key={task.id} className="task-card">
                  <strong>{task.name}</strong>
                  <p>{task.project}</p>
                  <span className="task-badge">Pending</span>
                </div>
              ))
            ) : (
              <p style={{ color: "#666" }}>No pending tasks 🎉</p>
            )}
          </>
        ) : (
          <p style={{ color: "#888" }}>Click a date to view pending tasks</p>
        )}
      </div>
    </div>
  );
};

<<<<<<< HEAD
=======
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

>>>>>>> 8e0d0990b6cadb9df65d014f74ee22d6cf4e9a70
export default Calendar;
