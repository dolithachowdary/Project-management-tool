import React from "react";

export default function ActiveProjects() {
  const projects = [
    {
      name: "TourO Web Development",
      progress: 70,
      range: "Jan 10, 2024 – Jul 30, 2024",
      left: "2 Days Left",
      color: "#d46a6a",
      avatars: ["👨", "👩", "👨"]
    },
    {
      name: "Dashboard Portal",
      progress: 50,
      range: "Jan 10, 2024 – Jul 30, 2024",
      left: "2 Weeks Left",
      color: "#c4a93b",
      avatars: ["👨", "👩", "👩"]
    },
    {
      name: "Designing",
      progress: 85,
      range: "Jan 10, 2024 – Jul 30, 2024",
      left: "1 Month Left",
      color: "#3e8ec9",
      avatars: ["👨", "👩", "👨"]
    }
  ];

  return (
    <>
      <h3 style={styles.sectionTitle}>Active Projects</h3>
      <div style={styles.grid}>
        {projects.map((p, i) => (
          <div key={i} style={styles.card}>
            <div style={styles.title}>{p.name}</div>

            <div style={styles.progressWrapper}>
              <div style={{ ...styles.progressFill, width: p.progress + "%", background: p.color }}></div>
            </div>

            <div style={styles.range}>{p.range}</div>

            <div style={styles.footer}>
              <div>
                {p.avatars.map((a, idx) => (
                  <span key={idx} style={styles.avatar}>{a}</span>
                ))}
              </div>

              <div style={styles.badge}>{p.left}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

const styles = {
  sectionTitle: {
    margin: "20px 0 10px",
    fontSize: 18,
    fontWeight: 600
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 16,
    marginBottom: 25
  },
  card: {
    background: "#fff",
    borderRadius: 12,
    border: "1px solid #eee",
    padding: 16,
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
  },
  title: { fontSize: 16, fontWeight: 600 },
  progressWrapper: {
    width: "100%",
    height: 10,
    background: "#eee",
    borderRadius: 6,
    marginTop: 10,
    overflow: "hidden"
  },
  progressFill: {
    height: "100%",
    borderRadius: 6
  },
  range: {
    fontSize: 12,
    color: "#777",
    marginTop: 6
  },
  footer: {
    marginTop: 12,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  avatar: {
    fontSize: 18,
    marginRight: 4
  },
  badge: {
    background: "#eee0e0",
    padding: "4px 10px",
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 600,
    color: "#444"
  }
};
