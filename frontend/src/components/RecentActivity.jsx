import React, { useEffect, useState } from "react";
import { getProjectActivity } from "../api/projects";
import api from "../api/axios";
import { formatDistanceToNow } from "date-fns";
import { Edit, CheckCircle, Plus, Trash, FileText, Info } from "lucide-react";

const getActionIcon = (action = "") => {
  const a = action.toLowerCase();
  if (a.includes("create")) return <Plus size={16} color="#10b981" />;
  if (a.includes("update")) return <Edit size={16} color="#3b82f6" />;
  if (a.includes("complete")) return <CheckCircle size={16} color="#10b981" />;
  if (a.includes("delete")) return <Trash size={16} color="#ef4444" />;
  return <Info size={16} color="#6b7280" />;
};

export default function RecentActivity({ projectId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = projectId
        ? await getProjectActivity(projectId)
        : await api.get("/change-logs");

      const data = res.data?.data || res.data || [];
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load activity logs", err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Recent Activity</h3>
        <p style={styles.sub}>{projectId ? "Project specific records" : "Global activity feed"}</p>
      </div>

      <div style={styles.scrollArea}>
        {loading ? (
          <div style={styles.loading}>
            {[1, 2, 3].map(i => (
              <div key={i} style={styles.skeletonItem}>
                <div style={styles.skeletonIcon} />
                <div style={styles.skeletonTextRow}>
                  <div style={styles.skeletonLineShort} />
                  <div style={styles.skeletonLineLong} />
                </div>
              </div>
            ))}
          </div>
        ) : (!Array.isArray(logs) || logs.length === 0) ? (
          <div style={styles.empty}>
            <FileText size={40} color="#e2e8f0" />
            <p>No activity recorded yet</p>
          </div>
        ) : (
          <div style={styles.feed}>
            {logs.map((l, i) => (
              <div key={l.id || l._id || i} style={styles.item}>
                <div style={styles.iconWrap}>
                  {getActionIcon(l.action)}
                </div>
                <div style={styles.content}>
                  <div style={styles.itemTitle}>
                    {l.message ? (
                      <span dangerouslySetInnerHTML={{ __html: l.message.replace(/#(\w+)/g, '<span style="font-family:monospace; background:#f1f5f9; padding:1px 4px; border-radius:4px; color:#475569; font-size:12px;">#$1</span>') }} />
                    ) : (
                      <>
                        <span style={styles.userName}>{l.user_name || "System"}</span>{" "}
                        <span style={styles.actionText}>{l.action}</span>{" "}
                        {l.entity_id && <span style={styles.highlight}>#{l.entity_id}</span>}
                        {(l.project_name || l.module_name) && (
                          <span style={styles.context}> in {l.project_name || l.module_name}</span>
                        )}
                      </>
                    )}
                  </div>
                  <div style={styles.time}>
                    {formatDistanceToNow(new Date(l.changed_at || l.created_at || Date.now()), { addSuffix: true })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: "#fff",
    borderRadius: 16,
    border: "1px solid #f1f5f9",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    maxHeight: 500,
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  },
  header: {
    padding: "20px 20px 12px",
    borderBottom: "1px solid #f1f5f9",
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    color: "#1e293b",
    margin: 0,
  },
  sub: {
    fontSize: 12,
    color: "#64748b",
    margin: "4px 0 0",
  },
  scrollArea: {
    flex: 1,
    overflowY: "auto",
    padding: "0 12px 12px",
  },
  feed: {
    display: "flex",
    flexDirection: "column",
    padding: "8px 0",
  },
  item: {
    display: "flex",
    gap: 12,
    padding: "12px 8px",
    borderRadius: 12,
    transition: "background 0.2s",
    "&:hover": {
      background: "#f8fafc",
    }
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  itemTitle: {
    fontSize: 13,
    lineHeight: 1.5,
    color: "#334155",
    wordBreak: "break-word",
  },
  userName: {
    fontWeight: 600,
    color: "#1e293b",
  },
  actionText: {
    color: "#64748b",
  },
  highlight: {
    fontFamily: "monospace",
    background: "#f1f5f9",
    padding: "1px 4px",
    borderRadius: 4,
    color: "#475569",
    fontSize: 12,
  },
  context: {
    fontWeight: 500,
    color: "#4f46e5",
  },
  time: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 2,
  },
  empty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
    color: "#94a3b8",
    fontSize: 14,
    gap: 8,
  },
  loading: {
    padding: 12,
  },
  skeletonItem: {
    display: "flex",
    gap: 12,
    marginBottom: 20,
    alignItems: "center",
  },
  skeletonIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: "#f1f5f9",
    animation: "pulse 2s infinite ease-in-out",
  },
  skeletonTextRow: {
    flex: 1,
  },
  skeletonLineShort: {
    height: 12,
    width: "40%",
    background: "#f1f5f9",
    borderRadius: 4,
    marginBottom: 6,
  },
  skeletonLineLong: {
    height: 10,
    width: "80%",
    background: "#f1f5f9",
    borderRadius: 4,
  }
};

