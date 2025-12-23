import React, { useState } from "react";

export default function WeeklyTaskGraph() {
  const data = [
    { day: "Mon", today: 20, completed: 15 },
    { day: "Tue", today: 15, completed: 20 }, // ⚠ inconsistent input
    { day: "Wed", today: 18, completed: 12 },
    { day: "Thu", today: 22, completed: 16 },
    { day: "Fri", today: 30, completed: 25 },
    { day: "Sat", today: 10, completed: 6 },
    { day: "Sun", today: 8, completed: 4 },
  ];

  // 🔒 Clamp completed so it never exceeds today
  const normalized = data.map(d => ({
    ...d,
    completed: Math.min(d.completed, d.today),
  }));

  const maxToday = Math.max(...normalized.map(d => d.today));

  const [tooltip, setTooltip] = useState(null);

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
          <div>Completed: {tooltip.completed}</div>
          <div>Today: {tooltip.today}</div>
          <div>Total: {tooltip.today}</div>
        </div>
      )}

      <div style={styles.graphBox}>
        <svg viewBox="0 0 620 160" width="100%" height="160">
          {normalized.map((d, i) => {
            const slot = 620 / normalized.length;
            const barWidth = slot * 0.78;
            const x = i * slot + (slot - barWidth) / 2;

            const todayHeight = (d.today / maxToday) * 90;
            const completedHeight =
              (d.completed / d.today) * todayHeight;

            const baseY = 125;

            return (
              <g
                key={d.day}
                onMouseMove={e =>
                  setTooltip({
                    ...d,
                    x: e.clientX,
                    y: e.clientY,
                  })
                }
                onMouseLeave={() => setTooltip(null)}
              >
                {/* TODAY (light, total) */}
                <rect
                  x={x}
                  y={baseY - todayHeight}
                  width={barWidth}
                  height={todayHeight}
                  rx="7"
                  fill="#ffd8d8"
                />

                {/* COMPLETED (dark, inside today) */}
                <rect
                  x={x}
                  y={baseY - completedHeight}
                  width={barWidth}
                  height={completedHeight}
                  rx="7"
                  fill="#e88989"
                />

                {/* DAY LABEL */}
                <text
                  x={x + barWidth / 2}
                  y={148}
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

/* ================= STYLES ================= */

const styles = {
  wrapper: {
    position: "relative",
  },

  graphBox: {
    background: "#f6f6f6",
    borderRadius: 14,
    height: 260,
    padding: 16,
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
  },

  dayLabel: {
    fontSize: 13,
    fontWeight: 600,
    fill: "#6f6f6f",
  },

  tooltip: {
    position: "fixed",
    background: "#fff",
    border: "1px solid #e5e5e5",
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 13,
    boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
    pointerEvents: "none",
    zIndex: 9999,
  },
};
