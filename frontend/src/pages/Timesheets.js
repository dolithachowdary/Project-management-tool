import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { FaSearch, FaSlidersH, FaCalendarAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import { DateRange } from "react-date-range";
import { format } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";


const Timesheets = ({ role = "Project Manager", tasks = [] }) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef(null);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date("2028-09-25"),
      endDate: new Date("2028-10-07"),
      key: "selection",
    },
  ]);

  // close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sampleTasks = [
    {
      id: 1,
      project: "Event Masters Event Branding & Coordination",
      startDate: "2028-09-25",
      endDate: "2028-09-30",
      category: "Graphics",
      status: "Completed",
      users: ["A", "B", "C"],
    },
    {
      id: 2,
      project: "Enterprise Solutions Custom CRM UI/UX Design",
      startDate: "2028-10-02",
      endDate: "2028-10-07",
      category: "UI Kits",
      status: "In Progress",
      users: ["A", "B"],
    },
    {
      id: 3,
      project: "Connect Corp. Social Media Content Creation",
      startDate: "2028-10-04",
      endDate: "2028-10-07",
      category: "Mockups",
      status: "Upcoming",
      users: ["C"],
    },
    {
      id: 4,
      project: "BrightTech App Logo Concepts",
      startDate: "2028-10-01",
      endDate: "2028-10-03",
      category: "Illustrations",
      status: "In Review",
      users: ["D", "E"],
    },
  ];

  const data = tasks.length ? tasks : sampleTasks;

  // === Color generation (unique per project) ===
  const colorPalette = ["#64B5F6", "#FFD54F", "#FF8A65", "#81C784", "#BA68C8", "#4DB6AC"];
  const getColorByProject = (name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colorPalette[Math.abs(hash) % colorPalette.length];
  };

  // === Date calculations ===
  const minDate = dateRange[0].startDate;
  const maxDate = dateRange[0].endDate;
  const totalDays = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) + 1;

  const timelineDays = Array.from({ length: totalDays }, (_, i) => {
    const d = new Date(minDate);
    d.setDate(minDate.getDate() + i);
    return d;
  });

  const dayWidth = 100;
  const getOffset = (start) => (new Date(start) - minDate) / (1000 * 60 * 60 * 24) * dayWidth;
  const getWidth = (start, end) =>
    ((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24) + 1) * dayWidth;

  // === Group days by month ===
  const groupedMonths = [];
  let currentMonth = timelineDays[0].getMonth();
  let monthStart = 0;
  timelineDays.forEach((d, i) => {
    if (d.getMonth() !== currentMonth || i === timelineDays.length - 1) {
      const monthEnd = i === timelineDays.length - 1 ? i + 1 : i;
      groupedMonths.push({ month: currentMonth, start: monthStart, end: monthEnd });
      currentMonth = d.getMonth();
      monthStart = i;
    }
  });

  return (
    <div style={styles.pageContainer}>
      <Sidebar />
      <div style={styles.mainContent}>
        <Header role={role} />
        <div style={styles.pageInner}>
          <h2 style={styles.pageTitle}>Timesheets</h2>

          {/* === Toolbar === */}
          <div style={styles.toolbar}>
            <div style={styles.searchContainer}>
              <FaSearch style={styles.searchIcon} />
              <input type="text" placeholder="Search tasks" style={styles.searchInput} />
            </div>

            <div style={styles.rightControls}>
              {/* === Date Range Selector === */}
              <div style={styles.pill} onClick={() => setShowCalendar(!showCalendar)}>
                <FaCalendarAlt style={{ color: "#555", fontSize: "14px" }} />
                <span>
                  {format(minDate, "dd MMMM yyyy")} – {format(maxDate, "dd MMMM yyyy")}
                </span>
              </div>

              {showCalendar && (
                <div ref={calendarRef} style={styles.calendarPopup}>
                  <DateRange
                    editableDateInputs={true}
                    onChange={(item) => setDateRange([item.selection])}
                    moveRangeOnFirstSelection={false}
                    ranges={dateRange}
                    months={2}
                    direction="horizontal"
                  />
                </div>
              )}

              {/* === Filter === */}
              <div style={styles.pill}>
                <FaSlidersH style={{ color: "#555", fontSize: "14px" }} />
                <span>Filter</span>
              </div>
            </div>
          </div>

          {/* === Timeline === */}
          <div style={styles.timelineContainer}>
            <div style={styles.monthLabels}>
              {groupedMonths.map((m, i) => {
                const monthName = new Date(timelineDays[m.start]).toLocaleDateString("en-US", {
                  month: "long",
                });
                const width = (m.end - m.start) * dayWidth;
                return (
                  <div key={i} style={{ ...styles.monthBlock, width }}>
                    {monthName}
                  </div>
                );
              })}
            </div>

            <div style={styles.datesRow}>
              {timelineDays.map((date, i) => (
                <div key={i} style={styles.dateCell}>
                  <p style={styles.dayName}>{date.toLocaleDateString("en-US", { weekday: "short" })}</p>
                  <p style={styles.dayNumber}>{date.getDate()}</p>
                </div>
              ))}
            </div>

            <div style={styles.gridLines}>
              {timelineDays.map((_, i) => (
                <div key={i} style={{ ...styles.gridLine, left: `${i * dayWidth}px` }} />
              ))}
            </div>

            <div style={styles.tasksWrapper}>
              {data.map((task, index) => {
                const color = getColorByProject(task.project);
                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    style={{
                      ...styles.taskItem,
                      top: `${index * 100}px`,
                      left: `${getOffset(task.startDate)}px`,
                      width: `${getWidth(task.startDate, task.endDate)}px`,
                      backgroundColor: color,
                    }}
                  >
                    <div style={styles.taskHeader}>
                      <span style={styles.taskTitle}>{task.project}</span>
                      <span style={styles.statusBadge}>{task.status}</span>
                    </div>
                    <p style={styles.taskMeta}>
                      {format(new Date(task.startDate), "dd MMM")} -{" "}
                      {format(new Date(task.endDate), "dd MMM")} • {task.category}
                    </p>
                    <div style={styles.userContainer}>
                      {task.users.map((u, i) => (
                        <div key={i} style={styles.userAvatar}>
                          {u}
                        </div>
                      ))}
                      <div style={styles.plusAvatar}>+</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// === Styles ===
const styles = {
  pageContainer: { display: "flex", backgroundColor: "#f9f9f9", height: "100vh", overflow: "hidden" },
  mainContent: { flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" },
  pageInner: { padding: "30px" },
  pageTitle: { fontSize: "1.5rem", fontWeight: 600, color: "#222", marginBottom: "25px" },
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#fff",
    padding: "15px 20px",
    borderRadius: "10px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    marginBottom: "25px",
    position: "relative",
  },
  searchContainer: { position: "relative" },
  searchIcon: { position: "absolute", top: "10px", left: "10px", color: "#999", fontSize: "14px" },
  searchInput: {
    padding: "8px 8px 8px 30px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "14px",
    width: "220px",
  },
  rightControls: { display: "flex", alignItems: "center", gap: "12px" },
  pill: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 14px",
    border: "1px solid #ddd",
    borderRadius: "30px",
    backgroundColor: "#fff",
    fontSize: "13px",
    color: "#333",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  calendarPopup: {
    position: "absolute",
    top: "60px",
    right: "120px",
    zIndex: 100,
    background: "#fff",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
  },
  monthLabels: { display: "flex", borderBottom: "1px solid #eee", fontWeight: 600, color: "#333", fontSize: "15px" },
  monthBlock: { textAlign: "center", padding: "12px 0 8px 0", borderRight: "1px solid #f0f0f0" },
  timelineContainer: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    padding: "0 0 40px 0",
    position: "relative",
    overflowX: "auto",
    minHeight: "600px",
  },
  datesRow: { display: "flex", minWidth: "max-content", alignItems: "center", padding: "10px 0" },
  dateCell: { minWidth: "100px", textAlign: "center" },
  dayName: { color: "#555", fontSize: "13px", margin: 0 },
  dayNumber: { fontWeight: "bold", color: "#222", fontSize: "14px", margin: 0 },
  gridLines: { position: "absolute", top: "70px", bottom: "0", left: "0", right: "0" },
  gridLine: { position: "absolute", width: "1px", backgroundColor: "#eee", top: 0, bottom: 0 },
  tasksWrapper: { position: "relative", minWidth: "max-content", marginTop: "20px" },
  taskItem: {
    position: "absolute",
    borderRadius: "14px",
    color: "#fff",
    padding: "12px 16px",
    boxShadow: "0 3px 8px rgba(0,0,0,0.15)",
    cursor: "pointer",
  },
  taskHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "14px", fontWeight: "600" },
  taskTitle: { color: "#fff", flex: 1, marginRight: "10px" },
  statusBadge: {
    background: "rgba(255,255,255,0.9)",
    color: "#333",
    padding: "3px 8px",
    borderRadius: "8px",
    fontSize: "12px",
  },
  taskMeta: { fontSize: "12px", color: "#fff", marginTop: "4px", opacity: 0.9 },
  userContainer: { display: "flex", marginTop: "6px", alignItems: "center" },
  userAvatar: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    backgroundColor: "#f0f0f0",
    color: "#444",
    fontWeight: "600",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: "-8px",
    border: "2px solid #fff",
    fontSize: "12px",
  },
  plusAvatar: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    backgroundColor: "#fff",
    color: "#333",
    fontWeight: "bold",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: "-8px",
    border: "2px solid #fff",
  },
};

export default Timesheets;
