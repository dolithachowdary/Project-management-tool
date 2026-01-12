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

      <div style={styles.scrollArea} className="hide-scrollbar">
        {tasks.length === 0 ? (
          <div style={styles.empty}>
            <Search size={32} color="var(--border-color)" />
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
    border: "1px solid var(--border-color)",
    borderRadius: 16,
    padding: 20,
    background: "var(--card-bg)",
    marginTop: 20,
    maxHeight: 400,
    display: "flex",
    flexDirection: "column",
    boxShadow: "var(--shadow-sm)",
  },
  header: { fontSize: 16, fontWeight: 700, color: "var(--text-primary)" },
  sub: { marginTop: 4, fontSize: 12, color: "var(--text-secondary)", marginBottom: 12 },
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
    borderBottom: "1px solid var(--border-color)",
    "&:last-child": { borderBottom: "none" }
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: "var(--hover-bg)",
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
  title: {
    fontSize: 14,
    fontWeight: 600,
    color: "var(--text-secondary)",
    marginBottom: 8,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  },
  time: { fontSize: 11, marginTop: 2, color: "var(--text-secondary)" },
  project: { fontSize: 11, marginTop: 1, color: "var(--accent-color)", fontWeight: 500 },
  empty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "30px 0",
    color: "var(--text-secondary)",
    fontSize: 13,
    gap: 8
  }
};
