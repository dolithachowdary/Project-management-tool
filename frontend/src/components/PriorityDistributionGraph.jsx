import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

export default function PriorityDistributionGraph({ data = [] }) {
    if (!data || data.length === 0) {
        return (
            <div style={styles.emptyWrap}>
                <div style={styles.emptyText}>No data available</div>
            </div>
        );
    }

    const COLORS = {
        Low: "#bbf7d0",
        Medium: "#fbde6aff",
        High: "#f9a2a2ff"
    };

    return (
        <div style={styles.wrapper}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        allowDecimals={false}
                    />
                    <Tooltip
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                            fontSize: '13px',
                            padding: '10px 14px'
                        }}
                    />
                    <Bar dataKey="count" barSize={20} radius={[6, 6, 0, 0]}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[entry.name] || "#cbd5e1"} />
                        ))}
                    </Bar>
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
