import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import Avatar from './Avatar';

const MemberXAxisTick = ({ x, y, payload, data }) => {
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

export default function MemberPriorityGraph({ data = [] }) {
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
                <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        interval={0}
                        tick={(props) => <MemberXAxisTick {...props} data={data} />}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <Tooltip
                        cursor={false}
                        contentStyle={{
                            borderRadius: '8px',
                            border: 'none',
                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                            fontSize: '12px'
                        }}
                    />
                    <Legend
                        verticalAlign="top"
                        align="right"
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ top: -10, right: 0, fontSize: '11px' }}
                    />
                    <Bar dataKey="Low" stackId="priority" fill="#bbf7d0" barSize={20} radius={[0, 0, 0, 0]} />
                    <Bar dataKey="Medium" stackId="priority" fill="#fbde6aff" barSize={20} radius={[0, 0, 0, 0]} />
                    <Bar dataKey="High" stackId="priority" fill="#f9a2a2ff" barSize={20} radius={[4, 4, 0, 0]} />
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
