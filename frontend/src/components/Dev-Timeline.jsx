import React from "react";

export default function DevTimeline() {
  const hours = ["10","11","12","13","14","15","16","17","18"];

  const projects = [
    {
      name: "Dashboard Portal",
      tasks: [
        { title: "UI Components", start: "10", end: "13", color: "#D5E4FF" },
        { title: "Charts", start: "14", end: "17", color: "#C7F5D7" }
      ]
    },
    {
      name: "TourO Web",
      tasks: [
        { title: "API Integration", start: "11", end: "16", color: "#FFD2D2" }
      ]
    }
  ];

  const toPercent = (t) => ((t - 10) / 8) * 100;

  return (
    <div style={styles.wrapper}>
      {/* HOURS */}
      <div style={styles.hoursRow}>
        <div style={{ width: 180 }} />
        <div style={styles.hours}>
          {hours.map(h => (
            <div key={h} style={styles.hour}>{h}:00</div>
          ))}
        </div>
      </div>

      {/* PROJECTS */}
      <div style={styles.body}>
        <div style={styles.projectCol}>
          {projects.map(p => (
            <div key={p.name} style={styles.projectRow}>{p.name}</div>
          ))}
        </div>

        <div style={styles.chart}>
          {projects.map((p, row) =>
            p.tasks.map((t, i) => (
              <div
                key={i}
                style={{
                  ...styles.task,
                  background: t.color,
                  top: row * 70 + 10,
                  left: `${toPercent(t.start)}%`,
                  width: `${toPercent(t.end) - toPercent(t.start)}%`
                }}
              >
                {t.title}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    background: "#fff",
    borderRadius: 12,
    border: "1px solid #ddd",
    padding: 20
  },
  hoursRow: {
    display: "flex",
    marginBottom: 8
  },
  hours: {
    flex: 1,
    display: "grid",
    gridTemplateColumns: "repeat(9, 1fr)"
  },
  hour: {
    textAlign: "center",
    fontSize: 13,
    fontWeight: 600
  },
  body: {
    display: "flex"
  },
  projectCol: {
    width: 180
  },
  projectRow: {
    height: 70,
    display: "flex",
    alignItems: "center",
    fontWeight: 600,
    borderBottom: "1px solid #eee"
  },
  chart: {
    flex: 1,
    position: "relative"
  },
  task: {
    position: "absolute",
    height: 44,
    borderRadius: 10,
    padding: "6px 10px",
    fontSize: 13,
    fontWeight: 500
  }
};
