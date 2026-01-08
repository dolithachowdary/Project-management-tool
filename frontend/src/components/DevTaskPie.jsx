import React, { useState } from "react";

function polarToCartesian(cx, cy, r, angle) {
  const rad = ((angle - 90) * Math.PI) / 180.0;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return `
    M ${cx} ${cy}
    L ${start.x} ${start.y}
    A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}
    Z
  `;
}

export default function DevTaskPie({ data }) {
  const [mode, setMode] = useState("pie");
  const [tooltip, setTooltip] = useState(null);

  const total = data.reduce((s, d) => s + d.total, 0);
  let angle = 0;

  return (
    <div style={styles.card}>
      {/* HEADER */}
      <div style={styles.header}>
        <h3 style={styles.title}>Tasks by Project</h3>
        <div>
          <button
            style={mode === "pie" ? styles.activeBtn : styles.btn}
            onClick={() => setMode("pie")}
          >
            Pie
          </button>
          <button
            style={mode === "doughnut" ? styles.activeBtn : styles.btn}
            onClick={() => setMode("doughnut")}
          >
            Doughnut
          </button>
        </div>
      </div>

      {/* TOOLTIP */}
      {tooltip && (
        <div
          style={{
            ...styles.tooltip,
            left: tooltip.x + 12,
            top: tooltip.y + 12,
          }}
        >
          <strong>{tooltip.project}</strong>
          <div>Assigned: {tooltip.total}</div>
          <div>Completed: {tooltip.completed}</div>
          <div>Pending: {tooltip.total - tooltip.completed}</div>
        </div>
      )}

      {/* CHART */}
      <svg viewBox="0 0 200 200" width="200" height="200">
        {mode === "pie" &&
          data.map((d, i) => {
            const sliceAngle = (d.total / total) * 360;
            const path = describeArc(
              100,
              100,
              80,
              angle,
              angle + sliceAngle
            );
            angle += sliceAngle;

            return (
              <path
                key={i}
                d={path}
                fill={d.color}
                onMouseMove={e =>
                  setTooltip({
                    ...d,
                    x: e.clientX,
                    y: e.clientY,
                  })
                }
                onMouseLeave={() => setTooltip(null)}
              />
            );
          })}

        {mode === "doughnut" &&
          (() => {
            let acc = 0;
            return data.map((d, i) => {
              const value = (d.total / total) * 100;
              const dash = `${value} ${100 - value}`;
              const offset = -acc;
              acc += value;

              return (
                <circle
                  key={i}
                  cx="100"
                  cy="100"
                  r="70"
                  fill="transparent"
                  stroke={d.color}
                  strokeWidth="18"
                  strokeDasharray={dash}
                  strokeDashoffset={offset}
                  onMouseMove={e =>
                    setTooltip({
                      ...d,
                      x: e.clientX,
                      y: e.clientY,
                    })
                  }
                  onMouseLeave={() => setTooltip(null)}
                />
              );
            });
          })()}
      </svg>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  card: {
    background: "#fff",
    borderRadius: 12,
    border: "1px solid #e5e5e5",
    padding: 16,
    textAlign: "center",
    position: "relative",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  title: {
    fontSize: 16,
    fontWeight: 600,
  },

  btn: {
    padding: "4px 10px",
    marginLeft: 6,
    borderRadius: 6,
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
  },

  activeBtn: {
    padding: "4px 10px",
    marginLeft: 6,
    borderRadius: 6,
    border: "none",
    background: "#C62828",
    color: "#fff",
    cursor: "pointer",
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
