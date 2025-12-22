import React, { useState, useEffect } from "react";

export default function WeeklyTimesheet({ data }) {
  const days = [
    { label: "Sat", date: "0 Jan" },
    { label: "Sun", date: "1 Jan" },
    { label: "Mon", date: "2 Jan" },
    { label: "Tue", date: "3 Jan" },
    { label: "Wed", date: "4 Jan" },
    { label: "Thu", date: "5 Jan" },
    { label: "Fri", date: "6 Jan" },
  ];

  const emptyRow = day => ({
    ...day,
    taskId: "",
    start: "",
    end: "",
    regular: 0,
    ot: 0,
    sick: 0,
    vacation: 0,
    holiday: 0,
    other: 0,
    total: 0,
  });

  const [rows, setRows] = useState(days.map(emptyRow));

  useEffect(() => {
    if (data?.entries) setRows(data.entries);
  }, [data]);

  const calcHours = (start, end) => {
    if (!start || !end) return 0;
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    return Math.max(eh + em / 60 - (sh + sm / 60), 0).toFixed(2);
  };

  const update = (i, field, value) => {
    const updated = [...rows];
    updated[i][field] = value;

    updated[i].regular = Number(
      calcHours(updated[i].start, updated[i].end)
    );

    updated[i].total =
      updated[i].regular +
      updated[i].ot +
      updated[i].sick +
      updated[i].vacation +
      updated[i].holiday +
      updated[i].other;

    setRows(updated);
  };

  const weeklyTotal = rows.reduce((s, r) => s + r.total, 0).toFixed(2);

  return (
    <div style={s.container}>
      {/* HEADER */}
      <div style={s.header}>
        <div style={s.headerTitle}>Weekly Timesheet</div>
        <div style={s.weekBox}>WEEK FROM:</div>
        <div style={s.weekBox}>WEEK TO:</div>
      </div>

      {/* INFO */}
      <div style={s.infoGrid}>
        <div style={s.label}>EMPLOYEE:</div>
        <input style={s.input} />

        <div style={s.label}>PROJECT</div>
        <input style={s.input} />

        <div style={s.label}>SUPERVISOR:</div>
        <input style={s.input} />

        <div style={s.label}>APPROVED HOURS THIS WEEK</div>
        <div style={s.approvedBox} />
      </div>

      {/* TABLE */}
      <table style={s.table}>
        <thead>
          <tr>
            {[
              "DATE",
              "TASK ID",
              "START",
              "END",
              "REG",
              "OT",
              "SICK",
              "VAC",
              "HOL",
              "OTHER",
              "TOTAL",
            ].map(h => (
              <th key={h} style={s.th}>{h}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td style={s.td}>{r.label}, {r.date}</td>
              <td style={s.td}>
                <input style={s.cellInput} onChange={e => update(i, "taskId", e.target.value)} />
              </td>
              <td style={s.td}>
                <input type="time" style={s.cellInput} onChange={e => update(i, "start", e.target.value)} />
              </td>
              <td style={s.td}>
                <input type="time" style={s.cellInput} onChange={e => update(i, "end", e.target.value)} />
              </td>
              <td style={s.td}>{r.regular.toFixed(2)}</td>
              {["ot", "sick", "vacation", "holiday", "other"].map(f => (
                <td key={f} style={s.td}>
                  <input
                    type="number"
                    style={s.cellInput}
                    onChange={e => update(i, f, Number(e.target.value))}
                  />
                </td>
              ))}
              <td style={s.totalCell}>{r.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>

        <tfoot>
          <tr>
            <td colSpan={10} style={s.totalLabel}>TOTAL HOURS</td>
            <td style={s.weeklyTotal}>{weeklyTotal}</td>
          </tr>
        </tfoot>
      </table>

      {/* SIGNATURE */}
      <div style={s.signGrid}>
        <div style={s.signBox}>EMPLOYEE SIGNATURE:</div>
        <div style={s.signBox}>DATE</div>
        <div style={s.signBox}>SUPERVISOR SIGNATURE:</div>
        <div style={s.signBox}>DATE</div>
      </div>
    </div>
  );
}

/* ---------------- INLINE STYLES ---------------- */

const s = {
  container: {
    background: "#fff",
    border: "2px solid #000",
    padding: 20,
    marginTop: 30,
  },
  header: {
    display: "grid",
    gridTemplateColumns: "1fr 150px 150px",
    marginBottom: 15,
  },
  headerTitle: {
    background: "#0b3c8d",
    color: "#fff",
    padding: 12,
    textAlign: "center",
    fontWeight: 600,
  },
  weekBox: {
    border: "1px solid #000",
    padding: 10,
    fontWeight: 600,
    color: "#2e7d32",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "150px 1fr 200px 1fr",
    gap: 6,
    marginBottom: 15,
  },
  label: {
    background: "#e3f2fd",
    padding: 6,
    fontWeight: 600,
  },
  input: {
    border: "1px solid #000",
    padding: 6,
  },
  approvedBox: {
    background: "#b9f6ca",
    border: "1px solid #000",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    border: "1px solid #000",
    background: "#e3f2fd",
    padding: 6,
    fontSize: 12,
  },
  td: {
    border: "1px solid #ccc",
    padding: 4,
    textAlign: "center",
  },
  cellInput: {
    width: "100%",
    border: "none",
    textAlign: "center",
  },
  totalCell: {
    background: "#e8f5e9",
    fontWeight: 600,
  },
  totalLabel: {
    background: "#e3f2fd",
    textAlign: "center",
    fontWeight: 600,
  },
  weeklyTotal: {
    background: "#7cd992",
    fontWeight: 700,
    textAlign: "center",
  },
  signGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 150px",
    gap: 10,
    marginTop: 20,
  },
  signBox: {
    border: "1px solid #000",
    padding: 10,
    fontWeight: 600,
  },
};
