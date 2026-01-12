import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useTheme } from '../context/ThemeContext';
import Avatar from './Avatar';

const CustomXAxisTick = ({ x, y, payload, data }) => {
    const item = data[payload.index];
    if (!item) return null;
    return (
        <g transform={`translate(${x - 16},${y + 15})`}>
            <foreignObject width="32" height="32">
                <Avatar name={item.name} id={item.id} size={24} />
            </foreignObject>
        </g>
    );
};

export default function MemberEfficiencyGraph({ data = [] }) {
    const { theme } = useTheme();
    if (!data || data.length === 0) {
        return (
            <div style={styles.emptyWrap}>
                <div style={styles.emptyText}>No data available</div>
            </div>
        );
    }

    return (
        <div style={styles.wrapper}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={<CustomXAxisTick data={data} />}
                        height={60}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
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
                    <Legend
                        verticalAlign="top"
                        align="right"
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ top: -10, right: 0, fontSize: '11px' }}
                    />
                    <Bar name="Estimated" dataKey="estimated" fill="var(--info-bg)" barSize={12} radius={[4, 4, 0, 0]} />
                    <Bar name="Actual" dataKey="actual" fill="var(--info-color)" barSize={12} radius={[4, 4, 0, 0]} />
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
