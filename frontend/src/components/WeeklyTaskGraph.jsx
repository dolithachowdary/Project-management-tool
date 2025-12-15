import React from "react";

export default function WeeklyTaskGraph() {
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
    <div style={styles.graphBox}>
      <svg
        viewBox="0 0 700 160"
        width="100%"
        height="160"
        preserveAspectRatio="xMidYMid meet"
      >
        {data.map((d, i) => {
          const slotWidth = 700 / data.length;
          const barWidth = slotWidth * 0.6; // 🔽 tighter bars
          const x = i * slotWidth + (slotWidth - barWidth) / 2;
          const height = (d.value / max) * 95; // 🔽 less vertical waste
          const baseY = 115; // 🔼 move graph upward

          return (
            <g key={d.day}>
              {/* light bar */}
              <rect
                x={x}
                y={baseY - height}
                width={barWidth}
                height={height}
                rx="7"
                fill="#ffd8d8"
              />

              {/* dark inner bar */}
              <rect
                x={x}
                y={baseY - height / 2}
                width={barWidth}
                height={height / 2}
                rx="7"
                fill="#e88989"
              />

              {/* day label */}
              <text
                x={x + barWidth / 2}
                y={140}   // 🔼 pulled up (less bottom gap)
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
  );
}

const styles = {
  graphBox: {
    background: "#f6f6f6",
    borderRadius: 12,
    padding: "120px 14px 14px 14px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  dayLabel: {
    fontSize: 12,
    fill: "#8a8a8a"
  }
};
