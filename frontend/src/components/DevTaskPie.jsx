import React, { useState } from "react";

export default function DevTaskPie({ data }) {
  const [hover, setHover] = useState(null);
  const total = data.reduce((s, d) => s + d.total, 0);
  let acc = 0;

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>Tasks by Project</h3>

      <svg viewBox="0 0 32 32" width="180">
        {data.map((d, i) => {
          const value = (d.total / total) * 100;
          const dash = `${value} ${100 - value}`;
          const offset = -acc;
          acc += value;

          return (
            <circle
              key={i}
              r="16"
              cx="16"
              cy="16"
              fill="transparent"
              stroke={d.color}
              strokeWidth="6"
              strokeDasharray={dash}
              strokeDashoffset={offset}
              onMouseEnter={() => setHover(d)}
              onMouseLeave={() => setHover(null)}
            />
          );
        })}
      </svg>

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

const styles = {
  card: {
    background: "#fff",
    borderRadius: 12,
    border: "1px solid #e5e5e5",
    padding: 16,
    textAlign: "center",
  },
  title: { marginBottom: 12 },
  tooltip: { marginTop: 10, fontSize: 13 },
};
