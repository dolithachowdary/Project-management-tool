import React, { useEffect, useState } from "react";
import { getTasks } from "../api/tasks";
import { getAssignableUsers } from "../api/users";
import Loader from "./Loader";

export default function PMTimeline() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  const hours = [
    "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM"
  ];

  const startHour = 9;
  const endHour = 18;
  const totalHours = endHour - startHour;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [tasksRes, usersRes] = await Promise.all([
          getTasks(),
          getAssignableUsers().catch(() => ({ data: [] }))
        ]);

        const tasksData = tasksRes.data?.data || tasksRes.data || [];
        const usersData = usersRes.data?.data || usersRes.data || [];

        // Group tasks by assignee
        const userMap = {};
        usersData.forEach(u => {
          userMap[u.id || u._id] = {
            name: u.full_name || u.name,
            role: u.role,
            tasks: []
          };
        });

        tasksData.forEach(t => {
          const aid = t.assignee_id || t.assigned_to_id || t.assignedTo;
          if (userMap[aid]) {
            // Deduce a dummy time for visualization since backend might not provide start/end hours
            // In a real app, tasks would have start_time/end_time
            const date = new Date(t.start_date || t.startDate || new Date());
            const h = date.getHours();
            const start = h >= startHour && h < endHour ? h : (9 + (Math.random() * 4));
            const duration = 2 + (Math.random() * 2);

            userMap[aid].tasks.push({
              title: t.title || t.taskName,
              start: start,
              end: Math.min(start + duration, 18),
              color: getRandomColor(t.id || t._id)
            });
          }
        });

        setData(Object.values(userMap).filter(u => u.tasks.length > 0));

      } catch (err) {
        console.error("Timeline error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getRandomColor = (id) => {
    const colors = ["#e0e7ff", "#dcfce7", "#fef9c3", "#ffedd5", "#fce7f3", "#f1f5f9"];
    const index = (id || "").toString().length;
    return colors[index % colors.length];
  };

  const getPos = (h) => ((h - startHour) / totalHours) * 100;

  if (loading) return <Loader />;

  return (
    <div style={styles.container}>
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
              <div style={styles.memberName}>{m.name}</div>
              <div style={styles.memberMeta}>{m.tasks.length} tasks assigned</div>
            </div>
          ))}
          {data.length === 0 && <div style={styles.empty}>No assigned tasks</div>}
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
                    background: task.color,
                    left: `${getPos(task.start)}%`,
                    width: `${getPos(task.end) - getPos(task.start)}%`,
                    borderLeft: `3px solid #6366f1`
                  }}
                  title={task.title}
                >
                  {task.title}
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
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
    overflow: "hidden"
  },
  header: { display: "flex", marginBottom: 16, borderBottom: "1px solid #f1f5f9", paddingBottom: 12 },
  memberHeader: { width: 220, fontWeight: 700, fontSize: 14, color: "#1e293b" },
  hours: { flex: 1, display: "grid", gridTemplateColumns: "repeat(10, 1fr)" },
  hour: { textAlign: "center", fontSize: 11, fontWeight: 600, color: "#64748b" },
  body: { display: "flex", position: "relative" },
  membersCol: { width: 220, borderRight: "1px solid #f1f5f9" },
  memberRow: { height: 80, display: "flex", flexDirection: "column", justifyContent: "center", borderBottom: "1px solid #f8fafc", paddingRight: 16 },
  memberName: { fontWeight: 600, fontSize: 13, color: "#1e293b" },
  memberMeta: { fontSize: 11, color: "#94a3b8", marginTop: 2 },
  timeline: { flex: 1, position: "relative", minHeight: 400 },
  grid: { position: "absolute", inset: 0, display: "grid", gridTemplateColumns: "repeat(10, 1fr)" },
  gridLine: { borderRight: "1px solid #f8fafc" },
  timelineRow: { position: "relative", height: 80, borderBottom: "1px solid #f8fafc" },
  task: {
    position: "absolute",
    top: 20,
    height: 40,
    borderRadius: 8,
    padding: "0 12px",
    display: "flex",
    alignItems: "center",
    fontSize: 12,
    fontWeight: 600,
    color: "#334155",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
    zIndex: 2,
  },
  empty: { padding: 40, color: "#94a3b8", fontSize: 14 }
};
