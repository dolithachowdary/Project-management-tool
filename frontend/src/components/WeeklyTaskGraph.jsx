import React, { useState } from "react";

export default function WeeklyTaskGraph() {
  /* ---------------- PROJECT CONFIG ---------------- */

  const projects = {
    TourO: { label: "TourO", color: "#e57373" },
    Dashboard: { label: "Dashboard", color: "#64b5f6" },
    Designing: { label: "Designing", color: "#81c784" },
  };

  /* ---------------- WEEKLY DATA ---------------- */

  const data = [
    { day: "Mon", projects: { TourO: 20, Dashboard: 12, Designing: 8 } },
    { day: "Tue", projects: { TourO: 25, Dashboard: 18, Designing: 12 } },
    { day: "Wed", projects: { TourO: 18, Dashboard: 15, Designing: 10 } },
    { day: "Thu", projects: { TourO: 22, Dashboard: 17, Designing: 13 } },
    { day: "Fri", projects: { TourO: 35, Dashboard: 25, Designing: 15 } },
    { day: "Sat", projects: { TourO: 15, Dashboard: 10, Designing: 5 } },
    { day: "Sun", projects: { TourO: 10, Dashboard: 6, Designing: 4 } },
  ];

  /* ---------------- FILTER ---------------- */

  const [selectedProject, setSelectedProject] = useState("All");

  const max = Math.max(
    ...data.map(d =>
      selectedProject === "All"
        ? Object.values(d.projects).reduce((a, b) => a + b, 0)
        : d.projects[selectedProject]
    )
  );

  /* ---------------- SVG CONSTANTS ---------------- */

  const width = 700;
  const barAreaHeight = 110;
  const baseY = 130;



  return (
    <div>
      {/* ---------- HEADER ---------- */}
      <div style={styles.header}>
        {/* LEGEND */}
        <div style={styles.legend}>
          {Object.entries(projects).map(([key, p]) => (
            <div key={key} style={styles.legendItem}>
              <span
                style={{
                  ...styles.legendDot,
                  background: p.color,
                }}
              />
              {p.label}
            </div>
          ))}
        </div>

        {/* FILTER */}
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          style={styles.select}
        >
          <option value="All">All Projects</option>
          {Object.keys(projects).map(p => (
            <option key={p} value={p}>
              {projects[p].label}
            </option>
          ))}
        </select>
      </div>

      {/* ---------- GRAPH ---------- */}
      <div style={styles.graphBox}>
        <svg viewBox={`0 0 ${width} 200`} width="100%" height="200">

          {data.map((d, i) => {
            const slotWidth = width / data.length;
            
            const barWidth = slotWidth * 0.42;

            const x = i * slotWidth + (slotWidth - barWidth) / 2;

            let currentY = baseY;

            const entries =
              selectedProject === "All"
                ? Object.entries(d.projects)
                : [[selectedProject, d.projects[selectedProject]]];

            return (
              <g key={d.day}>
                {/* STACKED BARS */}
                {entries.map(([projectKey, value]) => {
                  const h = (value / max) * barAreaHeight;
                  currentY -= h;

                  return (
                    <rect
                      key={projectKey}
                      x={x}
                      y={currentY}
                      width={barWidth}
                      height={h}
                      rx="2"
                      fill={projects[projectKey].color}
                    />
                  );
                })}

                {/* DAY LABEL */}
                <text
                  x={x + barWidth / 2}
                  y={170}
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

/* ---------------- STYLES ---------------- */

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  legend: {
    display: "flex",
    gap: 14,
  },

  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    color: "#444",
  },

  legendDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
  },

  select: {
    padding: "6px 10px",
    borderRadius: 6,
    border: "1px solid #ccc",
    fontSize: 13,
  },

  graphBox: {
    background: "#f6f6f6",
    borderRadius: 12,
    padding: "2px",
  },


  dayLabel: {
    fontSize: 12,
    fill: "#8a8a8a",
  },
};
