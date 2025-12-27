import React, { useState } from "react";
import { ChevronDown, CheckCircle2, Box } from "lucide-react";

/* ================= MOCK DATA ================= */

const modules = [
  {
    id: 1,
    name: "Frontend Development",
    phase: "UI Phase",
    progress: 65,
    tasks: [
      {
        id: 1,
        title: "Implement responsive navigation",
        status: "completed",
        owner: "DC"
      },
      {
        id: 2,
        title: "Create user dashboard layout",
        status: "completed",
        owner: "HA"
      },
      {
        id: 3,
        title: "Design form components",
        status: "completed",
        owner: "DC"
      },
      {
        id: 4,
        title: "Build data visualization widgets",
        status: "in_progress",
        owner: "HA"
      }
    ]
  },
  {
    id: 2,
    name: "Backend Development",
    phase: "API Phase",
    progress: 55,
    tasks: [
      {
        id: 5,
        title: "Set up authentication APIs",
        status: "in_progress",
        owner: "HA"
      },
      {
        id: 6,
        title: "Database schema design",
        status: "todo",
        owner: "DC"
      }
    ]
  },
  {
    id: 3,
    name: "Authentication System",
    phase: "Security Phase",
    progress: 80,
    tasks: [
      {
        id: 7,
        title: "JWT token handling",
        status: "completed",
        owner: "DC"
      },
      {
        id: 8,
        title: "Role-based access control",
        status: "completed",
        owner: "HA"
      }
    ]
  }
];

/* ================= COMPONENT ================= */

export default function Modules() {
  const [openModuleId, setOpenModuleId] = useState(null);

  const toggle = id => {
    setOpenModuleId(prev => (prev === id ? null : id));
  };

  return (
    <div>
      <h3 style={styles.heading}>Modules & Tasks</h3>

      {modules.map(module => {
        const counts = getCounts(module.tasks);

        return (
          <div key={module.id} style={styles.card}>
            {/* HEADER */}
            <div style={styles.header} onClick={() => toggle(module.id)}>
              <div style={styles.left}>
                <div style={styles.icon}><Box size={16} /></div>
                <div>
                  <div style={styles.title}>{module.name}</div>
                  <div style={styles.phase}>{module.phase}</div>
                </div>
              </div>

              <div style={styles.right}>
                <div style={styles.progressWrap}>
                  <div style={styles.progressTrack}>
                    <div
                      style={{
                        ...styles.progressFill,
                        width: `${module.progress}%`
                      }}
                    />
                  </div>
                  <span style={styles.percent}>{module.progress}%</span>
                </div>

                <ChevronDown
                  size={18}
                  style={{
                    transform:
                      openModuleId === module.id
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                    transition: "0.2s"
                  }}
                />
              </div>
            </div>

            {/* EXPANDED */}
            {openModuleId === module.id && (
              <>
                {/* STATUS COUNTS */}
                <div style={styles.countRow}>
                  <span style={styles.todo}>{counts.todo} To Do</span>
                  <span style={styles.inProgress}>
                    {counts.in_progress} In Progress
                  </span>
                  <span style={styles.completed}>
                    {counts.completed} Completed
                  </span>
                </div>

                {/* TASK LIST */}
                <div style={styles.taskList}>
                  {module.tasks.map(task => (
                    <div key={task.id} style={styles.taskRow}>
                      <div style={styles.taskLeft}>
                        {task.status === "completed" && (
                          <CheckCircle2 size={16} color="#16a34a" />
                        )}
                        <span>{task.title}</span>
                      </div>

                      <div style={styles.taskRight}>
                        <span
                          style={{
                            ...styles.status,
                            ...statusStyles[task.status]
                          }}
                        >
                          {format(task.status)}
                        </span>

                        <div style={styles.avatar}>{task.owner}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ================= HELPERS ================= */

const format = s => s.replace("_", " ").toUpperCase();

const getCounts = tasks =>
  tasks.reduce(
    (a, t) => {
      a[t.status]++;
      return a;
    },
    { todo: 0, in_progress: 0, completed: 0 }
  );

/* ================= STYLES ================= */

const styles = {
  heading: { marginBottom: 12 },

  card: {
    background: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    cursor: "pointer"
  },

  left: { display: "flex", gap: 12 },

  icon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: "#e8f0ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },

  title: { fontWeight: 600 },
  phase: { fontSize: 13, color: "#777" },

  right: {
    display: "flex",
    alignItems: "center",
    gap: 12
  },

  progressWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8
  },

  progressTrack: {
    width: 100,
    height: 6,
    borderRadius: 6,
    background: "#e5e7eb"
  },

  progressFill: {
    height: "100%",
    background: "#2563eb",
    borderRadius: 6
  },

  percent: { fontSize: 13 },

  countRow: {
    display: "flex",
    gap: 10,
    marginTop: 14
  },

  todo: {
    background: "#fef3c7",
    color: "#92400e",
    padding: "4px 10px",
    borderRadius: 12,
    fontSize: 12
  },

  inProgress: {
    background: "#dbeafe",
    color: "#1e40af",
    padding: "4px 10px",
    borderRadius: 12,
    fontSize: 12
  },

  completed: {
    background: "#dcfce7",
    color: "#166534",
    padding: "4px 10px",
    borderRadius: 12,
    fontSize: 12
  },

  taskList: {
    marginTop: 12,
    borderTop: "1px solid #eee"
  },

  taskRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 0",
    fontSize: 14
  },

  taskLeft: {
    display: "flex",
    alignItems: "center",
    gap: 8
  },

  taskRight: {
    display: "flex",
    alignItems: "center",
    gap: 10
  },

  status: {
    fontSize: 11,
    padding: "4px 8px",
    borderRadius: 10
  },

  avatar: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: "#e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 600
  }
};

const statusStyles = {
  completed: { background: "#dcfce7", color: "#166534" },
  in_progress: { background: "#dbeafe", color: "#1e40af" },
  todo: { background: "#fef3c7", color: "#92400e" }
};
