import React, { useState } from "react";

export default function WeeklyTaskGraph({ data = [] }) {
  const [tooltip, setTooltip] = useState(null);

  // If no data provided, display short message
  if (!data || data.length === 0) {
    return (
      <div style={styles.emptyWrap}>
        <div style={styles.emptyText}>Loading graph data...</div>
      </div>
    );
  }

  // Use provided data
  const normalized = data.map(d => ({
    ...d,
    completed: Math.min(d.completed, d.today),
  }));

  const maxToday = Math.max(...normalized.map(d => d.today));

  return (
    <div style={styles.wrapper}>
      {/* TOOLTIP */}
      {tooltip && (
        <div
          style={{
            ...styles.tooltip,
            left: tooltip.x + 12,
            top: tooltip.y + 12,
          }}
        >
          <strong>{tooltip.day}</strong>
          <div style={{ color: '#64748b' }}>Total Tasks: {tooltip.today}</div>
          <div style={{ color: '#6366f1' }}>Completed: {tooltip.completed}</div>
        </div>
      )}

      {/*  LEGEND */}
      <div style={styles.topRow}>
        <div style={styles.legend}>
          <div style={styles.legendItem}>
            <span style={{ ...styles.dot, background: "#f1f5f9" }} />
            <span style={styles.legendLabel}>Total Tasks</span>
          </div>
          <div style={styles.legendItem}>
            <span style={{ ...styles.dot, background: "#6366f1" }} />
            <span style={styles.legendLabel}>Completed Tasks</span>
          </div>
        </div>
      </div>

      {/* GRAPH */}
      <div style={styles.graphBox}>
        <svg viewBox="0 0 620 220" width="100%" height="220">
          {normalized.map((d, i) => {
            const slot = 620 / normalized.length;
            const barWidth = 40;
            const x = i * slot + (slot - barWidth) / 2;

            const chartHeight = 180;
            const todayHeight = maxToday > 0 ? (d.today / maxToday) * chartHeight : 0;
            const completedHeight = d.today > 0 ? (d.completed / d.today) * todayHeight : 0;

            const baseY = 200;

            return (
              <g
                key={d.day + i}
                onMouseMove={e =>
                  setTooltip({
                    ...d,
                    x: e.clientX,
                    y: e.clientY,
                  })
                }
                onMouseLeave={() => setTooltip(null)}
              >
                {/* TOTAL TASKS (Background Bar) */}
                <rect
                  x={x}
                  y={baseY - todayHeight}
                  width={barWidth}
                  height={todayHeight || 2} // small line if 0
                  rx="6"
                  fill="#f1f5f9"
                  style={{ transition: 'all 0.3s' }}
                />

                {/* COMPLETED TASKS (Highlight Bar) */}
                <rect
                  x={x}
                  y={baseY - completedHeight}
                  width={barWidth}
                  height={completedHeight}
                  rx="6"
                  fill="#6366f1"
                  style={{ transition: 'all 0.5s' }}
                />

                {/* DAY LABEL */}
                <text
                  x={x + barWidth / 2}
                  y={baseY + 18}
                  textAnchor="middle"
                  style={styles.dayLabel}
                >
                  {d.day}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    position: "relative",
    width: "100%",
  },
  topRow: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: 16,
  },
  legend: {
    display: "flex",
    gap: 16,
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: 6,
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
  graphBox: {
    paddingTop: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: 600,
    fill: "#94a3b8",
  },
  tooltip: {
    position: "fixed",
    background: "#fff",
    border: "1px solid #f1f5f9",
    borderRadius: 12,
    padding: "10px 14px",
    fontSize: 12,
    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
    pointerEvents: "none",
    zIndex: 9999,
  },
  emptyWrap: {
    height: 220,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8fafc",
    borderRadius: 12,
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: 14,
  }
};
