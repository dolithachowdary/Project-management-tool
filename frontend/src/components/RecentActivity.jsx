import React, { useEffect, useState } from "react";
import { getProjectActivity } from "../api/projects";

export default function RecentActivity({ projectId }) {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (projectId) load();
  }, [projectId]);

  const load = async () => {
    const res = await getProjectActivity(projectId);
    setLogs(res.data);
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>Recent Activity</div>
      <div style={styles.sub}>Project logs</div>

      {logs.length === 0 && (
        <div style={styles.empty}>No activity yet</div>
      )}

      {logs.map(l => (
        <div key={l.id} style={styles.item}>
          <div style={styles.iconWrap}>📝</div>
          <div>
            <div style={styles.title}>{l.action}</div>
            <div style={styles.time}>
              {new Date(l.changed_at).toLocaleString()}
            </div>
            <div style={styles.desc}>
              By {l.user_name || "System"}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* styles unchanged */


const styles = {
  card: {
    border: "1px solid #e5e5e5",
    borderRadius: 12,
    padding: 16,
    background: "#fff",
  },
  header: { fontSize: 15, fontWeight: 600 },
  sub: { marginTop: 4, fontSize: 13, color: "#777" },
  empty: { marginTop: 12, fontSize: 13, color: "#999" },
  item: {
    display: "flex",
    gap: 12,
    marginTop: 20,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: "#fafafa",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 14, fontWeight: 600 },
  time: { fontSize: 12, color: "#777" },
  desc: { marginTop: 4, fontSize: 13 },
};
