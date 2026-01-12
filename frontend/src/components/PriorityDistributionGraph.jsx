import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { useTheme } from '../context/ThemeContext';

export default function PriorityDistributionGraph({ data = [] }) {
    const { theme } = useTheme();
    if (!data || data.length === 0) {
        return (
            <div style={styles.emptyWrap}>
                <div style={styles.emptyText}>No data available</div>
            </div>
        );
    }

    const COLORS = {
        Low: "var(--success-color)",
        Medium: "var(--warning-color)",
        High: "var(--error-color)"
    };

    return (
        <div style={styles.wrapper}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 500 }}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                        allowDecimals={false}
                    />
                    <Tooltip
                        cursor={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                        contentStyle={{
                            background: 'var(--card-bg)',
                            borderRadius: '12px',
                            border: '1px solid var(--border-color)',
                            boxShadow: 'var(--shadow-md)',
                            fontSize: '13px',
                            padding: '10px 14px',
                            color: 'var(--text-primary)'
                        }}
                        itemStyle={{ color: 'var(--text-primary)' }}
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
        background: "var(--bg-secondary)",
        borderRadius: 12,
    },
    emptyText: {
        color: "var(--text-secondary)",
        fontSize: 13,
    }
};
