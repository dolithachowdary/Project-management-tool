import React, { useEffect, useState } from "react";
import { getTasks } from "../api/tasks";
import { getAssignableUsers } from "../api/users";
import { getProjects } from "../api/projects";
import Loader from "./Loader";
import Avatar from "./Avatar";
import DatePicker from "./DatePicker";
import { format, isWithinInterval, startOfDay, endOfDay, parseISO, addDays, subDays } from "date-fns";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

export default function PMTimeline() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedProject, setSelectedProject] = useState("all");
  const [selectedMember, setSelectedMember] = useState("all");

  // Time in timeline starts from 10 am to 6 pm
  const hours = [
    "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM"
  ];

  const startHour = 10;
  const endHour = 18;
  const totalHours = endHour - startHour;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [tasksRes, usersRes, projectsRes] = await Promise.all([
          getTasks(),
          getAssignableUsers().catch(() => ({ data: [] })),
          getProjects().catch(() => ({ data: [] }))
        ]);

        const tasksData = tasksRes.data?.data || tasksRes.data || [];
        const usersData = resDataToArray(usersRes);
        const projectsData = projectsRes.data?.data || projectsRes.data || [];

        setUsers(usersData);
        setProjects(projectsData);

        const currentDay = parseISO(selectedDate);
        const dayStart = startOfDay(currentDay);
        const dayEnd = endOfDay(currentDay);

        // Group tasks by assignee
        const userMap = {};
        usersData.forEach(u => {
          userMap[u.id || u._id] = {
            id: u.id || u._id,
            name: u.full_name || u.name,
            role: u.role,
            avatar: u.avatar_url,
            tasks: []
          };
        });

        tasksData.forEach(t => {
          const aid = t.assignee_id || t.assigned_to_id || t.assignedTo;
          if (userMap[aid]) {
            const startStr = t.start_date || t.startDate;
            const endStr = t.end_date || t.endDate;
            if (!startStr || !endStr) return;

            const taskStart = parseISO(startStr);
            const taskEnd = parseISO(endStr);

            // Check if task overlaps with selected date
            const isToday = isWithinInterval(dayStart, { start: taskStart, end: taskEnd }) ||
              isWithinInterval(dayEnd, { start: taskStart, end: taskEnd }) ||
              (taskStart >= dayStart && taskEnd <= dayEnd);

            if (isToday) {
              // Apply Project Filter
              if (selectedProject !== "all" && String(t.project_id) !== String(selectedProject)) return;

              // Deduce a dummy time for visualization within the day
              const h = taskStart.getHours();
              const start = (h >= startHour && h < endHour) ? h : (10 + (Math.random() * 3));
              const duration = 1.5 + (Math.random() * 2);
              const end = Math.min(start + duration, 18);

              userMap[aid].tasks.push({
                title: t.title || t.taskName || "Untitled Task",
                start: start,
                end: end,
                color: t.project_color || t.color || "#3b82f6",
                durationLabel: `${formatTime(start)} - ${formatTime(end)}`
              });
            }
          }
        });

        let finalData = Object.values(userMap);

        // Apply Member Filter
        if (selectedMember !== "all") {
          finalData = finalData.filter(m => String(m.id) === String(selectedMember));
        }

        setData(finalData);

      } catch (err) {
        console.error("Timeline error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedDate, selectedProject, selectedMember]);

  const handlePrevDate = () => {
    setSelectedDate(prev => format(subDays(parseISO(prev), 1), "yyyy-MM-dd"));
  };

  const handleNextDate = () => {
    setSelectedDate(prev => format(addDays(parseISO(prev), 1), "yyyy-MM-dd"));
  };

  const resDataToArray = (res) => {
    const d = res.data?.data || res.data || [];
    return Array.isArray(d) ? d : [];
  };

  const getPos = (h) => ((h - startHour) / totalHours) * 100;

  const formatTime = (h) => {
    const hour = Math.floor(h);
    const m = Math.round((h - hour) * 60);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
    return `${displayHour}:${m.toString().padStart(2, "0")} ${ampm}`;
  };

  const hexToRGBA = (hex, opacity) => {
    if (!hex || typeof hex !== 'string') return `rgba(59, 130, 246, ${opacity})`;
    let r = 0, g = 0, b = 0;
    const cleanHex = hex.replace("#", "");
    if (cleanHex.length === 3) {
      r = parseInt(cleanHex[0] + cleanHex[0], 16);
      g = parseInt(cleanHex[1] + cleanHex[1], 16);
      b = parseInt(cleanHex[2] + cleanHex[2], 16);
    } else if (cleanHex.length === 6) {
      r = parseInt(cleanHex.substring(0, 2), 16);
      g = parseInt(cleanHex.substring(2, 4), 16);
      b = parseInt(cleanHex.substring(4, 6), 16);
    } else {
      return `rgba(59, 130, 246, ${opacity})`; // Fallback to blue
    }
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  if (loading) return <Loader />;

  return (
    <div style={styles.container}>
      <div style={styles.topRow}>
        <div style={styles.filterGroup}>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            style={styles.selectInput}
          >
            <option value="all">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <select
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            style={styles.selectInput}
          >
            <option value="all">All Members</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.full_name || u.name}</option>
            ))}
          </select>
        </div>

        <div style={styles.navGroup}>
          <button style={styles.navBtn} onClick={handlePrevDate} title="Previous Day">
            <ChevronLeft size={18} />
          </button>

          <div style={styles.dateSelectorWrapper}>
            <DatePicker
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              placeholder="Select Date"
            />
          </div>

          <button style={styles.navBtn} onClick={handleNextDate} title="Next Day">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div style={styles.header}>
        <div style={styles.memberHeader}>Team Members</div>
        <div style={styles.hours}>
          {hours.map(h => (
            <div key={h} style={styles.hour}>{h}</div>
          ))}
        </div>
      </div>

      <div style={styles.body}>
        <div style={styles.membersCol}>
          {data.map((m, i) => (
            <div key={i} style={styles.memberRow}>
              <div style={styles.memberInfo}>
                <Avatar name={m.name} id={m.id} src={m.avatar} size={32} />
                <div style={styles.memberName}>{m.name}</div>
              </div>
              <div style={styles.memberMeta}>{m.tasks.length} tasks assigned</div>
            </div>
          ))}
          {data.length === 0 && <div style={styles.empty}>No assigned tasks for this day</div>}
        </div>

        <div style={styles.timeline}>
          <div style={styles.grid}>
            {hours.map((_, i) => (
              <div key={i} style={styles.gridLine} />
            ))}
          </div>

          {data.map((member, rowIndex) => (
            <div key={rowIndex} style={styles.timelineRow}>
              {member.tasks.map((task, i) => (
                <div
                  key={i}
                  style={{
                    ...styles.task,
                    background: hexToRGBA(task.color, 0.15),
                    left: `${getPos(task.start)}%`,
                    width: `${getPos(task.end) - getPos(task.start)}%`,
                  }}
                  title={task.title}
                >
                  <div style={{ ...styles.colorAccent, background: task.color }} />
                  <div style={styles.taskContent}>
                    <div style={styles.taskTitle}>{task.title}</div>
                    <div style={styles.taskSubtitle}>{task.durationLabel}</div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: "#fff",
    border: "1px solid #f1f5f9",
    borderRadius: 20,
    padding: 24,
    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
    overflow: "hidden"
  },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  filterGroup: {
    display: "flex",
    gap: 12,
  },
  selectInput: {
    padding: "10px 16px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    background: "#fff",
    fontSize: "14px",
    fontWeight: "700",
    color: "#475569",
    cursor: "pointer",
    outline: "none",
    minWidth: 160,
    transition: "border-color 0.2s",
    "&:hover": { borderColor: "#C62828" }
  },
  navGroup: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: "10px",
    background: "#fff",
    border: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#64748b",
    cursor: "pointer",
    transition: "all 0.2s",
    "&:hover": {
      borderColor: "#C62828",
      color: "#C62828",
      background: "#fff1f1",
    }
  },
  dateSelectorWrapper: {
    width: 180,
  },
  header: {
    display: "flex",
    background: "#fcfdfe",
    borderTop: "1px solid #f1f5f9",
    borderBottom: "1px solid #e2e8f0",
    marginTop: 8,
  },
  memberHeader: {
    width: 220,
    fontWeight: 700,
    fontSize: 14,
    color: "#1e293b",
    padding: "12px 24px",
    borderRight: "1px solid #e2e8f0",
    boxSizing: "border-box",
  },
  hours: { flex: 1, display: "grid", gridTemplateColumns: "repeat(9, 1fr)" },
  hour: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: 700,
    color: "#64748b",
    borderRight: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 0",
  },
  body: { display: "flex", position: "relative" },
  membersCol: { width: 220, borderRight: "1px solid #f1f5f9" },
  memberRow: { height: 70, display: "flex", flexDirection: "column", justifyContent: "center", borderBottom: "1px solid #f1f5f9", paddingRight: 16 },
  memberInfo: { display: "flex", alignItems: "center", gap: 12 },
  memberName: { fontWeight: 700, fontSize: 14, color: "#1e293b" },
  memberMeta: { fontSize: 12, color: "#94a3b8", marginTop: 4, paddingLeft: 44 },
  timeline: { flex: 1, position: "relative", minHeight: 450 },
  grid: { position: "absolute", inset: 0, display: "grid", gridTemplateColumns: "repeat(9, 1fr)" },
  gridLine: { borderRight: "1px solid #e2e8f0" },
  timelineRow: { position: "relative", height: 70, borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center" },
  task: {
    position: "absolute",
    height: 48,
    borderRadius: "8px",
    padding: "0 12px",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    zIndex: 2,
    overflow: "hidden",
    padding: 0,
  },
  colorAccent: {
    width: 6,
    height: "100%",
    flexShrink: 0,
  },
  taskContent: {
    padding: "0 10px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    overflow: "hidden",
  },
  taskTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: "#1e293b",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  taskSubtitle: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: 500,
  },
  empty: { padding: 60, textAlign: "center", color: "#94a3b8", width: "100%" }
};

