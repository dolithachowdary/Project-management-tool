import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Loader from "../components/Loader";
import ProjectGantt from "../components/ProjectGantt";
import MemberWorkloadGraph from "../components/MemberWorkloadGraph";
import ProjectDistributionChart from "../components/ProjectDistributionChart";
import PriorityDistributionGraph from "../components/PriorityDistributionGraph";
import MemberEfficiencyGraph from "../components/MemberEfficiencyGraph";
import MemberTaskStatusGraph from "../components/MemberTaskStatusGraph";
import { getTasks } from "../api/tasks";
import { getAssignableUsers } from "../api/users";
import { getProjects } from "../api/projects";
import { LayoutDashboard, Calendar, BarChart3, PieChart, Activity } from "lucide-react";

function Analytics() {
    const [role, setRole] = useState(null);
    const [activeTab, setActiveTab] = useState("overview");
    const [workloadData, setWorkloadData] = useState([]);
    const [priorityData, setPriorityData] = useState([]);
    const [efficiencyData, setEfficiencyData] = useState([]);
    const [projectDistData, setProjectDistData] = useState([]);
    const [memberStatusData, setMemberStatusData] = useState([]);
    const [loadingOverview, setLoadingOverview] = useState(false);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem("userData"));
        const userRole = (userData?.role || "").toLowerCase();

        if (userRole === "developer") {
            window.location.href = "/dashboard";
            return;
        }

        if (userData?.role) {
            setRole(userData.role);
        } else {
            window.location.href = "/login";
        }
    }, []);

    useEffect(() => {
        if (activeTab === "overview") {
            const fetchOverviewData = async () => {
                try {
                    setLoadingOverview(true);
                    const [tasksRes, usersRes, projectsRes] = await Promise.all([
                        getTasks(),
                        getAssignableUsers().catch(() => ({ data: [] })),
                        getProjects()
                    ]);

                    const tasks = tasksRes.data?.data || tasksRes.data || [];
                    const users = usersRes.data?.data || usersRes.data || [];
                    const projects = projectsRes.data?.data || projectsRes.data || [];

                    // Member Workload
                    const workload = users.map(user => {
                        const userTasks = tasks.filter(t =>
                            String(t.assignee_id || t.assigned_to_id || t.assignedTo) === String(user.id || user._id)
                        );
                        return {
                            id: user.id || user._id,
                            name: user.full_name || user.name || "Unknown",
                            total: userTasks.length,
                            completed: userTasks.filter(t => (t.status || "").toLowerCase() === "done").length
                        };
                    });
                    setWorkloadData(workload.filter(w => w.total > 0));

                    // Aggregate Priority Distribution
                    const priorityCounts = { High: 0, Medium: 0, Low: 0 };
                    tasks.forEach(t => {
                        const p = (t.priority || "").toLowerCase();
                        if (p === "high") priorityCounts.High++;
                        else if (p === "medium") priorityCounts.Medium++;
                        else if (p === "low") priorityCounts.Low++;
                    });

                    const priorityDist = [
                        { name: "Low", count: priorityCounts.Low },
                        { name: "Medium", count: priorityCounts.Medium },
                        { name: "High", count: priorityCounts.High },
                    ];
                    setPriorityData(priorityDist);

                    // Time Efficiency
                    const efficiency = users.map(user => {
                        const userTasks = tasks.filter(t =>
                            String(t.assignee_id || t.assigned_to_id || t.assignedTo) === String(user.id || user._id)
                        );
                        const est = userTasks.reduce((acc, t) => acc + (parseFloat(t.est_hours || t.target_hours) || 0), 0);
                        const act = userTasks.reduce((acc, t) => {
                            const actual = parseFloat(t.actual_hours) || (t.task_duration_minutes ? t.task_duration_minutes / 60 : 0);
                            return acc + actual;
                        }, 0);
                        return {
                            id: user.id || user._id,
                            name: user.full_name || user.name || "Unknown",
                            estimated: Math.round(est * 10) / 10,
                            actual: Math.round(act * 10) / 10
                        };
                    });
                    setEfficiencyData(efficiency.filter(e => e.estimated > 0 || e.actual > 0));

                    // Project Distribution
                    const dist = projects.map(p => {
                        const pTasks = tasks.filter(t =>
                            String(t.project_id) === String(p.id || p._id)
                        );

                        // Calculate Overall Progress
                        let progress = 0;
                        if (pTasks.length > 0) {
                            const completed = pTasks.filter(t => (t.status || "").toLowerCase() === "done").length;
                            progress = Math.round((completed / pTasks.length) * 100);
                        }

                        // Filter for pending tasks and breakdown (use API-standard values)
                        const todoTasks = pTasks.filter(t => {
                            const status = (t.status || "").toLowerCase();
                            return status === "todo" || status === "to do";
                        });
                        const inProgressTasks = pTasks.filter(t => {
                            const status = (t.status || "").toLowerCase();
                            return status === "in_progress" || status === "in progress" || status === "review";
                        });
                        const pendingCount = todoTasks.length + inProgressTasks.length;

                        return {
                            id: p.id || p._id,
                            name: p.name,
                            color: p.color || "#6366f1",
                            count: pendingCount,
                            todo: todoTasks.length,
                            inprogress: inProgressTasks.length,
                            progress: progress
                        };
                    });
                    setProjectDistData(dist.filter(d => d.count > 0));

                    // Member Task Status Distribution
                    const statusDist = users.map(user => {
                        const userTasks = tasks.filter(t =>
                            String(t.assignee_id || t.assigned_to_id || t.assignedTo) === String(user.id || user._id)
                        );

                        const todo = userTasks.filter(t => {
                            const s = (t.status || "").toLowerCase();
                            return s === "todo" || s === "to do";
                        }).length;

                        const inprogress = userTasks.filter(t => {
                            const s = (t.status || "").toLowerCase();
                            return s === "in_progress" || s === "in progress" || s === "review";
                        }).length;

                        const done = userTasks.filter(t => (t.status || "").toLowerCase() === "done").length;

                        return {
                            name: user.full_name || user.name || "Unknown",
                            todo,
                            inprogress,
                            done,
                            total: todo + inprogress + done
                        };
                    });
                    setMemberStatusData(statusDist.filter(d => d.total > 0));

                } catch (err) {
                    console.error("Failed to fetch overview data", err);
                } finally {
                    setLoadingOverview(false);
                }
            };
            fetchOverviewData();
        }
    }, [activeTab]);

    if (!role) {
        return <Loader />;
    }

    return (
        <div style={styles.app}>
            <Sidebar role={role} />

            <div style={styles.main}>
                <Header />

                <div style={styles.tabsContainer}>
                    <button
                        style={activeTab === "overview" ? styles.tabActive : styles.tab}
                        onClick={() => setActiveTab("overview")}
                    >
                        <LayoutDashboard size={18} />
                        Overview
                    </button>
                    <button
                        style={activeTab === "gantt" ? styles.tabActive : styles.tab}
                        onClick={() => setActiveTab("gantt")}
                    >
                        <Calendar size={18} />
                        Gantt Chart
                    </button>
                </div>
                <div style={styles.tabsDivider}></div>

                <div style={styles.scrollArea}>
                    {activeTab === "overview" ? (
                        <div style={styles.overviewSection}>
                            <div style={styles.topGrid}>
                                <div style={styles.chartCardLarge}>
                                    <div style={styles.chartHeader}>
                                        <BarChart3 size={20} color="#c53030" />
                                        <h3 style={styles.chartTitle}>Workload Balance</h3>
                                    </div>
                                    <p style={styles.chartSubtitle}>Tasks assigned vs. completed per member.</p>
                                    <div style={styles.chartContent}>
                                        {loadingOverview ? <Loader /> : <MemberWorkloadGraph data={workloadData} />}
                                    </div>
                                </div>

                                <div style={styles.chartCardSmall}>
                                    <div style={styles.chartHeader}>
                                        <Activity size={20} color="#c53030" />
                                        <h3 style={styles.chartTitle}>Priority Distribution</h3>
                                    </div>
                                    <p style={styles.chartSubtitle}>Total breakdown of task priorities.</p>
                                    <div style={styles.chartContent}>
                                        {loadingOverview ? <Loader /> : <PriorityDistributionGraph data={priorityData} />}
                                    </div>
                                </div>

                                <div style={styles.chartCardSmall}>
                                    <div style={styles.chartHeader}>
                                        <PieChart size={20} color="#c53030" />
                                        <h3 style={styles.chartTitle}>Project Distribution</h3>
                                    </div>
                                    <p style={styles.chartSubtitle}>Active projects task load.</p>
                                    <div style={styles.chartContent}>
                                        {loadingOverview ? <Loader /> : <ProjectDistributionChart data={projectDistData} />}
                                    </div>
                                </div>
                            </div>

                            <div style={styles.bottomGrid}>
                                <div style={styles.chartCardFull}>
                                    <div style={styles.chartHeader}>
                                        <Activity size={20} color="#c53030" />
                                        <h3 style={styles.chartTitle}>Time Efficiency</h3>
                                    </div>
                                    <p style={styles.chartSubtitle}>Estimated vs. Actual hours per member.</p>
                                    <div style={styles.chartContent}>
                                        {loadingOverview ? <Loader /> : <MemberEfficiencyGraph data={efficiencyData} />}
                                    </div>
                                </div>

                                <div style={styles.chartCardFull}>
                                    <div style={styles.chartHeader}>
                                        <Activity size={20} color="#c53030" />
                                        <h3 style={styles.chartTitle}>Member Task Status</h3>
                                    </div>
                                    <p style={styles.chartSubtitle}>Status breakdown of current tasks per member.</p>
                                    <div style={styles.chartContent}>
                                        {loadingOverview ? <Loader /> : <MemberTaskStatusGraph data={memberStatusData} />}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <ProjectGantt />
                    )}
                </div>
            </div>
        </div>
    );
}

const styles = {
    app: {
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#fafafa",
    },
    main: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
    },
    contentHeader: {
        padding: "20px 24px",
        background: "#fff",
        borderBottom: "1px solid #f1f5f9",
    },
    title: {
        fontSize: "24px",
        fontWeight: "700",
        color: "#1e293b",
        margin: 0,
    },
    subtitle: {
        fontSize: "14px",
        color: "#64748b",
        marginTop: "4px",
        margin: 0,
    },
    scrollArea: {
        flex: 1,
        overflowY: "auto",
        padding: 24,
    },
    tabsContainer: {
        display: "flex",
        gap: "32px",
        padding: "0 24px",
        background: "#fff",
        marginTop: "12px"
    },
    tab: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "16px 0",
        background: "none",
        border: "none",
        fontSize: "15px",
        fontWeight: "600",
        color: "#64748b",
        cursor: "pointer",
        borderBottom: "2px solid transparent",
        transition: "all 0.2s"
    },
    tabActive: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "16px 0",
        background: "none",
        border: "none",
        fontSize: "15px",
        fontWeight: "700",
        color: "#c53030", // Consistent with the orange/red in the image
        cursor: "pointer",
        borderBottom: "2px solid #c53030",
    },
    tabsDivider: {
        height: "1px",
        background: "#f1f5f9",
        width: "100%"
    },
    overviewSection: {
        display: "flex",
        flexDirection: "column",
        gap: "24px",
    },
    topGrid: {
        display: "grid",
        gridTemplateColumns: "1.5fr 1fr 1fr",
        gap: "24px",
    },
    bottomGrid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "24px",
    },
    chartCardLarge: {
        background: "#fff",
        borderRadius: "20px",
        border: "1px solid #f1f5f9",
        padding: "16px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
        display: "flex",
        flexDirection: "column",
    },
    chartCardSmall: {
        background: "#fff",
        borderRadius: "20px",
        border: "1px solid #f1f5f9",
        padding: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
        display: "flex",
        flexDirection: "column",
    },
    chartCardFull: {
        background: "#fff",
        borderRadius: "20px",
        border: "1px solid #f1f5f9",
        padding: "16px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
        display: "flex",
        flexDirection: "column",
    },
    chartHeader: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginBottom: "8px"
    },
    chartTitle: {
        fontSize: "18px",
        fontWeight: "700",
        color: "#1e293b",
        margin: 0
    },
    chartSubtitle: {
        fontSize: "13px",
        color: "#64748b",
        marginBottom: "24px",
        margin: 0
    },
    chartContent: {
        height: "340px",
        minHeight: "340px",
        flex: 1
    },
    placeholderCard: {
        height: "100%",
        minHeight: "300px",
        background: "#f8fafc",
        border: "1px dashed #cbd5e1",
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#94a3b8",
        fontSize: "14px",
        fontWeight: "500"
    }
};

export default Analytics;
