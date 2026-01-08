import React, { useEffect, useState } from "react";
import { getTasks } from "../api/tasks";
import { getAssignableUsers } from "../api/users";
import { getProjects } from "../api/projects";
import Loader from "./Loader";
import {
    format,
    startOfWeek,
    addDays,
    subDays,
    parseISO,
    eachDayOfInterval,
    isSunday,
    startOfDay,
    endOfDay,
    differenceInDays,
    isValid
} from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

const LANE_HEIGHT = 50;
const ROW_PADDING = 20;

export default function ProjectGantt() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedProject, setSelectedProject] = useState("all");
    const [selectedMember, setSelectedMember] = useState("all");

    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
    const weekEnd = addDays(weekStart, 6); // Sunday
    const daysInView = eachDayOfInterval({ start: weekStart, end: weekEnd });

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

                const projectMap = {};
                projectsData.forEach(p => {
                    projectMap[p.id] = {
                        id: p.id,
                        name: p.name,
                        color: p.color || "#3b82f6",
                        tasks: [],
                        numLanes: 1
                    };
                });

                tasksData.forEach(t => {
                    const pid = t.project_id;
                    if (projectMap[pid]) {
                        let taskStart = parseISO(t.start_date || t.startDate);
                        let taskEnd = parseISO(t.end_date || t.endDate);

                        if (!isValid(taskStart) || !isValid(taskEnd)) return;

                        // Normalize to start/end of day for accurate overlap check
                        const startCheck = startOfDay(taskStart);
                        const endCheck = endOfDay(taskEnd);
                        const weekStartCheck = startOfDay(weekStart);
                        const weekEndCheck = endOfDay(weekEnd);

                        const overlaps = (startCheck <= weekEndCheck && endCheck >= weekStartCheck);

                        if (overlaps) {
                            if (selectedMember !== "all" && String(t.assignee_id || t.assigned_to_id || t.assignedTo) !== String(selectedMember)) return;
                            if (selectedProject !== "all" && String(pid) !== String(selectedProject)) return;

                            projectMap[pid].tasks.push({
                                id: t.id || t._id,
                                title: t.title || t.taskName || "Untitled Task",
                                start: startCheck,
                                end: endCheck,
                                color: t.project_color || t.color || projectMap[pid].color,
                                assigneeName: usersData.find(u => String(u.id || u._id) === String(t.assignee_id || t.assigned_to_id || t.assignedTo))?.full_name || "Unknown"
                            });
                        }
                    }
                });

                // Lane Calculation (Stacking) Logic
                const processedData = Object.values(projectMap)
                    .filter(p => p.tasks.length > 0)
                    .map(project => {
                        // Sort tasks by start date
                        project.tasks.sort((a, b) => a.start.getTime() - b.start.getTime());

                        const lanes = []; // Array of end times for each lane
                        project.tasks.forEach(task => {
                            let laneIndex = -1;
                            for (let i = 0; i < lanes.length; i++) {
                                // If the task starts strictly after the end of the previous task in this lane
                                if (task.start > lanes[i]) {
                                    laneIndex = i;
                                    break;
                                }
                            }

                            if (laneIndex === -1) {
                                lanes.push(task.end);
                                task.lane = lanes.length - 1;
                            } else {
                                lanes[laneIndex] = task.end;
                                task.lane = laneIndex;
                            }
                        });

                        project.numLanes = Math.max(lanes.length, 1);
                        return project;
                    });

                let finalData = processedData;
                if (selectedProject !== "all") {
                    finalData = finalData.filter(p => String(p.id) === String(selectedProject));
                }

                setData(finalData);

            } catch (err) {
                console.error("Gantt error", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [currentDate, selectedProject, selectedMember]);

    const handlePrevWeek = () => setCurrentDate(subDays(currentDate, 7));
    const handleNextWeek = () => setCurrentDate(addDays(currentDate, 7));

    const resDataToArray = (res) => {
        const d = res.data?.data || res.data || [];
        return Array.isArray(d) ? d : [];
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
            return `rgba(59, 130, 246, ${opacity})`;
        }
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    };

    const getTaskStyle = (task) => {
        const totalDays = 7;
        const visualStart = task.start < weekStart ? weekStart : task.start;
        const visualEnd = task.end > weekEnd ? weekEnd : task.end;

        const startOffset = differenceInDays(startOfDay(visualStart), startOfDay(weekStart));
        const duration = differenceInDays(startOfDay(visualEnd), startOfDay(visualStart)) + 1;

        const left = (startOffset / totalDays) * 100;
        const width = (duration / totalDays) * 100;

        return {
            left: `${left}%`,
            width: `${width}%`,
            top: 10 + (task.lane * LANE_HEIGHT),
            height: 40,
            background: hexToRGBA(task.color, 0.15),
        };
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
                    <button style={styles.navBtn} onClick={handlePrevWeek} title="Previous Week">
                        <ChevronLeft size={18} />
                    </button>

                    <div style={styles.dateLabel}>
                        <CalendarIcon size={16} style={{ marginRight: 8 }} />
                        {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
                    </div>

                    <button style={styles.navBtn} onClick={handleNextWeek} title="Next Week">
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            <div style={styles.header}>
                <div style={styles.projectHeader}>Projects</div>
                <div style={styles.days}>
                    {daysInView.map(day => (
                        <div key={day.toString()} style={{ ...styles.day, backgroundColor: isSunday(day) ? "#f8fafc" : "transparent" }}>
                            <div style={styles.dayName}>{format(day, "EEE")}</div>
                            <div style={styles.dayDate}>{format(day, "d")}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={styles.body}>
                <div style={styles.projectsCol}>
                    {data.map((p, i) => (
                        <div key={i} style={{ ...styles.projectRow, height: p.numLanes * LANE_HEIGHT + ROW_PADDING }}>
                            <div style={styles.projectInfo}>
                                <div style={{ ...styles.projectBadge, backgroundColor: p.color }} />
                                <div style={styles.projectName}>{p.name}</div>
                            </div>
                            <div style={styles.projectMeta}>{p.tasks.length} tasks</div>
                        </div>
                    ))}
                    {data.length === 0 && <div style={styles.empty}>No projects with tasks for this period</div>}
                </div>

                <div style={styles.timeline}>
                    <div style={styles.grid}>
                        {daysInView.map((day, i) => (
                            <div
                                key={i}
                                style={{
                                    ...styles.gridLine,
                                    backgroundColor: isSunday(day) ? "rgba(241, 245, 249, 0.5)" : "transparent"
                                }}
                            />
                        ))}
                    </div>

                    {data.map((project, rowIndex) => (
                        <div key={rowIndex} style={{ ...styles.timelineRow, height: project.numLanes * LANE_HEIGHT + ROW_PADDING }}>
                            {project.tasks.map((task, i) => (
                                <div
                                    key={i}
                                    style={{
                                        ...styles.task,
                                        ...getTaskStyle(task)
                                    }}
                                    title={`${task.title} (${format(task.start, "MMM d")} - ${format(task.end, "MMM d")})`}
                                >
                                    <div style={{ ...styles.colorAccent, background: task.color }} />
                                    <div style={styles.taskContent}>
                                        <div style={styles.taskTitle}>{task.title}</div>
                                        <div style={styles.taskSubtitle}>{task.assigneeName}</div>
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
        minWidth: 200,
    },
    navGroup: {
        display: "flex",
        alignItems: "center",
        gap: 12,
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
    },
    dateLabel: {
        fontSize: "15px",
        fontWeight: "600",
        color: "#1e293b",
        display: "flex",
        alignItems: "center",
        background: "#f8fafc",
        padding: "8px 16px",
        borderRadius: "10px",
        border: "1px solid #e2e8f0",
    },
    header: {
        display: "flex",
        background: "#fcfdfe",
        borderTop: "1px solid #f1f5f9",
        borderBottom: "1px solid #e2e8f0",
        marginTop: 8,
    },
    projectHeader: {
        width: 250,
        fontWeight: 700,
        fontSize: 14,
        color: "#1e293b",
        padding: "12px 24px",
        borderRight: "1px solid #e2e8f0",
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center"
    },
    days: { flex: 1, display: "grid", gridTemplateColumns: "repeat(7, 1fr)" },
    day: {
        textAlign: "center",
        borderRight: "1px solid #e2e8f0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "8px 0",
    },
    dayName: { fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" },
    dayDate: { fontSize: 14, fontWeight: 800, color: "#1e293b", marginTop: 2 },
    body: { display: "flex", position: "relative" },
    projectsCol: { width: 250, borderRight: "1px solid #f1f5f9" },
    projectRow: { display: "flex", flexDirection: "column", justifyContent: "center", borderBottom: "1px solid #f1f5f9", paddingRight: 16, paddingLeft: 24 },
    projectInfo: { display: "flex", alignItems: "center", gap: 12 },
    projectBadge: { width: 12, height: 12, borderRadius: "50%" },
    projectName: { fontWeight: 700, fontSize: 14, color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
    projectMeta: { fontSize: 12, color: "#94a3b8", marginTop: 4, paddingLeft: 24 },
    timeline: { flex: 1, position: "relative", minHeight: 450 },
    grid: { position: "absolute", inset: 0, display: "grid", gridTemplateColumns: "repeat(7, 1fr)" },
    gridLine: { borderRight: "1px solid #e2e8f0" },
    timelineRow: { position: "relative", borderBottom: "1px solid #f1f5f9" },
    task: {
        position: "absolute",
        borderRadius: "8px",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        zIndex: 2,
        overflow: "hidden",
        padding: 0,
        cursor: "default",
    },
    colorAccent: { width: 6, height: "100%", flexShrink: 0 },
    taskContent: { padding: "0 10px", display: "flex", flexDirection: "column", justifyContent: "center", overflow: "hidden" },
    taskTitle: { fontSize: 11, fontWeight: 700, color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
    taskSubtitle: { fontSize: 9, color: "#64748b", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
    empty: { padding: 60, textAlign: "center", color: "#94a3b8", width: "100%" }
};
