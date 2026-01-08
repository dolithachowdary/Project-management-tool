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
import { X, Clock, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import PriorityBadge from "./PriorityBadge";

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

const DailyTasksModal = ({ day, tasks, onClose }) => {
  if (!day) return null;

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <div style={styles.modalHeaderInfo}>
            <div style={styles.modalDay}>{format(day, "d")}</div>
            <div>
              <h3 style={styles.modalTitle}>{format(day, "EEEE")}</h3>
              <div style={styles.modalDate}>{format(day, "MMMM yyyy")}</div>
            </div>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div style={styles.modalBody}>
          {tasks.length === 0 ? (
            <div style={styles.emptyState}>
              <CalendarIcon size={48} color="#cbd5e1" strokeWidth={1} style={{ marginBottom: 16 }} />
              <div>No tasks scheduled for this day</div>
            </div>
          ) : (
            <div style={styles.taskList}>
              {tasks.map((t, idx) => (
                <div key={idx} style={styles.teamsTaskCard}>
                  <div style={{ ...styles.teamsAccentStrip, background: t.project_color || "#3b82f6" }} />
                  <div style={styles.teamsCardContent}>
                    <div style={styles.teamsTimeRow}>
                      <Clock size={14} color="#64748b" />
                      <span style={styles.teamsTimeText}>
                        {t.start_date ? format(parseISO(t.start_date), "MMM d") : ""}
                        {t.end_date && t.end_date !== t.start_date ? ` - ${format(parseISO(t.end_date), "MMM d")}` : ""}
                      </span>
                    </div>
                    <div style={styles.teamsTitle}>{t.title}</div>
                    <div style={styles.teamsFooter}>
                      <span style={styles.teamsProject}>{t.project_name || "General Project"}</span>
                      <PriorityBadge priority={t.priority} style={{ fontSize: 10, padding: "2px 8px" }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    const fetchMyTasks = async () => {
      try {
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

  const activeDayTasks = selectedDay ? getDayTasks(selectedDay) : [];

  const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <>
      <div style={styles.wrapper}>
        {/* HEADER */}
        <div style={styles.header}>
          <h3 style={styles.monthTitle}>
            {format(currentMonth, "MMMM yyyy")}
          </h3>

          <div style={styles.controls}>
            <button style={styles.navBtn} onClick={prevMonth}><ChevronLeft size={20} /></button>
            <button style={styles.todayBtn} onClick={goToToday}>Today</button>
            <button style={styles.navBtn} onClick={nextMonth}><ChevronRight size={20} /></button>
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
            // Limit to 1 task
            const displayTasks = dayTasks.slice(0, 1);
            const remainingCount = dayTasks.length - 1;

            return (
              <div
                key={i}
                style={{
                  ...styles.cell,
                  opacity: isCurrentMonth ? 1 : 0.4,
                  backgroundColor: isSameDay(day, new Date()) ? "#fff" : "transparent",
                  borderColor: isSameDay(day, new Date()) ? "#2563eb" : "#f1f5f9",
                  cursor: dayTasks.length > 0 ? "pointer" : "default"
                }}
                onClick={() => {
                  if (dayTasks.length > 0) setSelectedDay(day);
                }}
              >
                <div style={{
                  ...styles.date,
                  color: isSameDay(day, new Date()) ? "#2563eb" : "#1e293b",
                  fontWeight: isSameDay(day, new Date()) ? 800 : 600
                }}>
                  {format(day, "d")}
                </div>

                <div style={styles.eventsContainer}>
                  {displayTasks.map((t, idx) => (
                    <div
                      key={idx}
                      style={{
                        ...styles.event,
                        background: hexToRGBA(t.project_color || "#3b82f6", 0.12),
                        borderLeft: `3px solid ${t.project_color || "#3b82f6"}`,
                        color: "#1e293b"
                      }}
                      title={t.title}
                    >
                      {t.title}
                    </div>
                  ))}
                  {remainingCount > 0 && (
                    <div style={styles.moreIndicator}>
                      +{remainingCount}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedDay && (
        <DailyTasksModal
          day={selectedDay}
          tasks={activeDayTasks}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </>
  );
}

/* ================= STYLES ================= */

const styles = {
  wrapper: {
    background: "#fff",
    borderRadius: 24,
    border: "1px solid #e2e8f0",
    padding: 24,
    height: "calc(100vh - 160px)",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 4px 24px rgba(0,0,0,0.02)",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24
  },

  monthTitle: {
    margin: 0,
    fontSize: 22,
    fontWeight: 800,
    color: "#0f172a",
    letterSpacing: "-0.5px"
  },

  controls: {
    display: "flex",
    gap: 8
  },

  navBtn: {
    width: 36,
    height: 36,
    borderRadius: "10px",
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
      borderColor: "#2563eb",
      color: "#2563eb",
      background: "#eff6ff"
    }
  },

  todayBtn: {
    padding: "0 16px",
    height: 36,
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    background: "#fff",
    color: "#475569",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
    ":hover": {
      borderColor: "#2563eb",
      color: "#2563eb",
      background: "#eff6ff"
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
    fontSize: 11,
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
    padding: 8,
    fontSize: 12,
    display: "flex",
    flexDirection: "column",
    gap: 6,
    overflow: "hidden",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    ":hover": {
      backgroundColor: "#f8fafc",
      transform: "translateY(-1px)",
      boxShadow: "0 4px 12px rgba(0,0,0,0.03)"
    }
  },

  date: {
    fontWeight: 600,
    fontSize: 13,
    marginBottom: 4,
    width: 24,
    height: 24,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%"
  },

  eventsContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 4
  },

  event: {
    borderRadius: 6, // more pill-like
    padding: "6px 10px",
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
    lineHeight: 1.3
  },

  moreIndicator: {
    fontSize: 10,
    fontWeight: 700,
    color: "#64748b",
    background: "#f1f5f9",
    padding: "2px 8px",
    borderRadius: 12,
    alignSelf: "flex-start",
    marginTop: 2
  },

  // Teams-like Modal Styles
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.4)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  modalContent: {
    background: "#fff",
    borderRadius: 16,
    width: "480px",
    maxWidth: "90%",
    maxHeight: "85vh",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 20px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)",
    overflow: "hidden",
    animation: "modalFadeIn 0.2s ease-out"
  },
  modalHeader: {
    padding: "24px 32px",
    background: "#fff",
    borderBottom: "1px solid #f1f5f9",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  modalHeaderInfo: {
    display: "flex",
    gap: 16,
    alignItems: "center"
  },
  modalDay: {
    fontSize: 32,
    fontWeight: 800,
    color: "#2563eb",
    lineHeight: 1
  },
  modalTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 700,
    color: "#0f172a",
  },
  modalDate: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 2
  },
  closeBtn: {
    background: "#f8fafc",
    border: "none",
    borderRadius: 8,
    width: 32,
    height: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#64748b",
    transition: "all 0.2s",
    ":hover": { background: "#e2e8f0", color: "#0f172a" }
  },
  modalBody: {
    padding: "24px 32px",
    overflowY: "auto",
    flex: 1,
    background: "#fcfdfe"
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 0",
    color: "#94a3b8",
    fontWeight: 500
  },
  taskList: {
    display: "flex",
    flexDirection: "column",
    gap: 16
  },
  teamsTaskCard: {
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 2px 8px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.02)",
    overflow: "hidden",
    display: "flex",
    transition: "transform 0.2s",
    ":hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 8px 16px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.02)"
    }
  },
  teamsAccentStrip: {
    width: 4,
    flexShrink: 0
  },
  teamsCardContent: {
    padding: 16,
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 8
  },
  teamsTimeRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    color: "#64748b",
    fontWeight: 600
  },
  teamsTimeText: {
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },
  teamsTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: "#0f172a",
    lineHeight: 1.4
  },
  teamsFooter: {
    marginTop: 4,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderTop: "1px solid #f8fafc",
    paddingTop: 12
  },
  teamsProject: {
    fontSize: 11,
    fontWeight: 600,
    color: "#64748b",
    background: "#f1f5f9",
    padding: "2px 8px",
    borderRadius: 6
  }
};
