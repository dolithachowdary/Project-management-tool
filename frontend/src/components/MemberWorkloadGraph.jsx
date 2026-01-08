import React, { useState } from "react";
import Avatar from "./Avatar";

export default function MemberWorkloadGraph({ data = [] }) {
    const [tooltip, setTooltip] = useState(null);

    if (!data || data.length === 0) {
        return (
            <div style={styles.emptyWrap}>
                <div style={styles.emptyText}>No data available</div>
            </div>
        );
    }

    const maxTotal = Math.max(...data.map(d => d.total), 1);

    return (
        <div style={styles.wrapper}>
            {tooltip && (
                <div
                    style={{
                        ...styles.tooltip,
                        left: tooltip.x + 12,
                        top: tooltip.y + 12,
                    }}
                >
                    <strong>{tooltip.name}</strong>
                    <div style={{ color: '#64748b' }}>Assigned: {tooltip.total}</div>
                    <div style={{ color: '#c53030' }}>Completed: {tooltip.completed}</div>
                </div>
            )}

            <div style={styles.legend}>
                <div style={styles.legendItem}>
                    <span style={{ ...styles.dot, background: "#ffdad9" }} />
                    <span style={styles.legendLabel}>Total Tasks</span>
                </div>
                <div style={styles.legendItem}>
                    <span style={{ ...styles.dot, background: "#f87171" }} />
                    <span style={styles.legendLabel}>Completed Tasks</span>
                </div>
            </div>

            <div style={styles.graphContainer}>
                <div style={styles.graphBox}>
                    <svg viewBox="0 0 800 200" width="100%" height="100%" preserveAspectRatio="none">
                        {data.map((d, i) => {
                            const slot = 800 / data.length;
                            const barWidth = Math.min(40, slot * 0.4);
                            const x = i * slot + (slot - barWidth) / 2;
                            const chartAreaHeight = 160;
                            const baseY = 180;

                            const totalH = (d.total / maxTotal) * chartAreaHeight;
                            const completedH = (d.completed / maxTotal) * chartAreaHeight;

                            return (
                                <g
                                    key={i}
                                    onMouseMove={e =>
                                        setTooltip({
                                            ...d,
                                            x: e.clientX,
                                            y: e.clientY,
                                        })
                                    }
                                    onMouseLeave={() => setTooltip(null)}
                                >
                                    {/* TOTAL (LIGHT RED) */}
                                    <rect
                                        x={x}
                                        y={baseY - totalH}
                                        width={barWidth}
                                        height={Math.max(totalH, 4)}
                                        rx="6"
                                        fill="#ffdad9"
                                    />

                                    {/* COMPLETED (DARK RED) */}
                                    <rect
                                        x={x}
                                        y={baseY - completedH}
                                        width={barWidth}
                                        height={completedH}
                                        rx="6"
                                        fill="#f87171"
                                    />
                                </g>
                            );
                        })}
                    </svg>
                </div>

                <div style={styles.labelsRow}>
                    {data.map((d, i) => (
                        <div key={i} style={styles.labelCell}>
                            <Avatar name={d.name} id={d.id} size={28} />
                            <span style={styles.memberLabel}>
                                {d.name.split(" ")[0]}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

const styles = {
    wrapper: {
        position: "relative",
        width: "100%",
        height: "100%",
        padding: 0, // Removed inner padding and background to rely on parent chartCard
    },
    legend: {
        display: "flex",
        gap: 16,
        marginBottom: 20,
    },
    legendItem: {
        display: "flex",
        alignItems: "center",
        gap: 8,
    },
    legendLabel: {
        fontSize: 12,
        color: "#64748b",
        fontWeight: 500,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: "50%",
    },
    graphContainer: {
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        height: "calc(100% - 40px)"
    },
    graphBox: {
        width: "100%",
        height: "180px",
    },
    labelsRow: {
        display: "flex",
        width: "100%",
    },
    labelCell: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "6px",
        overflow: "hidden"
    },
    memberLabel: {
        fontSize: 11,
        fontWeight: 600,
        color: "#64748b",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        width: "100%",
        textAlign: "center"
    },
    tooltip: {
        position: "fixed",
        background: "#fff",
        border: "1px solid #f1f5f9",
        borderRadius: 8,
        padding: "10px 14px",
        fontSize: 12,
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
        pointerEvents: "none",
        zIndex: 9999,
    },
    emptyWrap: {
        height: "200px",
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
