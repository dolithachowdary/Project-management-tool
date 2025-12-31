import React, { useEffect, useState } from "react";
import { getTasks } from "../api/tasks";
import Loader from "./Loader";
import { Search } from "lucide-react";

export default function QAPending() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const res = await getTasks();
        const data = res.data?.data || res.data || [];
        // Filter tasks that are in 'Review' or 'review'
        const pendingQA = data.filter(t => (t.status || "").toLowerCase() === "review");
        setTasks(pendingQA);
      } catch (err) {
        console.error("QA Pending fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const getRandomColor = (id) => {
    const colors = ["#ef4444", "#3b82f6", "#f59e0b", "#10b981", "#8b5cf6"];
    const index = (id || "").toString().length;
    return colors[index % colors.length];
  };

  if (loading) return (
    <div style={styles.card}>
      <div style={styles.header}>QA Pending Tasks</div>
      <div style={styles.loadingWrap}><Loader fullScreen={false} /></div>
    </div>
  );

  return (
    <div style={styles.card}>
      <div style={styles.header}>QA Pending Tasks</div>
      <div style={styles.sub}>{tasks.length} tasks ready for verification</div>

      <div style={styles.scrollArea}>
        {tasks.length === 0 ? (
          <div style={styles.empty}>
            <Search size={32} color="#e2e8f0" />
            <p>No tasks pending QA</p>
          </div>
        ) : (
          tasks.map((t) => (
            <div key={t.id} style={styles.row}>
              <div style={styles.iconWrap}>
                <div style={{ ...styles.iconCircle, background: getRandomColor(t.id) }}></div>
              </div>

              <div style={styles.textBlock}>
                <div style={styles.title}>{t.title || t.taskName}</div>
                <div style={styles.time}>{t.end_time || "End of day"}</div>
                <div style={styles.project}>{t.project_name || t.projectName}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  card: {
    border: "1px solid #f1f5f9",
    borderRadius: 16,
    padding: 20,
    background: "#fff",
    marginTop: 20,
    maxHeight: 400,
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
  },
  header: { fontSize: 16, fontWeight: 700, color: "#1e293b" },
  sub: { marginTop: 4, fontSize: 12, color: "#64748b", marginBottom: 12 },
  loadingWrap: { padding: 20 },
  scrollArea: {
    flex: 1,
    overflowY: "auto",
    paddingRight: 4,
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 0",
    borderBottom: "1px solid #f8fafc",
    "&:last-child": { borderBottom: "none" }
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  },
  iconCircle: {
    width: 14,
    height: 14,
    borderRadius: "50%"
  },
  textBlock: { display: "flex", flexDirection: "column", flex: 1, minWidth: 0 },
  title: { fontSize: 13, fontWeight: 600, color: "#334155", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  time: { fontSize: 11, marginTop: 2, color: "#94a3b8" },
  project: { fontSize: 11, marginTop: 1, color: "#6366f1", fontWeight: 500 },
  empty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "30px 0",
    color: "#94a3b8",
    fontSize: 13,
    gap: 8
  }
};
