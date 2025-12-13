import React from "react";

export default function PMTimeline() {
  const hours = ["10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"];

  const employees = [
    {
      name: "Hank Williams",
      tasks: [
        { title: "Contact customers with failed payments", start: "10:00", end: "12:00", color: "#FFE5B4" },
        { title: "Task detail modal", start: "13:00", end: "15:00", color: "#FFD2D2" }
      ]
    },
    {
      name: "Hanna Rodrigues",
      tasks: [
        { title: "Dashboard: concept", start: "11:00", end: "15:00", color: "#C7F5D7" }
      ]
    },
    {
      name: "Mitchel Fleen",
      tasks: [
        { title: "Reporting: Visual dashboard", start: "10:00", end: "18:00", color: "#D5E4FF" }
      ]
    }
  ];

  // Convert HH:MM → minutes
  const toMinutes = (t) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  const startMinutes = toMinutes("10:00");
  const endMinutes = toMinutes("18:00");
  const totalMinutes = endMinutes - startMinutes; // 480 minutes

  return (
    <div style={styles.wrapper}>

      {/* TOP HOURS */}
      <div style={styles.hoursRow}>
        <div style={styles.leftSpacer}></div>

        <div style={styles.hoursGrid}>
          {hours.map((h) => (
            <div key={h} style={styles.hourCell}>{h}</div>
          ))}
        </div>
      </div>

      {/* MAIN GRID */}
      <div style={styles.mainSection}>

        {/* LEFT EMPLOYEES */}
        <div style={styles.employeeColumn}>
          {employees.map((emp, idx) => (
            <div key={idx} style={styles.employeeRow}>
              <span style={styles.employeeName}>{emp.name}</span>
            </div>
          ))}
        </div>

        {/* RIGHT GANTT AREA */}
        <div style={styles.chartArea}>

          {/* BACKGROUND GRID LINES */}
          <div style={styles.verticalLines}>
            {hours.map((_, i) => (
              <div key={i} style={styles.vLine}></div>
            ))}
          </div>

          {/* TASK BLOCKS */}
          {employees.map((emp, rowIndex) =>
            emp.tasks.map((task, i) => {
              const start = toMinutes(task.start) - startMinutes;
              const end = toMinutes(task.end) - startMinutes;

              const left = (start / totalMinutes) * 100;
              const width = (end - start) / totalMinutes * 100;

              return (
                <div
                  key={i}
                  style={{
                    ...styles.taskBlock,
                    background: task.color,
                    top: rowIndex * 70 + 20,       // center vertically
                    left: `${left}%`,
                    width: `${width}%`,
                  }}
                >
                  <div style={styles.taskTitle}>{task.title}</div>
                  <div style={styles.taskTime}>{task.start} - {task.end}</div>
                </div>
              );
            })
          )}

        </div>
      </div>

    </div>
  );
}


/* ----------------------------------------------------------
   STYLES – Matches the PDF EXACTLY
---------------------------------------------------------- */

const styles = {
  wrapper: {
    background: "#fff",
    borderRadius: 12,
    border: "1px solid #ddd",
    padding: 20,
    width: "100%"
  },

  /* HOURS ROW (TOP) */
  hoursRow: { display: "flex", marginBottom: 10 },
  leftSpacer: { width: 160 },
  hoursGrid: {
    flex: 1,
    display: "grid",
    gridTemplateColumns: "repeat(9, 1fr)"
  },
  hourCell: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: 500,
    paddingBottom: 4,
    color: "#444"
  },

  /* MAIN */
  mainSection: { display: "flex", position: "relative" },

  /* EMPLOYEES LIST */
  employeeColumn: { width: 160 },
  employeeRow: {
    height: 70,
    borderBottom: "1px solid #e6e6e6",
    display: "flex",
    alignItems: "center"
  },
  employeeName: {
    fontSize: 14,
    fontWeight: 600
  },

  /* CHART AREA */
  chartArea: {
    flex: 1,
    position: "relative",
  },

  /* GRID LINES */
  verticalLines: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: "100%",
    display: "grid",
    gridTemplateColumns: "repeat(9, 1fr)",
    zIndex: 0,
  },
  vLine: {
    borderRight: "1px solid #d0d0d0" // darker as requested
  },

  /* TASK BLOCKS */
  taskBlock: {
    position: "absolute",
    height: 50,
    borderRadius: 12,
    padding: "6px 12px",
    fontSize: 13,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    zIndex: 3
  },
  taskTitle: {
    fontWeight: 600,
    marginBottom: 2
  },
  taskTime: {
    fontSize: 12,
    color: "#555"
  }
};
