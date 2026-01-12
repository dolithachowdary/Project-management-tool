import React, { useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
    LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { format, eachDayOfInterval, startOfWeek, endOfWeek, isSameDay, parseISO } from 'date-fns';
import { getSprintBurndown } from '../api/sprints';
import RecentActivity from './RecentActivity';
import Avatar from './Avatar';

import { useTheme } from '../context/ThemeContext';

const SprintOverview = ({ data, styles }) => {
    const { theme } = useTheme();
    const sprint = data?.sprint;
    const projectColor = sprint?.project_color || '#0d9488';
    const [burndownChartData, setBurndownChartData] = React.useState([]);

    React.useEffect(() => {
        if (sprint?.id) {
            getSprintBurndown(sprint.id).then(res => {
                setBurndownChartData(res.data?.data || res.data || []);
            }).catch(err => console.error("Burndown fetch error:", err));
        }
    }, [sprint?.id]);

    // Extract all tasks from modules
    const allTasks = useMemo(() => {
        const modules = data?.modules || [];
        return modules.flatMap(m => (m.tasks || []));
    }, [data?.modules]);

    // 1. Weekly Task Report Data
    const weeklyData = useMemo(() => {
        const today = new Date();
        const start = startOfWeek(today, { weekStartsOn: 6 }); // Start from Saturday
        const end = endOfWeek(today, { weekStartsOn: 6 });
        const days = eachDayOfInterval({ start, end });

        return days.map(day => {
            const dayTasks = allTasks.filter(t => {
                const createdDate = parseISO(t.created_at || new Date().toISOString());
                return isSameDay(createdDate, day);
            });
            const completedTasks = allTasks.filter(t => {
                if (!t.completed_at) return false;
                return isSameDay(parseISO(t.completed_at), day);
            });

            return {
                name: format(day, 'EEE'),
                date: format(day, 'MMM d'),
                total: dayTasks.length,
                completed: completedTasks.length
            };
        });
    }, [allTasks]);

    // 2. Goal Burndown Calculation
    const goalBurndownData = useMemo(() => {
        if (!sprint || !burndownChartData.length) return [];

        let gList = [];
        try {
            gList = JSON.parse(sprint.goal || "[]");
            if (!Array.isArray(gList)) gList = [];
        } catch (e) {
            const gs = sprint.goal || "";
            if (gs.trim()) {
                gList = gs.split("\n").filter(l => l.trim()).map((l, idx) => ({ id: idx, text: l.trim() }));
            }
        }

        if (gList.length === 0) return [];

        // For each goal, find when it was completed
        // A goal is completed when all its assigned tasks are done
        const goalsWithCompletion = gList.map((g, idx) => {
            const goalTasks = allTasks.filter(t => t.goal_index === idx);
            if (goalTasks.length === 0) return { ...g, completedAt: null };

            const allDone = goalTasks.every(t => t.status?.toLowerCase() === 'done' || t.status?.toLowerCase() === 'completed');
            if (!allDone) return { ...g, completedAt: null };

            // Completion date is the latest completed_at of its tasks
            const completionDates = goalTasks.map(t => t.completed_at ? new Date(t.completed_at) : null).filter(Boolean);
            if (completionDates.length === 0) return { ...g, completedAt: new Date(0) }; // Fallback if somehow done but no date

            return { ...g, completedAt: new Date(Math.max(...completionDates)) };
        });

        // Merge with burndownChartData
        return burndownChartData.map(day => {
            const dayDate = new Date(day.date);
            dayDate.setHours(23, 59, 59, 999);

            const remainingGoals = goalsWithCompletion.filter(g => {
                if (!g.completedAt) return true;
                return g.completedAt > dayDate;
            }).length;

            return {
                ...day,
                remainingGoals: remainingGoals
            };
        });
    }, [sprint, burndownChartData, allTasks]);

    const finalBurndownData = goalBurndownData.length > 0 ? goalBurndownData : burndownChartData;

    const getStatusLabel = (s) => {
        const status = s?.toLowerCase() || '';
        if (status === 'done' || status === 'completed') return 'Done';
        if (status === 'inprogress' || status === 'in_progress') return 'In Progress';
        if (status === 'todo' || status === 'backlog' || status === 'planned') return 'To Do';
        return 'To Do';
    };

    // 2. Burndown Chart Data
    // Burndown data is now fetched from API

    // 3. Task Status (Donut) Data
    const statusData = useMemo(() => {
        const counts = allTasks.reduce((acc, t) => {
            const label = getStatusLabel(t.status);
            acc[label] = (acc[label] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [allTasks]);

    const priorityData = useMemo(() => {
        const priorities = ['Low', 'Medium', 'High'];
        const statuses = ['To Do', 'In Progress', 'Done'];

        return priorities.map(pri => {
            const data = { priority: pri };
            statuses.forEach(status => {
                data[status] = allTasks.filter(t =>
                    (t.priority?.toLowerCase() === pri.toLowerCase()) &&
                    (getStatusLabel(t.status) === status)
                ).length;
            });
            return data;
        });
    }, [allTasks]);

    // 5. Member Allocation Data
    const memberData = useMemo(() => {
        const memberMap = allTasks.reduce((acc, t) => {
            const name = t.assignee_name || 'Unassigned';
            const id = t.assignee_id || name;
            if (!acc[name]) acc[name] = { name, id, 'To Do': 0, 'In Progress': 0, 'Done': 0 };
            const label = getStatusLabel(t.status);
            acc[name][label] = (acc[name][label] || 0) + 1;
            return acc;
        }, {});

        return Object.values(memberMap);
    }, [allTasks]);

    if (!data) return null;

    const dashboardStyles = {
        grid: {
            display: 'grid',
            gridTemplateColumns: '1.2fr 1.2fr 1fr',
            gridAutoRows: 'minmax(340px, auto)',
            gap: '16px',
            padding: '10px 0',
        },
        card: {
            background: 'var(--card-bg)',
            borderRadius: '16px',
            padding: '12px 16px',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            height: '340px', // Uniform height increased
            overflow: 'hidden',
            boxSizing: 'border-box',
        },
        cardTitle: {
            fontSize: '15px',
            fontWeight: '700',
            color: 'var(--text-primary)',
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        chartContainer: {
            flex: 1,
            width: '100%',
            position: 'relative',
        }
    };

    const CustomXAxisTick = ({ x, y, payload }) => {
        const data = weeklyData[payload.index];
        return (
            <g transform={`translate(${x},${y})`}>
                <text x={0} y={0} dy={16} textAnchor="middle" fill="var(--text-secondary)" fontSize={10} fontWeight={600}>
                    {data.name}
                </text>
                <text x={0} y={0} dy={28} textAnchor="middle" fill="var(--text-secondary)" opacity={0.7} fontSize={9}>
                    {data.date}
                </text>
            </g>
        );
    };

    const MemberXAxisTick = ({ x, y, payload }) => {
        const item = memberData[payload.index];
        if (!item) return null;
        return (
            <g transform={`translate(${x - 12},${y + 8})`}>
                <foreignObject width="24" height="24">
                    <Avatar name={item.name} id={item.id} size={24} />
                </foreignObject>
            </g>
        );
    };

    return (
        <div style={dashboardStyles.grid}>
            {/* 1. sprint Task Report */}
            <div style={dashboardStyles.card}>
                <div style={dashboardStyles.cardTitle}>
                    <span>Sprint Task Report</span>
                </div>
                <div style={dashboardStyles.chartContainer}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weeklyData} margin={{ top: 30, right: 10, left: -25, bottom: 20 }} barGap={-16}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={<CustomXAxisTick />} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
                            <Tooltip
                                cursor={false}
                                contentStyle={{
                                    backgroundColor: theme === 'dark' ? '#1e293b' : '#fff',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-color)',
                                    boxShadow: 'var(--shadow-md)',
                                    fontSize: '12px',
                                    color: 'var(--text-primary)'
                                }}
                                itemStyle={{ color: 'var(--text-primary)' }}
                            />
                            <Legend verticalAlign="top" align="right" iconType="circle" iconSize={8} wrapperStyle={{ top: 0, right: 0, fontSize: '11px' }} />
                            <Bar dataKey="total" name="Total Tasks" fill={`${projectColor}33`} radius={[4, 4, 0, 0]} barSize={16} />
                            <Bar dataKey="completed" name="Completed Tasks" fill={projectColor} radius={[4, 4, 0, 0]} barSize={16} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 2. Burndown Chart */}
            <div style={dashboardStyles.card}>
                <div style={dashboardStyles.cardTitle}>
                    <span>Burndown Chart</span>
                </div>
                <div style={dashboardStyles.chartContainer}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={finalBurndownData} margin={{ top: 30, right: 10, left: -25, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                            <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 9 }} dy={5} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: theme === 'dark' ? '#1e293b' : '#fff',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-color)',
                                    boxShadow: 'var(--shadow-md)',
                                    fontSize: '12px',
                                    color: 'var(--text-primary)'
                                }}
                                itemStyle={{ color: 'var(--text-primary)' }}
                            />
                            <Legend verticalAlign="top" align="right" iconType="plainline" iconSize={12} wrapperStyle={{ top: 0, right: 0, fontSize: '11px' }} />
                            <Line
                                type="monotone"
                                dataKey="ideal"
                                name="Ideal Burn"
                                stroke="var(--text-secondary)"
                                strokeWidth={1.5}
                                dot={false}
                                strokeDasharray="5 5"
                                opacity={0.5}
                            />
                            <Line
                                type="monotone"
                                dataKey="remainingEst"
                                name="Work Remaining (Est)"
                                stroke={projectColor}
                                strokeWidth={2.5}
                                dot={{ r: 3, fill: projectColor, strokeWidth: 1.5, stroke: '#fff' }}
                                activeDot={{ r: 5 }}
                                connectNulls
                            />
                            <Line
                                type="monotone"
                                dataKey="remainingActual"
                                name="Effort Remaining (Actual)"
                                stroke="var(--error-color)"
                                strokeWidth={2}
                                dot={{ r: 2, fill: 'var(--error-color)' }}
                                strokeDasharray="3 3"
                                connectNulls
                            />
                            {goalBurndownData.length > 0 && (
                                <Line
                                    type="stepAfter"
                                    dataKey="remainingGoals"
                                    name="Goals Remaining"
                                    stroke="var(--purple-color)"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: 'var(--purple-color)', strokeWidth: 2, stroke: 'var(--card-bg)' }}
                                    activeDot={{ r: 6 }}
                                />
                            )}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 3. Recent Activity */}
            <div style={{ ...dashboardStyles.card, padding: 0 }}>
                <div style={{ width: '100%', height: '100%', overflow: 'hidden', borderRadius: '16px' }}>
                    <RecentActivity sprintId={sprint?.id} />
                </div>
            </div>

            {/* SECOND ROW */}
            {/* 4. Task Status (Donut) */}
            <div style={dashboardStyles.card}>
                <div style={dashboardStyles.cardTitle}>Task Status</div>
                <div style={dashboardStyles.chartContainer}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={90}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={
                                        entry.name === 'Done' ? projectColor :
                                            entry.name === 'In Progress' ? 'var(--info-color)' :
                                                entry.name === 'Late' ? 'var(--error-color)' : 'var(--border-color)'
                                    } />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{
                                backgroundColor: theme === 'dark' ? '#1e293b' : '#fff',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                fontSize: '12px',
                                color: 'var(--text-primary)'
                            }} />
                            <Legend verticalAlign="bottom" height={40} iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '20px', color: 'var(--text-secondary)' }} />
                            <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '24px', fontWeight: '700', fill: 'var(--text-primary)' }}>
                                {allTasks.filter(t => getStatusLabel(t.status) !== 'Done').length}
                            </text>
                            <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '14px', fill: 'var(--text-secondary)' }}>
                                Tasks left
                            </text>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 5. Priority Chart */}
            <div style={dashboardStyles.card}>
                <div style={dashboardStyles.cardTitle}>Priority Breakdown</div>
                <div style={dashboardStyles.chartContainer}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={priorityData} margin={{ top: 30, right: 10, left: -25, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                            <XAxis dataKey="priority" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
                            <Tooltip
                                cursor={false}
                                contentStyle={{
                                    backgroundColor: theme === 'dark' ? '#1e293b' : '#fff',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    color: 'var(--text-primary)'
                                }}
                            />
                            <Legend verticalAlign="top" align="right" iconSize={8} wrapperStyle={{ top: 0, right: 0, fontSize: '10px' }} />
                            <Bar dataKey="To Do" stackId="a" fill="var(--bg-secondary)" radius={[0, 0, 0, 0]} barSize={20} />
                            <Bar dataKey="In Progress" stackId="a" fill="var(--info-color)" radius={[0, 0, 0, 0]} barSize={20} />
                            <Bar dataKey="Done" stackId="a" fill={projectColor} radius={[4, 4, 0, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 6. Member Allocation */}
            <div style={dashboardStyles.card}>
                <div style={dashboardStyles.cardTitle}>Member Allocation</div>
                <div style={dashboardStyles.chartContainer}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={memberData} margin={{ top: 30, right: 10, left: -25, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={<MemberXAxisTick />} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
                            <Tooltip
                                cursor={false}
                                contentStyle={{
                                    backgroundColor: theme === 'dark' ? '#1e293b' : '#fff',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    color: 'var(--text-primary)'
                                }}
                            />
                            <Legend verticalAlign="top" align="right" iconSize={8} wrapperStyle={{ top: 0, right: 0, fontSize: '10px' }} />
                            <Bar dataKey="To Do" stackId="a" fill="var(--bg-secondary)" barSize={20} />
                            <Bar dataKey="In Progress" stackId="a" fill="var(--info-color)" barSize={20} />
                            <Bar dataKey="Done" stackId="a" fill={projectColor} radius={[4, 4, 0, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default SprintOverview;
