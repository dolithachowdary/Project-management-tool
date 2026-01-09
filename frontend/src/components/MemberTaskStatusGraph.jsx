import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export default function MemberTaskStatusGraph({ data = [] }) {
    if (!data || data.length === 0) {
        return (
            <div style={styles.emptyWrap}>
                <div style={styles.emptyText}>No stack data available</div>
            </div>
        );
    }

    const COLORS = {
        todo: "#FDE68A",        // Yellow 200
        inprogress: "#BFDBFE",  // Blue 200
        done: "#BBF7D0"         // Green 200
    };

    const BORDERS = {
        todo: "#FCD34D",        // Yellow 300
        inprogress: "#93C5FD",  // Blue 300
        done: "#86EFAC"         // Green 300
    };

    const TEXT_COLORS = {
        todo: "#B45309",        // Amber 700
        inprogress: "#1D4ED8",  // Blue 700
        done: "#047857"         // Green 700
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    backgroundColor: '#fff',
                    padding: '12px 16px',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                }}>
                    <p style={{ margin: '0 0 8px 0', fontWeight: '700', color: '#1e293b' }}>{label}</p>
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
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis
                        type="category"
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                        width={80}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
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
        background: "#f8fafc",
        borderRadius: 12,
    },
    emptyText: {
        color: "#94a3b8",
        fontSize: 13,
    }
};
