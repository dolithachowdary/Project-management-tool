import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "S", tasks: 14 },
  { name: "M", tasks: 10 },
  { name: "T", tasks: 17 },
  { name: "W", tasks: 20 },
  { name: "T", tasks: 15 },
  { name: "F", tasks: 19 },
  { name: "S", tasks: 14 },
];

const TaskGraph = () => {
  return (
    <div style={styles.card}>
      <h3 style={styles.title}>Task Activity</h3>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
              <stop offset="10%" stopColor="#d33922ff" stopOpacity={0.8} />
              <stop offset="90%" stopColor="#dc6558ff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
          <XAxis dataKey="name" tick={{ fill: "#555" }} />
          <YAxis tick={{ fill: "#555" }} />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="tasks"
            stroke="#cb421bff"
            fillOpacity={1}
            fill="url(#colorTasks)"
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Stats Section */}
      <div style={styles.stats}>
        <div style={styles.statItem}>
              <stop offset="10%" stopColor="#d33922ff" stopOpacity={0.8} />
          <div style={{ ...styles.icon, backgroundColor: "#d33922ff" }}>🕓</div>
          <div>
            <p style={styles.statLabel}>Total Tasks</p>
            <p style={styles.statValue}>56</p>
          </div>
        </div>
        <div style={styles.statItem}>
          <div style={{ ...styles.icon, backgroundColor: "#BBDEFB" }}>📦</div>
          <div>
            <p style={styles.statLabel}>Product</p>
            <p style={styles.statValue}>26</p>
          </div>
        </div>
        <div style={styles.statItem}>
          <div style={{ ...styles.icon, backgroundColor: "#FFF9C4" }}>📋</div>
          <div>
            <p style={styles.statLabel}>Project</p>
            <p style={styles.statValue}>30</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: "#fff",
    borderRadius: "15px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  title: {
    marginBottom: "15px",
    color: "#222",
    fontSize: "1.1rem",
    fontWeight: "600",
  },
  stats: {
    display: "flex",
    justifyContent: "space-around",
    marginTop: "15px",
  },
  statItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  statLabel: {
    fontSize: "0.85rem",
    color: "#555",
  },
  statValue: {
    fontSize: "1.2rem",
    fontWeight: "600",
    color: "#222",
  },
  icon: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

export default TaskGraph;
