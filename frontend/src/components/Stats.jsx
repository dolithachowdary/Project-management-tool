import React from "react";

const Stats = () => {
  const stats = [
    {
      title: "Completed tasks",
      value: 127,
      percent: "67.18%",
      trend: "up",
      color: "#2e7d32",
      graph: [10, 14, 13, 18, 17, 22, 25],
    },
    {
      title: "Incompleted tasks",
      value: 62,
      percent: "54.29%",
      trend: "down",
      color: "#c62828",
      graph: [25, 22, 24, 21, 23, 20, 18],
    },
    {
      title: "Overdue tasks",
      value: 20,
      percent: "14.11%",
      trend: "up",
      color: "#777",
      graph: [5, 6, 7, 6, 8, 9, 10],
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
            <Sparkline data={s.graph} color={s.color} />

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
  const max = Math.max(...data);
  const min = Math.min(...data);

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 80;
    const y = 30 - ((d - min) / (max - min)) * 24;
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
  },

  card: {
    flex: 1,
    background: "#ffffff",
    borderRadius: 12,
    padding: "16px 18px",
    border: "1px solid #e5e5e5",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 13,
    color: "#777",
    marginBottom: 6,
  },

  value: {
    fontSize: 28,
    fontWeight: 600,
    color: "#111",
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
