import React, { useState, useEffect } from "react";
import { getTasks } from "../api/tasks";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  parseISO,
  addMonths,
  subMonths
} from "date-fns";

const hexToRGBA = (hex, opacity) => {
  if (!hex || typeof hex !== 'string') return `rgba(79, 125, 255, ${opacity})`;
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyTasks = async () => {
      try {
        setLoading(true);
        const userData = JSON.parse(localStorage.getItem("userData") || "{}");
        const myId = userData.id || userData._id;

        const res = await getTasks();
        const allTasks = res.data?.data || res.data || [];

        // Filter tasks assigned to current user
        const filtered = allTasks.filter(t => {
          const aid = t.assignee_id || t.assigned_to_id || t.assignedTo;
          return String(aid) === String(myId);
        });

        setTasks(filtered);
      } catch (err) {
        console.error("Failed to fetch calendar tasks:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyTasks();
  }, []);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  const getDayTasks = (day) => {
    return tasks.filter(t => {
      const tStart = parseISO(t.start_date || t.startDate);
      const tEnd = parseISO(t.end_date || t.endDate);
      return isSameDay(day, tStart) || isSameDay(day, tEnd) || (day >= tStart && day <= tEnd);
    });
  };

  const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div style={styles.wrapper}>
      {/* HEADER */}
      <div style={styles.header}>
        <h3 style={styles.monthTitle}>
          {format(currentMonth, "MMMM yyyy")}
        </h3>

        <div style={styles.controls}>
          <button style={styles.navBtn} onClick={prevMonth}>‹</button>
          <button style={styles.todayBtn} onClick={goToToday}>Today</button>
          <button style={styles.navBtn} onClick={nextMonth}>›</button>
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
        {calendarDays.map((day, i) => {
          const isCurrentMonth = isSameDay(startOfMonth(day), monthStart);
          const dayTasks = getDayTasks(day);

          return (
            <div key={i} style={{
              ...styles.cell,
              opacity: isCurrentMonth ? 1 : 0.4,
              backgroundColor: isSameDay(day, new Date()) ? "#fcfdfe" : "transparent"
            }}>
              <div style={{
                ...styles.date,
                color: isSameDay(day, new Date()) ? "#C62828" : "#1e293b"
              }}>
                {format(day, "d")}
              </div>

              <div style={styles.eventsContainer}>
                {dayTasks.map((t, idx) => (
                  <div
                    key={idx}
                    style={{
                      ...styles.event,
                      background: hexToRGBA(t.project_color || "#3b82f6", 0.15),
                      borderLeft: `3px solid ${t.project_color || "#3b82f6"}`,
                      color: "#1e293b"
                    }}
                    title={t.title}
                  >
                    {t.title}
                  </div>
                ))}
              </div>
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
    borderRadius: 20,
    border: "1px solid #f1f5f9",
    padding: 24,
    height: "calc(100vh - 200px)",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24
  },

  monthTitle: {
    margin: 0,
    fontSize: 20,
    fontWeight: 700,
    color: "#1e293b"
  },

  controls: {
    display: "flex",
    gap: 12
  },

  navBtn: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    border: "1px solid #e2e8f0",
    background: "#fff",
    color: "#64748b",
    fontSize: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s",
    ":hover": {
      borderColor: "#C62828",
      color: "#C62828",
      background: "#fff1f1"
    }
  },

  todayBtn: {
    padding: "0 16px",
    height: 32,
    borderRadius: 16,
    border: "1px solid #e2e8f0",
    background: "#fff",
    color: "#64748b",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
    ":hover": {
      borderColor: "#C62828",
      color: "#C62828",
      background: "#fff1f1"
    }
  },

  weekRow: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    marginBottom: 12,
  },

  weekDay: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.05em"
  },

  grid: {
    flex: 1,
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gridTemplateRows: "repeat(5, 1fr)",
    gap: 8,
    minHeight: 0
  },

  cell: {
    border: "1px solid #f1f5f9",
    borderRadius: 12,
    padding: 10,
    fontSize: 12,
    display: "flex",
    flexDirection: "column",
    gap: 6,
    overflow: "hidden"
  },

  date: {
    fontWeight: 700,
    fontSize: 14,
    marginBottom: 2
  },

  eventsContainer: {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 4,
    msOverflowStyle: "none",
    scrollbarWidth: "none",
    "&::-webkit-scrollbar": { display: "none" }
  },

  event: {
    borderRadius: 6,
    padding: "4px 8px",
    fontSize: 11,
    fontWeight: 600,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  }
};
