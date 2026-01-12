import React, { useState } from "react";
import { useTheme } from "../context/ThemeContext";

export default function ProjectDistributionChart({ data = [] }) {
    const { theme } = useTheme();
    const [tooltip, setTooltip] = useState(null);

    if (!data || data.length === 0) {
        return (
            <div style={styles.emptyWrap}>
                <div style={styles.emptyText}>No project data found</div>
            </div>
        );
    }

    const totalTasks = data.reduce((sum, item) => sum + item.count, 0);
    const hasPendingTasks = totalTasks > 0;

    // Calculate SVG paths for segments
    let cumulativePercent = 0;

    const getCoordinatesForPercent = (percent) => {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);
        return [x, y];
    };

    return (
        <div style={styles.wrapper}>
            {tooltip && (
                <div
                    style={{
                        ...styles.tooltip,
                        left: tooltip.x + 12,
                        top: tooltip.y + 12,
                        backgroundColor: theme === 'dark' ? '#1e293b' : '#fff',
                    }}
                >
                    <strong>{tooltip.name}</strong>
                    <div style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>To Do: {tooltip.todo}</div>
                    <div style={{ color: 'var(--text-secondary)' }}>In Progress: {tooltip.inprogress}</div>
                    <div style={{ color: tooltip.color, fontWeight: '700', marginTop: '4px' }}>
                        Total Pending: {tooltip.count}
                    </div>
                </div>
            )}

            <div style={styles.chartContainer}>
                <div style={styles.svgWrapper}>
                    <svg viewBox="-1.2 -1.2 2.4 2.4" style={styles.svg}>
                        {!hasPendingTasks ? (
                            <circle cx="0" cy="0" r="1" fill="var(--bg-secondary)" />
                        ) : (
                            data.map((item, index) => {
                                const startPercent = cumulativePercent;
                                const slicePercent = item.count / totalTasks;
                                cumulativePercent += slicePercent;

                                const [startX, startY] = getCoordinatesForPercent(startPercent);
                                const [endX, endY] = getCoordinatesForPercent(cumulativePercent);

                                const largeArcFlag = slicePercent > 0.5 ? 1 : 0;

                                const pathData = [
                                    `M ${startX} ${startY}`,
                                    `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                                    `L 0 0`,
                                ].join(" ");

                                return (
                                    <path
                                        key={index}
                                        d={pathData}
                                        fill={item.color || "#e2e8f0"}
                                        onMouseMove={(e) =>
                                            setTooltip({
                                                ...item,
                                                x: e.clientX,
                                                y: e.clientY
                                            })
                                        }
                                        onMouseLeave={() => setTooltip(null)}
                                        style={styles.path}
                                    />
                                );
                            })
                        )}
                        {/* Doughnut hole */}
                        <circle cx="0" cy="0" r="0.65" fill="var(--card-bg)" />

                        {/* Center Text */}
                        <text
                            x="0" y="-0.1"
                            textAnchor="middle"
                            style={{ ...styles.totalLabel, fill: "var(--text-secondary)" }}
                        >
                            Total
                        </text>
                        <text
                            x="0" y="0.25"
                            textAnchor="middle"
                            style={{ ...styles.totalValue, fill: "var(--text-primary)" }}
                        >
                            {totalTasks}
                        </text>
                    </svg>
                </div>

                <div style={styles.legend}>
                    {data.map((item, index) => (
                        <div key={index} style={styles.legendItem}>
                            <div style={styles.legendDotCol}>
                                <span style={{ ...styles.dot, background: item.color }} />
                            </div>
                            <div style={styles.legendMainCol}>
                                <div style={styles.legendTextRow}>
                                    <span style={styles.legendName}>{item.name}</span>
                                    <span style={styles.legendCount}>{item.count}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

const styles = {
    wrapper: {
        width: "100%",
        height: "100%",
        padding: 0,
        display: "flex",
        flexDirection: "column",
    },
    chartContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: "16px",
        height: "100%",
        padding: "5px 0"
    },
    svgWrapper: {
        width: "170px",
        height: "170px",
        flexShrink: 0
    },
    svg: {
        width: "100%",
        height: "100%",
        transform: "rotate(-90deg)",
    },
    path: {
        transition: "transform 0.2s, opacity 0.2s",
        cursor: "pointer",
        ":hover": {
            opacity: 0.8,
            transform: "scale(1.02)"
        }
    },
    totalLabel: {
        fontSize: "0.22px",
        fill: "var(--text-secondary)",
        fontWeight: "500",
        transform: "rotate(90deg)",
    },
    totalValue: {
        fontSize: "0.4px",
        fill: "var(--text-primary)",
        fontWeight: "800",
        transform: "rotate(90deg)",
    },
    legend: {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        width: "100%",
        maxHeight: "150px",
        overflowY: "auto",
        paddingRight: "4px"
    },
    legendItem: {
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
    },
    legendDotCol: {
        paddingTop: "4px"
    },
    legendMainCol: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: "4px"
    },
    legendTextRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
    },
    dot: {
        width: "10px",
        height: "10px",
        borderRadius: "3px",
        flexShrink: 0,
        display: "block"
    },
    legendName: {
        fontSize: "13px",
        color: "var(--text-primary)",
        fontWeight: "600",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
    },
    legendCount: {
        fontSize: "13px",
        color: "var(--text-secondary)",
        fontWeight: "700"
    },
    progressRow: {
        display: "flex",
        alignItems: "center",
        gap: "8px"
    },
    progressContainer: {
        height: "6px",
        background: "var(--border-color)",
        borderRadius: "3px",
        flex: 1,
        overflow: "hidden"
    },
    progressBar: {
        height: "100%",
        borderRadius: "3px",
        transition: "width 0.3s ease"
    },
    progressLabel: {
        fontSize: "11px",
        fontWeight: "700",
        color: "var(--text-secondary)",
        minWidth: "30px",
        textAlign: "right"
    },
    tooltip: {
        position: "fixed",
        background: "var(--card-bg)",
        border: "1px solid var(--border-color)",
        borderRadius: 8,
        padding: "10px 14px",
        fontSize: 12,
        boxShadow: "var(--shadow-md)",
        pointerEvents: "none",
        zIndex: 9999,
        color: "var(--text-primary)"
    },
    emptyWrap: {
        height: "200px",
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
