import React from "react";

export default function MiniCalendar() {
  return (
    <div style={styles.card}>
      <div style={styles.calHeader}>
        <span style={styles.month}>November 2028</span>
        <div style={styles.navBtns}>
          <button style={styles.navBtn}>‹</button>
          <button style={styles.navBtn}>›</button>
        </div>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
              <th key={d} style={styles.th}>{d}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {[...Array(5)].map((_, row) => (
            <tr key={row}>
              {[...Array(7)].map((_, col) => {
                const date = row * 7 + col - 1;
                const day = date >= 1 && date <= 30 ? date : "";

                const highlighted = day === 5 || day === 12 || day === 19;

                return (
                  <td key={col} style={styles.td}>
                    <div
                      style={{
                        ...styles.day,
                        ...(highlighted ? styles.dotDay : {})
                      }}
                    >
                      {day}
                      {highlighted && <div style={styles.dot}></div>}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  card: {
    border: "1px solid #e5e5e5",
    borderRadius: 12,
    padding: 16,
    background: "#fff"
  },
  calHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10
  },
  month: {
    fontWeight: 600,
    fontSize: 15
  },
  navBtns: { display: "flex", gap: 6 },
  navBtn: {
    width: 26,
    height: 26,
    borderRadius: "50%",
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer"
  },
  table: { width: "100%", fontSize: 13, textAlign: "center" },
  th: { paddingBottom: 6, color: "#888", fontWeight: 500 },
  td: { padding: "4px 0" },
  day: {
    width: 26,
    height: 26,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    position: "relative"
  },
  dotDay: {
    fontWeight: 600
  },
  dot: {
    position: "absolute",
    bottom: 3,
    width: 5,
    height: 5,
    background: "#e53935",
    borderRadius: "50%"
  }
};
