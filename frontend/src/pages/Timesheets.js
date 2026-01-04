import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import PMTimeline from "../components/Pm-Timeline";
import { getProjects } from "../api/projects";
import Loader from "../components/Loader";
import TimesheetGenerator from "../components/WeeklyTimesheetGenerator";
import TimesheetPreview from "../components/WeeklyTimesheetPreview";
import { saveTimesheet, getHistory } from "../api/timesheets";
import { toast } from "react-hot-toast";
import { FileText, Clock, History, Search } from "lucide-react";

export default function Timesheets() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [activeTab, setActiveTab] = useState("generator"); // generator, daily, history

  const [previewData, setPreviewData] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);

  const role = localStorage.getItem("role") || "Project Manager";

  useEffect(() => {
    loadProjects();
    if (activeTab === "history") loadHistory();
  }, [activeTab]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const res = await getProjects();
      const data = res.data?.data || res.data || [];
      setProjects(data);
      if (data.length > 0) setActiveProjectId(data[0].id);
    } catch (err) {
      console.error("Failed to load projects:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      setLoading(true);
      const res = await getHistory();
      setHistory(res.data?.data || res.data || []);
    } catch (err) {
      console.error("Failed to load history:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTimesheet = async (finalData) => {
    try {
      const payload = {
        project_id: finalData.project.id,
        user_id: finalData.employee.id,
        supervisor_id: finalData.supervisor_id,
        start_date: finalData.start_date,
        end_date: finalData.end_date,
        daily_data: finalData.daily_data,
        total_hours: finalData.total_hours,
        status: finalData.status
      };
      await saveTimesheet(payload);
      toast.success("Timesheet saved successfully!");
      setPreviewData(null);
      setActiveTab("history");
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save timesheet");
    }
  };

  const activeProject = projects.find(p => p.id === activeProjectId);

  return (
    <div style={styles.page}>
      <Sidebar />

      <div style={styles.main}>
        <Header role={role} />

        <div style={styles.content}>
          <div style={styles.headerRow}>
            <div>
              <h2 style={styles.pageTitle}>Timesheets</h2>
              <p style={styles.pageSub}>Manage daily logs and generate weekly reports.</p>
            </div>

            <div style={styles.tabGroup}>
              <button
                onClick={() => setActiveTab("generator")}
                style={{ ...styles.tab, ...(activeTab === "generator" ? styles.activeTab : {}) }}
              >
                <FileText size={18} /> Generator
              </button>
              <button
                onClick={() => setActiveTab("daily")}
                style={{ ...styles.tab, ...(activeTab === "daily" ? styles.activeTab : {}) }}
              >
                <Clock size={18} /> Daily Timeline
              </button>
              <button
                onClick={() => setActiveTab("history")}
                style={{ ...styles.tab, ...(activeTab === "history" ? styles.activeTab : {}) }}
              >
                <History size={18} /> History
              </button>
            </div>
          </div>

          <div style={styles.body}>
            {activeTab === "generator" && (
              <div style={styles.scrollArea}>
                {!previewData ? (
                  <TimesheetGenerator onPreview={setPreviewData} />
                ) : (
                  <div>
                    <button
                      style={styles.backBtn}
                      onClick={() => setPreviewData(null)}
                    >
                      ← Back to Generator
                    </button>
                    <TimesheetPreview
                      data={previewData}
                      onSave={handleSaveTimesheet}
                    />
                  </div>
                )}
              </div>
            )}

            {activeTab === "daily" && (
              <div style={styles.splitLayout}>
                <div style={styles.leftPane}>
                  {loading ? <Loader /> : (
                    <div style={styles.projectList}>
                      {projects.map(p => (
                        <div
                          key={p.id}
                          onClick={() => setActiveProjectId(p.id)}
                          style={{
                            ...styles.projectCard,
                            borderLeft: `4px solid ${p.color || "#4F7DFF"}`,
                            background: activeProjectId === p.id ? "#fff" : "transparent",
                            boxShadow: activeProjectId === p.id ? "0 4px 12px rgba(0,0,0,0.05)" : "none",
                          }}
                        >
                          <h3 style={styles.projName}>{p.name}</h3>
                          <p style={styles.projCode}>{p.project_code || "PRJ-001"}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div style={styles.rightPane}>
                  {activeProject ? (
                    <PMTimeline projectId={activeProjectId} />
                  ) : (
                    <div style={styles.empty}>Select a project to view its timeline</div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "history" && (
              <div style={styles.historyLayout}>
                {selectedHistoryItem ? (
                  <div>
                    <button
                      style={styles.backBtn}
                      onClick={() => setSelectedHistoryItem(null)}
                    >
                      ← Back to History
                    </button>
                    <TimesheetPreview
                      data={{
                        employee: { name: selectedHistoryItem.employee_name },
                        project: { name: selectedHistoryItem.project_name },
                        start_date: selectedHistoryItem.week_start,
                        end_date: selectedHistoryItem.week_end,
                        daily_data: selectedHistoryItem.daily_data,
                        total_hours: selectedHistoryItem.total_hours,
                        supervisor_name: selectedHistoryItem.supervisor_name,
                        approved_hours: selectedHistoryItem.approved_hours
                      }}
                      isHistory={true}
                    />
                  </div>
                ) : (
                  <div style={styles.historyGrid}>
                    {history.length === 0 ? (
                      <div style={styles.empty}>No generated timesheets found.</div>
                    ) : (
                      history.map(item => (
                        <div
                          key={item.id}
                          style={styles.historyCard}
                          onClick={() => setSelectedHistoryItem(item)}
                        >
                          <div style={styles.historyCardHeader}>
                            <div style={styles.historyProj}>{item.project_name || "General"}</div>
                            <div style={styles.historyStatus}>{item.status}</div>
                          </div>
                          <div style={styles.historyEmp}>{item.employee_name}</div>
                          <div style={styles.historyDates}>
                            {format(new Date(item.week_start), "MMM dd")} - {format(new Date(item.week_end), "MMM dd, yyyy")}
                          </div>
                          <div style={styles.historyFooter}>
                            <span>Total: <strong>{item.total_hours} hrs</strong></span>
                            <Search size={16} color="#4F7DFF" />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    height: "100vh",
    background: "#f8fafc",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  content: {
    padding: "32px",
    display: "flex",
    flexDirection: "column",
    gap: 24,
    flex: 1,
    overflow: "hidden",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 800,
    color: "#1e293b",
    margin: 0,
  },
  pageSub: {
    fontSize: 15,
    color: "#64748b",
    margin: 0,
    marginTop: 4,
  },
  tabGroup: {
    display: "flex",
    background: "#f1f5f9",
    padding: "4px",
    borderRadius: "12px",
    gap: 4,
  },
  tab: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 16px",
    borderRadius: "8px",
    border: "none",
    background: "transparent",
    fontSize: 14,
    fontWeight: 600,
    color: "#64748b",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  activeTab: {
    background: "#fff",
    color: "#1e293b",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  },
  body: {
    flex: 1,
    overflow: "hidden",
  },
  scrollArea: {
    height: "100%",
    overflowY: "auto",
    paddingRight: "8px",
  },
  splitLayout: {
    display: "grid",
    gridTemplateColumns: "300px 1fr",
    gap: 24,
    height: "100%",
  },
  leftPane: {
    overflowY: "auto",
  },
  rightPane: {
    background: "#fff",
    borderRadius: "16px",
    padding: "24px",
    border: "1px solid #e2e8f0",
    overflowY: "auto",
  },
  projectList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  projectCard: {
    padding: "16px",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  projName: {
    fontSize: 15,
    fontWeight: 700,
    color: "#1e293b",
    margin: 0,
  },
  projCode: {
    fontSize: 12,
    color: "#64748b",
    margin: 0,
    marginTop: 4,
  },
  backBtn: {
    marginBottom: "20px",
    background: "none",
    border: "none",
    color: "#4F7DFF",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 14,
  },
  historyLayout: {
    height: "100%",
    overflowY: "auto",
  },
  historyGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 20,
  },
  historyCard: {
    background: "#fff",
    padding: "20px",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: "0 12px 20px -8px rgba(0,0,0,0.1)",
    }
  },
  historyCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  historyProj: {
    fontSize: 12,
    fontWeight: 700,
    color: "#4F7DFF",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  historyStatus: {
    fontSize: 10,
    fontWeight: 800,
    background: "#f1f5f9",
    padding: "2px 8px",
    borderRadius: "4px",
    color: "#64748b",
  },
  historyEmp: {
    fontSize: 17,
    fontWeight: 700,
    color: "#1e293b",
    marginBottom: 4,
  },
  historyDates: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 16,
  },
  historyFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTop: "1px solid #f1f5f9",
    fontSize: 13,
    color: "#475569",
  },
  empty: {
    height: "200px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#94a3b8",
    fontSize: 16,
    width: "100%",
  }
};
