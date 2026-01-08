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
  const [tooltip, setTooltip] = useState(null);

  const total = data.reduce((s, d) => s + d.total, 0);
  let angle = 0;

  return (
    <div style={styles.card}>
      {/* HEADER */}
      <div style={styles.header}>
        <h3 style={styles.title}>Tasks by Project</h3>
      </div>

      {total === 0 && (
        <div style={{ color: "#64748b", fontSize: "14px", padding: "40px 0" }}>
          No tasks assigned yet
        </div>
      )}

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
      {total > 0 && (
        <svg viewBox="0 0 200 200" width="200" height="150" style={{ display: "block", margin: "0 auto" }}>
          {data.map((d, i) => {
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
                style={{ cursor: "pointer", transition: "all 0.2s" }}
              />
            );
          })}
        </svg>
      )}
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
