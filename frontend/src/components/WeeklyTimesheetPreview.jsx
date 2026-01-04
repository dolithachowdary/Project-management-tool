import React, { useRef } from "react";
import { format } from "date-fns";
import { Download, FileSpreadsheet, Printer, Save } from "lucide-react";

export default function TimesheetPreview({ data, onSave, isHistory = false }) {
    const printRef = useRef();
    const [editableData, setEditableData] = React.useState(null);

    React.useEffect(() => {
        if (data) setEditableData(data.daily_data);
    }, [data]);

    if (!data || !editableData) return null;

    const { employee, project, start_date, end_date, total_hours, supervisor_name } = data;

    const handleCellChange = (idx, field, val) => {
        const newData = [...editableData];
        newData[idx][field] = val;

        // Recalculate total for the row if needed
        if (['regular_hrs', 'overtime_hrs', 'sick_hrs', 'vacation_hrs', 'holiday_hrs', 'other_hrs'].includes(field)) {
            const row = newData[idx];
            const sum = (parseFloat(row.regular_hrs) || 0) +
                (parseFloat(row.overtime_hrs) || 0) +
                (parseFloat(row.sick_hrs) || 0) +
                (parseFloat(row.vacation_hrs) || 0) +
                (parseFloat(row.holiday_hrs) || 0) +
                (parseFloat(row.other_hrs) || 0);
            row.total_hrs = sum.toFixed(2);
        }

        setEditableData(newData);
    };

    const calculateGrandTotal = () => {
        return editableData.reduce((acc, d) => acc + parseFloat(d.total_hrs || 0), 0).toFixed(2);
    };

    const handleSaveLocal = (status) => {
        if (onSave) {
            onSave({
                ...data,
                daily_data: editableData,
                total_hours: calculateGrandTotal(),
                status
            });
        }
    };

    const handleExportExcel = () => {
        const headers = ["DATE", "TASK ID", "START TIME", "END TIME", "REGULAR HRS", "OVER TIME", "SICK", "VACATION", "HOLIDAY", "OTHER", "TOTAL HOURS"];
        const rows = editableData.map(r => [
            r.day, r.task_id, r.start_time, r.end_time, r.regular_hrs, r.overtime_hrs, r.sick_hrs, r.vacation_hrs, r.holiday_hrs, r.other_hrs, r.total_hrs
        ]);

        let csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `timesheet_${employee?.name}_${start_date}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrint = () => {
        const content = printRef.current;
        const pri = window.open("", "PRINT", "height=800,width=1000");
        pri.document.write("<html><head><title>Timesheet</title>");
        pri.document.write("<style>body { font-family: sans-serif; padding: 20px; }</style>");
        pri.document.write("</head><body>");
        pri.document.write(content.innerHTML);
        pri.document.write("</body></html>");
        pri.document.close();
        pri.focus();
        pri.print();
        pri.close();
    };

    return (
        <div style={styles.container}>
            <div style={styles.actions}>
                {!isHistory && (
                    <button style={styles.saveBtn} onClick={() => handleSaveLocal('final')}>
                        <Save size={18} /> Save Final
                    </button>
                )}
                <button style={styles.actionBtn} onClick={handlePrint}>
                    <Printer size={18} /> Print PDF
                </button>
                <button style={styles.actionBtn} onClick={handleExportExcel}>
                    <FileSpreadsheet size={18} /> Export Excel
                </button>
            </div>

            <div ref={printRef} style={styles.sheet}>
                {/* HEADER */}
                <div style={styles.logoRow}>
                    <div style={styles.logoWrap}>
                        <span style={styles.logoIcon}>🔴</span>
                        <span style={styles.logoText}>Redsage</span>
                    </div>
                </div>

                <div style={styles.titleBanner}>
                    <div style={styles.titleText}>Timesheet</div>
                    <div style={styles.weekDates}>
                        <div style={styles.dateBlock}>
                            <span style={styles.dateLabel}>FROM:</span>
                            <span style={styles.dateVal}>{start_date ? format(new Date(start_date), "dd MMM") : "-"}</span>
                        </div>
                        <div style={styles.dateBlock}>
                            <span style={styles.dateLabel}>TO:</span>
                            <span style={styles.dateVal}>{end_date ? format(new Date(end_date), "dd MMM") : "-"}</span>
                        </div>
                    </div>
                </div>

                {/* INFO GRID */}
                <div style={styles.infoGrid}>
                    <div style={styles.infoRow}>
                        <div style={styles.infoLabel}>EMPLOYEE:</div>
                        <div style={styles.infoVal}>{employee?.name || "-"}</div>
                        <div style={styles.infoLabel}>PROJECT:</div>
                        <div style={styles.infoVal}>{project?.name || "-"}</div>
                    </div>
                    <div style={styles.infoRow}>
                        <div style={styles.infoLabel}>SUPERVISOR:</div>
                        <div style={styles.infoVal}>{supervisor_name || data.supervisor?.name || "-"}</div>
                        <div style={styles.infoLabel}>APPROVED HOURS THIS WEEK:</div>
                        <div style={{ ...styles.infoVal, background: "#d1fae5" }}>{data.approved_hours || "0.00"}</div>
                    </div>
                </div>

                {/* TABLE */}
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.theadRow}>
                            <th>DATE</th>
                            <th>TASK ID</th>
                            <th>START TIME</th>
                            <th>END TIME</th>
                            <th>REGULAR HRS</th>
                            <th>OVER TIME (+HRS)</th>
                            <th>SICK (-HRS)</th>
                            <th>VACATION (-HRS)</th>
                            <th>HOLIDAY (-HRS)</th>
                            <th>OTHER (-HRS)</th>
                            <th>TOTAL HOURS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {editableData.map((row, idx) => (
                            <tr key={idx} style={styles.tbodyRow}>
                                <td>{row.day}</td>
                                <td><input style={styles.tableInput} value={row.task_id} onChange={(e) => handleCellChange(idx, 'task_id', e.target.value)} /></td>
                                <td><input style={styles.tableInput} value={row.start_time} onChange={(e) => handleCellChange(idx, 'start_time', e.target.value)} /></td>
                                <td><input style={styles.tableInput} value={row.end_time} onChange={(e) => handleCellChange(idx, 'end_time', e.target.value)} /></td>
                                <td><input style={styles.tableInput} value={row.regular_hrs} onChange={(e) => handleCellChange(idx, 'regular_hrs', e.target.value)} /></td>
                                <td><input style={styles.tableInput} value={row.overtime_hrs} onChange={(e) => handleCellChange(idx, 'overtime_hrs', e.target.value)} /></td>
                                <td><input style={styles.tableInput} value={row.sick_hrs} onChange={(e) => handleCellChange(idx, 'sick_hrs', e.target.value)} /></td>
                                <td><input style={styles.tableInput} value={row.vacation_hrs} onChange={(e) => handleCellChange(idx, 'vacation_hrs', e.target.value)} /></td>
                                <td><input style={styles.tableInput} value={row.holiday_hrs} onChange={(e) => handleCellChange(idx, 'holiday_hrs', e.target.value)} /></td>
                                <td><input style={styles.tableInput} value={row.other_hrs} onChange={(e) => handleCellChange(idx, 'other_hrs', e.target.value)} /></td>
                                <td style={{ fontWeight: 700, color: "#166534", background: "#f0fdf4" }}>{row.total_hrs}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr style={styles.tfootRow}>
                            <td colSpan={10} style={{ textAlign: "right", paddingRight: 20 }}>TOTAL HOURS</td>
                            <td style={{ background: "#86efac", fontWeight: 800 }}>{calculateGrandTotal()}</td>
                        </tr>
                    </tfoot>
                </table>

                {/* SIGNATURES */}
                <div style={styles.signatureGrid}>
                    <div style={styles.sigBlock}>
                        <div style={styles.sigLine}>
                            <span style={styles.sigLabel}>EMPLOYEE SIGNATURE:</span>
                            <div style={styles.sigUnderline} />
                        </div>
                        <div style={styles.sigLine}>
                            <span style={styles.sigLabel}>SUPERVISOR SIGNATURE:</span>
                            <div style={styles.sigUnderline} />
                        </div>
                    </div>
                    <div style={styles.dateBlockSig}>
                        <div style={styles.sigDate}>
                            <span style={styles.sigLabelSmall}>DATE</span>
                            <div style={styles.sigUnderlineSmall} />
                        </div>
                        <div style={styles.sigDate}>
                            <span style={styles.sigLabelSmall}>DATE</span>
                            <div style={styles.sigUnderlineSmall} />
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div style={styles.footer}>
                    Corporate Office: 8th Floor, Tower 1, Vasavi Sky City, Gachibowli Circle, Telecom Nagar, Gachibowli, Hyderabad, Telangana, 500081
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: "flex",
        flexDirection: "column",
        gap: 16,
    },
    actions: {
        display: "flex",
        gap: 12,
        justifyContent: "flex-end",
    },
    actionBtn: {
        padding: "8px 16px",
        borderRadius: 8,
        border: "1px solid #e2e8f0",
        background: "#fff",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 14,
        fontWeight: 600,
        color: "#64748b",
    },
    tableInput: {
        width: "100%",
        border: "none",
        background: "transparent",
        padding: "8px",
        fontSize: "14px",
        outline: "none",
        textAlign: "center",
        fontWeight: "600",
    },
    saveBtn: {
        padding: "8px 16px",
        borderRadius: 8,
        border: "none",
        background: "#4F7DFF",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 14,
        fontWeight: 600,
        color: "#fff",
    },
    sheet: {
        background: "#fff",
        padding: "40px",
        border: "1px solid #e2e8f0",
        borderRadius: 4,
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
        minWidth: "1000px",
    },
    logoRow: {
        marginBottom: 20,
    },
    logoWrap: {
        display: "flex",
        alignItems: "center",
        gap: 10,
    },
    logoIcon: {
        fontSize: 32,
    },
    logoText: {
        fontSize: 36,
        fontWeight: 800,
        color: "#000",
        letterSpacing: "-1px",
    },
    titleBanner: {
        background: "#0a3a7b",
        color: "#fff",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "stretch",
        border: "2px solid #000",
    },
    titleText: {
        padding: "12px 24px",
        fontSize: 24,
        fontWeight: 700,
        borderRight: "2px solid #000",
        display: "flex",
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
    },
    weekDates: {
        display: "flex",
        background: "#f1f5f9",
        color: "#000",
    },
    dateBlock: {
        padding: "8px 16px",
        borderLeft: "2px solid #000",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
    },
    dateLabel: {
        fontSize: 12,
        fontWeight: 700,
    },
    dateVal: {
        fontSize: 16,
        fontWeight: 800,
    },
    infoGrid: {
        marginTop: -2,
        border: "2px solid #000",
        borderTop: "none",
    },
    infoRow: {
        display: "grid",
        gridTemplateColumns: "150px 1fr 200px 150px",
        borderBottom: "2px solid #000",
    },
    infoLabel: {
        background: "#f1f5f9",
        padding: "8px 12px",
        fontSize: 13,
        fontWeight: 700,
        borderRight: "2px solid #000",
    },
    infoVal: {
        padding: "8px 12px",
        fontSize: 14,
        fontWeight: 600,
        borderRight: "2px solid #000",
        background: "#fff",
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
        marginTop: 20,
        border: "2px solid #000",
    },
    theadRow: {
        background: "#d8e2ef",
    },
    tbodyRow: {
        borderBottom: "1px solid #ccc",
    },
    tfootRow: {
        background: "#f1f5f9",
    },
    signatureGrid: {
        marginTop: 30,
        display: "flex",
        gap: 20,
    },
    sigBlock: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 12,
    },
    sigLine: {
        display: "flex",
        alignItems: "flex-end",
        gap: 12,
    },
    sigLabel: {
        fontSize: 13,
        fontWeight: 700,
        width: 200,
    },
    sigUnderline: {
        flex: 1,
        borderBottom: "2px solid #000",
        height: 24,
    },
    dateBlockSig: {
        width: 250,
        display: "flex",
        flexDirection: "column",
        gap: 12,
    },
    sigDate: {
        display: "flex",
        alignItems: "flex-end",
        gap: 10,
    },
    sigLabelSmall: {
        background: "#d8e2ef",
        padding: "4px 10px",
        fontSize: 12,
        fontWeight: 700,
        border: "2px solid #000",
        width: 60,
        textAlign: "center",
    },
    sigUnderlineSmall: {
        flex: 1,
        border: "2px solid #000",
        height: 30,
        background: "#fff",
    },
    footer: {
        marginTop: 40,
        textAlign: "center",
        fontSize: 12,
        color: "#64748b",
        padding: "10px",
        borderTop: "1px solid #e2e8f0",
    }
};
