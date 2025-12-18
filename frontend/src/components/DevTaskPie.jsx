import React, { useState } from "react";

export default function DevTaskPie({ data }) {
  const [type, setType] = useState("pie"); // "pie" | "doughnut"
  const [hover, setHover] = useState(null);

  const size = 200;
  const center = size / 2;
  const radius = 90;
  const innerRadius = type === "doughnut" ? 45 : 0;

  const total = data.reduce((sum, d) => sum + d.total, 0);

  let startAngle = -90; // start from top

  const polarToCartesian = (cx, cy, r, angle) => {
    const rad = (Math.PI / 180) * angle;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  };

  const describeArc = (start, end) => {
    const largeArc = end - start > 180 ? 1 : 0;

    const outerStart = polarToCartesian(center, center, radius, end);
    const outerEnd = polarToCartesian(center, center, radius, start);

    if (innerRadius === 0) {
      // PIE
      return `
        M ${center} ${center}
        L ${outerStart.x} ${outerStart.y}
        A ${radius} ${radius} 0 ${largeArc} 0 ${outerEnd.x} ${outerEnd.y}
        Z
      `;
    }

    const innerStart = polarToCartesian(center, center, innerRadius, start);
    const innerEnd = polarToCartesian(center, center, innerRadius, end);

    return `
      M ${outerStart.x} ${outerStart.y}
      A ${radius} ${radius} 0 ${largeArc} 0 ${outerEnd.x} ${outerEnd.y}
      L ${innerStart.x} ${innerStart.y}
      A ${innerRadius} ${innerRadius} 0 ${largeArc} 1 ${innerEnd.x} ${innerEnd.y}
      Z
    `;
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h3 style={{ margin: 0 }}>Tasks by Project</h3>

        {/* TOGGLE */}
        <div style={styles.toggle}>
          <button
            onClick={() => setType("pie")}
            style={type === "pie" ? styles.activeBtn : styles.btn}
          >
            Pie
          </button>
          <button
            onClick={() => setType("doughnut")}
            style={type === "doughnut" ? styles.activeBtn : styles.btn}
          >
            Doughnut
          </button>
        </div>
      </div>

      {/* SVG CHART */}
      <svg width={size} height={size}>
        {data.map((d, i) => {
          const angle = (d.total / total) * 360;
          const path = describeArc(startAngle, startAngle + angle);
          const currentStart = startAngle;
          startAngle += angle;

          return (
            <path
              key={i}
              d={path}
              fill={d.color}
              onMouseEnter={() => setHover(d)}
              onMouseLeave={() => setHover(null)}
            />
          );
        })}
      </svg>

      {/* TOOLTIP */}
      {hover && (
        <div style={styles.tooltip}>
          <strong>{hover.project}</strong>
          <div>
            {hover.completed}/{hover.total} completed
          </div>
        </div>
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
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  toggle: {
    display: "flex",
    gap: 6,
  },

  btn: {
    border: "1px solid #ddd",
    background: "#fff",
    padding: "4px 10px",
    fontSize: 12,
    cursor: "pointer",
    borderRadius: 6,
  },

  activeBtn: {
    border: "1px solid #c62828",
    background: "#c62828",
    color: "#fff",
    padding: "4px 10px",
    fontSize: 12,
    cursor: "pointer",
    borderRadius: 6,
  },

  tooltip: {
    marginTop: 10,
    fontSize: 13,
    color: "#444",
  },
};
