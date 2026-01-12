import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useTheme } from '../context/ThemeContext';

export default function MemberTaskStatusGraph({ data = [] }) {
    const { theme } = useTheme();
    if (!data || data.length === 0) {
        return (
            <div style={styles.emptyWrap}>
                <div style={styles.emptyText}>No stack data available</div>
            </div>
        );
    }

    const COLORS = {
        todo: "var(--warning-bg)",
        inprogress: "var(--info-bg)",
        done: "var(--success-bg)"
    };

    const BORDERS = {
        todo: "var(--warning-color)",
        inprogress: "var(--info-color)",
        done: "var(--success-color)"
    };

    const TEXT_COLORS = {
        todo: "var(--warning-color)",
        inprogress: "var(--info-color)",
        done: "var(--success-color)"
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    backgroundColor: theme === 'dark' ? '#1e293b' : '#fff',
                    padding: '12px 16px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow-md)',
                    color: 'var(--text-primary)'
                }}>
                    <p style={{ margin: '0 0 8px 0', fontWeight: '700', color: 'var(--text-primary)' }}>{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{
                            margin: '4px 0',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: TEXT_COLORS[entry.dataKey] || entry.color
                        }}>
                            {entry.name}: {entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    const renderLegendText = (value, entry) => {
        const { dataKey } = entry;
        return <span style={{ color: TEXT_COLORS[dataKey], fontWeight: '700', marginLeft: '4px' }}>{value}</span>;
    };

    return (
        <div style={styles.wrapper}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    layout="vertical"
                    data={data}
                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--border-color)" />
                    <XAxis type="number" hide />
                    <YAxis
                        type="category"
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 500 }}
                        width={80}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} />
                    <Legend
                        verticalAlign="top"
                        align="right"
                        iconType="square"
                        iconSize={12}
                        formatter={renderLegendText}
                        wrapperStyle={{ paddingBottom: '20px', fontSize: '13px' }}
                    />
                    <Bar dataKey="todo" name="To do" stackId="status" fill={COLORS.todo} stroke={BORDERS.todo} barSize={25} radius={[0, 0, 0, 0]} />
                    <Bar dataKey="inprogress" name="In progress" stackId="status" fill={COLORS.inprogress} stroke={BORDERS.inprogress} barSize={25} radius={[0, 0, 0, 0]} />
                    <Bar dataKey="done" name="Done" stackId="status" fill={COLORS.done} stroke={BORDERS.done} barSize={25} radius={[0, 4, 4, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

const styles = {
    wrapper: {
        width: "100%",
        height: "100%",
        position: "relative"
    },
    emptyWrap: {
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-secondary)",
        borderRadius: 12,
    },
    emptyText: {
        color: "var(--text-secondary)",
        fontSize: 13,
    }
};
