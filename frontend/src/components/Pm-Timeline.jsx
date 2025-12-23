import React from "react";

export default function TimesheetTimeline() {
  const hours = [
    "10 AM","11 AM","12 PM","1 PM","2 PM","3 PM","4 PM","5 PM","6 PM"
  ];

  const members = [
    {
      name: "Hank Williams",
      meta: "3 tasks · 35 hours",
      tasks: [
        { title: "Contact customers with failed payments", start: "10:00", end: "12:00", color: "#F7E3B1" },
        { title: "Dashboard: concept", start: "13:00", end: "17:00", color: "#CDEED8" }
      ]
    },
    {
      name: "Hanna Rodrigues",
      meta: "3 tasks · 35 hours",
      tasks: [
        { title: "Task detail modal", start: "12:00", end: "15:00", color: "#F3C6C6" }
      ]
    },
    {
      name: "Mitchel Fleen",
      meta: "3 tasks · 35 hours",
      tasks: [
        { title: "Reporting: Visual dashboard", start: "10:00", end: "18:00", color: "#D9E5F7" }
      ]
    },
    {
      name: "Joanna Salem",
      meta: "2 tasks · 32 hours",
      tasks: [
        { title: "Task detail modal", start: "12:00", end: "16:00", color: "#F3C6C6" }
      ]
    },
    {
      name: "Mandy Harley",
      meta: "3 tasks · 35 hours",
      tasks: [
        { title: "Contact customers", start: "10:00", end: "14:00", color: "#F7E3B1" },
        { title: "Dashboard: concept", start: "14:00", end: "18:00", color: "#CDEED8" }
      ]
    }
  ];

  const toMinutes = (time) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  const startDay = toMinutes("10:00");
  const endDay = toMinutes("18:00");
  const totalMinutes = endDay - startDay;

  return (
    <div style={styles.container}>

      {/* HOURS HEADER */}
      <div style={styles.header}>
        <div style={styles.memberHeader}>Members</div>
        <div style={styles.hours}>
          {hours.map(h => (
            <div key={h} style={styles.hour}>{h}</div>
          ))}
        </div>
      </div>

      {/* BODY */}
      <div style={styles.body}>

        {/* MEMBERS COLUMN */}
        <div style={styles.membersCol}>
          {members.map((m, i) => (
            <div key={i} style={styles.memberRow}>
              <div style={styles.memberName}>{m.name}</div>
              <div style={styles.memberMeta}>{m.meta}</div>
            </div>
          ))}
        </div>

        {/* TIMELINE */}
        <div style={styles.timeline}>

          {/* GRID */}
          <div style={styles.grid}>
            {hours.map((_, i) => (
              <div key={i} style={styles.gridLine} />
            ))}
          </div>

          {/* ROWS */}
          {members.map((member, rowIndex) => (
            <div key={rowIndex} style={styles.timelineRow}>
              {member.tasks.map((task, i) => {
                const start = toMinutes(task.start) - startDay;
                const end = toMinutes(task.end) - startDay;

                return (
                  <div
                    key={i}
                    style={{
                      ...styles.task,
                      background: task.color,
                      left: `${(start / totalMinutes) * 100}%`,
                      width: `${((end - start) / totalMinutes) * 100}%`
                    }}
                  >
                    {task.title}
                  </div>
                );
              })}
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  container: {
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: 12,
    padding: 16
  },

  header: {
    display: "flex",
    marginBottom: 10
  },

  memberHeader: {
    width: 220,
    fontWeight: 600,
    fontSize: 14
  },

  hours: {
    flex: 1,
    display: "grid",
    gridTemplateColumns: "repeat(9, 1fr)"
  },

  hour: {
    textAlign: "center",
    fontSize: 13,
    color: "#555"
  },

  body: {
    display: "flex"
  },

  membersCol: {
    width: 220
  },

  memberRow: {
    height: 72,
    borderBottom: "1px solid #eee",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center"
  },

  memberName: {
    fontWeight: 600,
    fontSize: 14
  },

  memberMeta: {
    fontSize: 12,
    color: "#777"
  },

  timeline: {
    flex: 1,
    position: "relative"
  },

  grid: {
    position: "absolute",
    inset: 0,
    display: "grid",
    gridTemplateColumns: "repeat(9, 1fr)"
  },

  gridLine: {
    borderRight: "1px solid #e0e0e0"
  },

  timelineRow: {
    position: "relative",
    height: 72,
    borderBottom: "1px solid #eee"
  },

  task: {
    position: "absolute",
    top: 14,
    height: 44,
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 13,
    fontWeight: 500,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
  }
};
