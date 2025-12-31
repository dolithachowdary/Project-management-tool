import React from "react";

const Stats = ({ data }) => {
  const stats = data || [
    {
      title: "Completed tasks",
      value: 0,
      percent: "0%",
      trend: "up",
      color: "#2e7d32",
      graph: [0, 0, 0, 0, 0, 0, 0],
    },
    {
      title: "Incompleted tasks",
      value: 0,
      percent: "0%",
      trend: "down",
      color: "#c62828",
      graph: [0, 0, 0, 0, 0, 0, 0],
    },
    {
      title: "Overdue tasks",
      value: 0,
      percent: "0%",
      trend: "up",
      color: "#777",
      graph: [0, 0, 0, 0, 0, 0, 0],
    },
  ];

  return (
    <div style={styles.row}>
      {stats.map((s, i) => (
        <div key={i} style={styles.card}>
          {/* LEFT */}
          <div>
            <div style={styles.title}>{s.title}</div>
            <div style={styles.value}>{s.value}</div>
          </div>

          {/* RIGHT */}
          <div style={styles.right}>
            <Sparkline data={s.graph || [0, 0, 0, 0, 0, 0, 0]} color={s.color} />

            <div style={{ ...styles.percent, color: s.color }}>
              {s.percent} {s.trend === "up" ? "▲" : "▼"}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Stats;

/* ---------------- SPARKLINE WITH GRADIENT ---------------- */

const Sparkline = ({ data, color }) => {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1 || 1)) * 80;
    const y = 30 - ((d - min) / (max - min || 1)) * 24;
    return { x, y };
  });

  const linePath = points
    .map(p => `${p.x},${p.y}`)
    .join(" ");

  const areaPath = `
    M ${points[0].x},30
    L ${linePath.replace(/,/g, " ")}
    L ${points[points.length - 1].x},30
    Z
  `;

  return (
    <svg width="90" height="40">
      <defs>
        <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* AREA */}
      <path
        d={areaPath}
        fill={`url(#grad-${color})`}
      />

      {/* LINE */}
      <polyline
        points={linePath}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

/* ---------------- STYLES ---------------- */

const styles = {
  row: {
    display: "flex",
    gap: 12,
    marginBottom: 20,
    flexWrap: "wrap"
  },

  card: {
    flex: "1 1 200px",
    background: "#ffffff",
    borderRadius: 16,
    padding: "20px 24px",
    border: "1px solid #f1f5f9",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)",
  },

  title: {
    fontSize: 14,
    fontWeight: 600,
    color: "#94a3b8",
    marginBottom: 8,
  },

  value: {
    fontSize: 32,
    fontWeight: 700,
    color: "#1e293b",
  },

  right: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
  },

  percent: {
    fontSize: 13,
    fontWeight: 500,
    marginTop: 4,
  },
};
