import React, { useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
    LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { format, eachDayOfInterval, startOfWeek, endOfWeek, isSameDay, parseISO } from 'date-fns';
import { getSprintBurndown } from '../api/sprints';
import RecentActivity from './RecentActivity';
import Avatar from './Avatar';

const SprintOverview = ({ data, styles }) => {
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
            background: '#fff',
            borderRadius: '16px',
            padding: '12px 16px',
            border: '1px solid #f1f5f9',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            height: '340px', // Uniform height increased
            overflow: 'hidden',
            boxSizing: 'border-box',
        },
        cardTitle: {
            fontSize: '15px',
            fontWeight: '700',
            color: '#1e293b',
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
                <text x={0} y={0} dy={16} textAnchor="middle" fill="#94a3b8" fontSize={10} fontWeight={600}>
                    {data.name}
                </text>
                <text x={0} y={0} dy={28} textAnchor="middle" fill="#cbd5e1" fontSize={9}>
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
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={<CustomXAxisTick />} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                            <Tooltip
                                cursor={false}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px' }}
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
                        <LineChart data={burndownChartData} margin={{ top: 30, right: 10, left: -25, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9 }} dy={5} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px' }}
                            />
                            <Legend verticalAlign="top" align="right" iconType="plainline" iconSize={12} wrapperStyle={{ top: 0, right: 0, fontSize: '11px' }} />
                            <Line
                                type="monotone"
                                dataKey="ideal"
                                name="Ideal Burn"
                                stroke="#94a3b8"
                                strokeWidth={1.5}
                                dot={false}
                                strokeDasharray="5 5"
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
                                stroke="#C62828"
                                strokeWidth={2}
                                dot={{ r: 2, fill: '#C62828' }}
                                strokeDasharray="3 3"
                                connectNulls
                            />
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
                                            entry.name === 'In Progress' ? '#C62828' :
                                                entry.name === 'Late' ? '#ef4444' : '#e2e8f0'
                                    } />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                            <Legend verticalAlign="bottom" height={40} iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '20px' }} />
                            <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '24px', fontWeight: '700', fill: '#1e293b' }}>
                                {allTasks.filter(t => getStatusLabel(t.status) !== 'Done').length}
                            </text>
                            <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '14px', fill: '#94a3b8' }}>
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
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="priority" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                            <Tooltip cursor={false} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                            <Legend verticalAlign="top" align="right" iconSize={8} wrapperStyle={{ top: 0, right: 0, fontSize: '10px' }} />
                            <Bar dataKey="To Do" stackId="a" fill="#e2e8f0" radius={[0, 0, 0, 0]} barSize={20} />
                            <Bar dataKey="In Progress" stackId="a" fill="#C62828" radius={[0, 0, 0, 0]} barSize={20} />
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
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={<MemberXAxisTick />} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                            <Tooltip
                                cursor={false}
                                contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                            />
                            <Legend verticalAlign="top" align="right" iconSize={8} wrapperStyle={{ top: 0, right: 0, fontSize: '10px' }} />
                            <Bar dataKey="To Do" stackId="a" fill="#e2e8f0" barSize={20} />
                            <Bar dataKey="In Progress" stackId="a" fill="#C62828" barSize={20} />
                            <Bar dataKey="Done" stackId="a" fill={projectColor} radius={[4, 4, 0, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default SprintOverview;
