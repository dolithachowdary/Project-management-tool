import React, { useEffect, useState } from "react";
import { getProjectActivity } from "../api/projects";
import api from "../api/axios";
import { format } from "date-fns";
import { Plus, SquarePen, CheckCheck, FileText, Info } from "lucide-react";
import Avatar from "./Avatar";

const getActionIcon = (action = "") => {
  const a = action.toLowerCase();
  if (a.includes("create")) return <Plus size={18} color="#000" strokeWidth={2.5} />;
  if (a.includes("update") || a.includes("edit")) return <SquarePen size={18} color="#000" strokeWidth={2.5} />;
  if (a.includes("complete") || a.includes("done")) return <CheckCheck size={18} color="#000" strokeWidth={2.5} />;
  return <Info size={18} color="#000" strokeWidth={2.5} />;
};

export default function RecentActivity({ projectId, sprintId, hideHeader = false }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      let res;
      if (sprintId) {
        res = await api.get(`/change-logs/sprint/${sprintId}`);
      } else if (projectId) {
        res = await getProjectActivity(projectId);
      } else {
        res = await api.get("/change-logs");
      }

      const data = res.data?.data || res.data || [];
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load activity logs", err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [projectId, sprintId]);

  useEffect(() => {
    load();
  }, [load]);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const grouped = logs.reduce((acc, l) => {
    const date = format(new Date(l.changed_at || l.created_at || Date.now()), 'yyyy-MM-dd');
    const label = date === todayStr ? "Today" : format(new Date(date), 'MMMM d, yyyy');
    if (!acc[label]) acc[label] = [];
    acc[label].push(l);
    return acc;
  }, {});

  return (
    <div style={styles.container}>
      {!hideHeader && (
        <div style={styles.header}>
          <h3 style={styles.title}>Recent Activity</h3>
        </div>
      )}

      <div style={styles.scrollArea} className="hide-scrollbar">
        {loading ? (
          <div style={styles.loading}>Loading...</div>
        ) : logs.length === 0 ? (
          <div style={styles.empty}>
            <FileText size={40} color="#e2e8f0" />
            <p>No activity recorded yet</p>
          </div>
        ) : (
          Object.keys(grouped).map(label => (
            <div key={label} style={styles.group}>
              <div style={styles.dateLabel}>{label}</div>
              <div style={styles.feed}>
                {grouped[label].map((l, i) => (
                  <div key={l.id || l._id || i} style={styles.item}>
                    <div style={styles.iconWrap}>
                      {getActionIcon(l.action)}
                    </div>

                    <div style={styles.content}>
                      <div style={styles.itemTitle}>
                        {l.message ? (
                          <span dangerouslySetInnerHTML={{ __html: l.message.replace(/#(\w+)/g, '<span style="font-weight:700;">$1</span>') }} />
                        ) : (
                          <>
                            <span style={styles.actionText}>{l.action === 'created' ? 'Added a new project' : l.action}</span>{" "}
                          </>
                        )}
                      </div>
                      <div style={styles.metaRow}>
                        <span style={styles.time}>{format(new Date(l.changed_at || l.created_at || Date.now()), 'h:mm a')}</span>
                        <div style={styles.userNote}>
                          {l.user_name || "System"} {l.action} this task
                        </div>
                      </div>
                    </div>

                    <div style={styles.avatarWrap}>
                      <Avatar name={l.user_name} id={l.user_id} size={28} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
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
    maxHeight: "100%",
    overflow: "hidden", // Added to prevent overlap
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
  },
  header: {
    padding: "16px 20px 8px", // Reduced padding
  },
  title: {
    fontSize: 16, // Slightly smaller
    fontWeight: 700,
    color: "#1e293b",
    margin: 0,
  },
  scrollArea: {
    flex: 1,
    overflowY: "auto",
    padding: "0 20px 16px",
    /* Hide Scrollbar */
    scrollbarWidth: "none",
    msOverflowStyle: "none",
    "&::-webkit-scrollbar": {
      display: "none"
    }
  },
  group: {
    marginBottom: 20,
  },
  dateLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: "#94a3b8",
    marginBottom: 16,
  },
  feed: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  item: {
    display: "flex",
    gap: 16,
    alignItems: "flex-start",
  },
  iconWrap: {
    width: 24,
    height: 24,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 2,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: "#1e293b",
    marginBottom: 4,
    lineHeight: 1.2,
  },
  metaRow: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  time: {
    fontSize: 12,
    fontWeight: 600,
    color: "#94a3b8",
  },
  userNote: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 1.4,
  },
  avatarWrap: {
    flexShrink: 0,
    marginTop: 4,
  },
  empty: {
    padding: 40,
    textAlign: "center",
    color: "#94a3b8",
  },
  loading: {
    padding: 24,
    color: "#94a3b8",
    fontSize: 14,
  }
};

