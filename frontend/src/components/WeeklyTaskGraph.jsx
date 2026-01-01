import React, { useState } from "react";

export default function WeeklyTaskGraph({ data = [] }) {
  const [tooltip, setTooltip] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div style={styles.emptyWrap}>
        <div style={styles.emptyText}>No data available</div>
      </div>
    );
  }

  const normalized = data.map(d => ({
    ...d,
    completed: Math.min(Number(d.completed) || 0, Number(d.today) || 0),
    today: Number(d.today) || 0
  }));

  const maxTotal = Math.max(...normalized.map(d => d.today), 1);

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
          <strong>{tooltip.day}</strong>
          <div style={{ color: '#64748b' }}>Total: {tooltip.today}</div>
          <div style={{ color: '#c62828' }}>Done: {tooltip.completed}</div>
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

      <div style={styles.graphBox}>
        <svg viewBox="0 0 600 180" width="100%" height="180" preserveAspectRatio="none">
          {normalized.map((d, i) => {
            const slot = 600 / normalized.length;
            const barWidth = 44;
            const x = i * slot + (slot - barWidth) / 2;
            const chartAreaHeight = 120;
            const baseY = 140;

            const totalH = (d.today / maxTotal) * chartAreaHeight;
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

                <text
                  x={x + barWidth / 2}
                  y={baseY + 20}
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
    height: "100%",
    paddingTop: 10,
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
  graphBox: {
    width: "100%",
    height: 180,
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
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 12,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    pointerEvents: "none",
    zIndex: 9999,
  },
  emptyWrap: {
    height: 180,
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
