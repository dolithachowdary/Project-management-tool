import React from "react";

export default function WeeklyTaskGraph() {
  // Example data (can be replaced with backend data)
  const data = [
    { day: "Mon", value: 40 },
    { day: "Tue", value: 55 },
    { day: "Wed", value: 48 },
    { day: "Thu", value: 52 },
    { day: "Fri", value: 75 },
    { day: "Sat", value: 30 },
    { day: "Sun", value: 20 }
  ];

  const max = Math.max(...data.map(d => d.value));

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>Weekly Task Report</h3>

      <div style={styles.graphBox}>
        <svg width="100%" height="180">
          {data.map((d, i) => {
            const barWidth = 40;
            const gap = 35;
            const height = (d.value / max) * 130;

            return (
              <g key={i} transform={`translate(${i * (barWidth + gap)}, 0)`}>
                <rect
                  x="0"
                  y={160 - height}
                  width={barWidth}
                  height={height}
                  rx="8"
                  fill="#ffd8d8"
                />
                {/* dark inner part */}
                <rect
                  x="0"
                  y={160 - height / 2}
                  width={barWidth}
                  height={height / 2}
                  rx="8"
                  fill="#e88989"
                />

                <text
                  x={barWidth / 2}
                  y={175}
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
  card: {
    background: "#fff",
    borderRadius: 12,
    border: "1px solid #eee",
    padding: 20,
    marginBottom: 20
  },
  title: {
    marginBottom: 10,
    fontSize: 18,
    fontWeight: 600
  },
  graphBox: {
    background: "#f6f6f6",
    borderRadius: 12,
    padding: 10
  },
  dayLabel: {
    fontSize: 12,
    fill: "#999"
  }
};
