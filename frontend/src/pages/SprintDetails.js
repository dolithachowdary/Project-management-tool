import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { getSprintHierarchy } from "../api/sprints";
import Loader from "../components/Loader";
import {
    ChevronRight,
    Box,
    CheckCircle2,
    Clock,
    Circle,
    ArrowLeft,
    Calendar,
    Layers
} from "lucide-react";

const SprintDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const role = localStorage.getItem("role") || "Project Manager";

    useEffect(() => {
        loadHierarchy();
    }, [id]);

    const loadHierarchy = async () => {
        try {
            setLoading(true);
            const res = await getSprintHierarchy(id);
            setData(res.data?.data || res.data);
        } catch (err) {
            console.error("Failed to load sprint hierarchy:", err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case "done":
                return <CheckCircle2 size={16} color="#10b981" />;
            case "in_progress":
                return <Clock size={16} color="#3b82f6" />;
            default:
                return <Circle size={16} color="#94a3b8" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "done":
                return "#f0fdf4";
            case "in_progress":
                return "#eff6ff";
            default:
                return "#f8fafc";
        }
    };

    if (loading) {
        return (
            <div style={styles.pageContainer}>
                <Sidebar />
                <div style={styles.mainContent}>
                    <Header role={role} />
                    <Loader />
                </div>
            </div>
        );
    }

    if (!data) return null;

    const { sprint, modules } = data;

    return (
        <div style={styles.pageContainer}>
            <Sidebar />

            <div style={styles.mainContent}>
                <Header role={role} />

                <div style={styles.pageInner}>
                    {/* TOP BAR / NAVIGATION */}
                    <div style={styles.topBar}>
                        <button onClick={() => navigate("/sprints")} style={styles.backBtn}>
                            <ArrowLeft size={18} />
                            <span>Back to Sprints</span>
                        </button>
                    </div>

                    {/* SPRINT HEADER */}
                    <div style={styles.sprintHeader}>
                        <div style={styles.headerLeft}>
                            <h1 style={styles.sprintTitle}>{sprint.name}</h1>
                            <div style={styles.projectBadge}>
                                {sprint.project_name}
                            </div>
                            <div style={styles.metaRow}>
                                <div style={styles.metaItem}>
                                    <Calendar size={14} />
                                    <span>{new Date(sprint.start_date).toLocaleDateString()} - {new Date(sprint.end_date).toLocaleDateString()}</span>
                                </div>
                                <div style={styles.metaItem}>
                                    <Layers size={14} />
                                    <span>{modules.length} Modules</span>
                                </div>
                            </div>
                        </div>

                        <div style={styles.headerRight}>
                            <div style={styles.progressRing}>
                                <span style={styles.progressText}>{sprint.status?.toUpperCase()}</span>
                            </div>
                        </div>
                    </div>

                    {/* HIERARCHICAL GRAPH VIEW */}
                    <div style={styles.graphContainer}>
                        {/* ROOT NODE: SPRINT */}
                        <div style={styles.rootNode}>
                            <div style={{ ...styles.node, backgroundColor: sprint.project_color || "#3b82f6", color: "#fff" }}>
                                <Box size={20} />
                                <span style={styles.nodeTitle}>{sprint.name}</span>
                            </div>

                            <div style={styles.verticalLine}></div>

                            {/* MODULES LEVEL */}
                            <div style={styles.modulesGrid}>
                                {modules.map((mod, mIndex) => (
                                    <div key={mod.id} style={styles.moduleBranch}>
                                        {/* Connector for module */}
                                        <div style={styles.moduleConnector}></div>

                                        {/* Module Node */}
                                        <div style={styles.moduleNode}>
                                            <div style={styles.node}>
                                                <Box size={18} color="#6366f1" />
                                                <div style={styles.nodeContent}>
                                                    <span style={styles.nodeTitle}>{mod.name}</span>
                                                    <span style={styles.nodeSubtitle}>{mod.tasks?.length || 0} Tasks</span>
                                                </div>
                                            </div>

                                            {/* TASKS LEVEL */}
                                            <div style={styles.tasksContainer}>
                                                {mod.tasks?.map((task) => (
                                                    <div key={task.id} style={styles.taskItem}>
                                                        <div style={styles.taskConnector}></div>
                                                        <div style={{ ...styles.taskNode, backgroundColor: getStatusColor(task.status) }}>
                                                            {getStatusIcon(task.status)}
                                                            <div style={styles.taskInfo}>
                                                                <div style={styles.taskTitle}>{task.title}</div>
                                                                <div style={styles.taskAssignee}>{task.assignee_name || "Unassigned"}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                {(!mod.tasks || mod.tasks.length === 0) && (
                                                    <div style={styles.emptyTasks}>No tasks in this module</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    pageContainer: {
        display: "flex",
        height: "100vh",
        background: "#f8fafc",
    },
    mainContent: {
        flex: 1,
        overflowY: "auto",
    },
    pageInner: {
        padding: "32px",
        maxWidth: "1400px",
        margin: "0 auto",
    },
    topBar: {
        marginBottom: "24px",
    },
    backBtn: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        background: "none",
        border: "none",
        color: "#64748b",
        fontSize: "14px",
        fontWeight: "500",
        cursor: "pointer",
        padding: "0",
        transition: "color 0.2s ease",
        ":hover": {
            color: "#1e293b",
        }
    },
    sprintHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        backgroundColor: "#fff",
        borderRadius: "24px",
        padding: "32px",
        marginBottom: "40px",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
        border: "1px solid #f1f5f9",
    },
    sprintTitle: {
        fontSize: "28px",
        fontWeight: "800",
        color: "#0f172a",
        margin: "0 0 8px 0",
    },
    projectBadge: {
        display: "inline-block",
        padding: "4px 12px",
        borderRadius: "20px",
        backgroundColor: "#f1f5f9",
        color: "#475569",
        fontSize: "12px",
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        marginBottom: "16px",
    },
    metaRow: {
        display: "flex",
        gap: "24px",
    },
    metaItem: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        color: "#64748b",
        fontSize: "14px",
    },
    headerRight: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    progressRing: {
        width: "80px",
        height: "80px",
        borderRadius: "50%",
        border: "4px solid #f1f5f9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
    },
    progressText: {
        fontSize: "10px",
        fontWeight: "800",
        color: "#3b82f6",
    },
    graphContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "40px 0",
    },
    rootNode: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
    },
    node: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "16px 24px",
        borderRadius: "16px",
        backgroundColor: "#fff",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
        border: "1px solid #e2e8f0",
        minWidth: "200px",
        zIndex: 2,
    },
    nodeContent: {
        display: "flex",
        flexDirection: "column",
    },
    nodeTitle: {
        fontSize: "15px",
        fontWeight: "700",
        color: "inherit",
    },
    nodeSubtitle: {
        fontSize: "12px",
        color: "#94a3b8",
    },
    verticalLine: {
        width: "2px",
        height: "60px",
        backgroundColor: "#cbd5e1",
    },
    modulesGrid: {
        display: "flex",
        justifyContent: "center",
        gap: "32px",
        width: "100%",
        flexWrap: "wrap",
        position: "relative",
        paddingTop: "2px",
        ":before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: "50px",
            right: "50px",
            height: "2px",
            backgroundColor: "#cbd5e1",
        }
    },
    moduleBranch: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minWidth: "280px",
    },
    moduleConnector: {
        width: "2px",
        height: "30px",
        backgroundColor: "#cbd5e1",
    },
    moduleNode: {
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    tasksContainer: {
        marginTop: "24px",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        paddingLeft: "20px",
    },
    taskItem: {
        display: "flex",
        alignItems: "center",
        width: "100%",
    },
    taskConnector: {
        width: "12px",
        height: "2px",
        backgroundColor: "#cbd5e1",
    },
    taskNode: {
        flex: 1,
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 16px",
        borderRadius: "12px",
        border: "1px solid rgba(0,0,0,0.05)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        ":hover": {
            transform: "translateX(4px)",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
        }
    },
    taskInfo: {
        display: "flex",
        flexDirection: "column",
    },
    taskTitle: {
        fontSize: "13px",
        fontWeight: "600",
        color: "#1e293b",
        lineHeight: "1.2",
    },
    taskAssignee: {
        fontSize: "11px",
        color: "#64748b",
    },
    emptyTasks: {
        fontSize: "12px",
        color: "#94a3b8",
        fontStyle: "italic",
        textAlign: "center",
        padding: "8px",
    }
};

export default SprintDetails;
