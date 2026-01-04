import React, { useRef } from "react";
import { format } from "date-fns";
import { Download, FileSpreadsheet, Printer, Save } from "lucide-react";
import * as XLSX from "xlsx";

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

    const calculateTotals = () => {
        let reg = 0, ot = 0, sick = 0, vac = 0, other = 0, grand = 0;
        editableData.forEach(d => {
            reg += parseFloat(d.regular_hrs || 0);
            ot += parseFloat(d.overtime_hrs || 0);
            sick += parseFloat(d.sick_hrs || 0);
            vac += parseFloat(d.vacation_hrs || 0);
            other += parseFloat(d.other_hrs || 0) + parseFloat(d.holiday_hrs || 0);
            grand += parseFloat(d.total_hrs || 0);
        });
        return { reg, ot, sick, vac, other, grand };
    };

    const totals = calculateTotals();

    const handleSaveLocal = (status) => {
        if (onSave) {
            onSave({
                ...data,
                daily_data: editableData,
                total_hours: totals.grand.toFixed(2),
                status
            });
        }
    };

    const handleExportExcel = () => {
        // 1. Create Data Arrays for the Header Sections
        const metaInfo = [
            ["Redsage"],
            ["Timesheet Report"],
            [],
            ["Employee:", employee?.name || "-"],
            ["Project:", project?.name || "-"],
            ["FROM:", start_date ? format(new Date(start_date), "MM/dd/yyyy") : "-", "", "TO:", end_date ? format(new Date(end_date), "MM/dd/yyyy") : "-"],
            []
        ];

        const tableHeaders = [
            ["DATE", "TASK ID", "START", "FINISH", "REGULAR HRS", "OVERTIME", "SICK", "VACATION", "OTHER", "TOTAL HRS"]
        ];

        const tableRows = editableData.map(r => [
            r.day,
            r.task_id,
            r.start_time,
            r.end_time,
            r.regular_hrs,
            r.overtime_hrs,
            r.sick_hrs,
            r.vacation_hrs,
            (parseFloat(r.holiday_hrs) + parseFloat(r.other_hrs)).toFixed(2),
            r.total_hrs
        ]);

        const totalRow = [
            ["TOTAL HOURS", "", "", "", totals.reg.toFixed(2), totals.ot.toFixed(2), totals.sick.toFixed(2), totals.vac.toFixed(2), totals.other.toFixed(2), totals.grand.toFixed(2)]
        ];

        // 2. Combine all sections into a single Array of Arrays (AOA)
        const finalData = [...metaInfo, ...tableHeaders, ...tableRows, ...totalRow];

        // 3. Create Worksheet and Workbook
        const worksheet = XLSX.utils.aoa_to_sheet(finalData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Timesheet");

        // 4. Set Column Widths (Characters)
        worksheet["!cols"] = [
            { wch: 15 }, // Date
            { wch: 30 }, // Task ID
            { wch: 10 }, // Start
            { wch: 10 }, // Finish
            { wch: 12 }, // Reg
            { wch: 12 }, // OT
            { wch: 10 }, // Sick
            { wch: 10 }, // Vac
            { wch: 10 }, // Other
            { wch: 12 }  // Total
        ];

        // 5. Save File
        XLSX.writeFile(workbook, `timesheet_${employee?.name || 'report'}.xlsx`);
    };

    const handlePrint = () => {
        const content = printRef.current;
        const pri = window.open("", "PRINT", "height=800,width=1000");
        pri.document.write("<html><head><title>Timesheet</title>");
        pri.document.write("<style>body { font-family: sans-serif; padding: 20px; } table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid #000; padding: 8px; text-align: center; } th { background-color: #6A4C9C; color: #fff; }</style>");
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

            <div ref={printRef} style={styles.sheet} className="timesheet-paper">
                <div style={styles.logoRow}>
                    <img src="/light-redsage.png" alt="Redsage" style={styles.redsageLogo} />
                </div>

                <div style={styles.headerInfo}>
                    <div style={styles.templateTitle}>Timesheet Report</div>

                    <div style={styles.metaRowInfo}>
                        <div style={styles.metaCol}>
                            <span style={styles.metaLabel}>Employee:</span>
                            <span style={styles.metaVal}>{employee?.name || "-"}</span>
                        </div>
                        <div style={styles.metaCol}>
                            <span style={styles.metaLabel}>Project:</span>
                            <span style={styles.metaVal}>{project?.name || "-"}</span>
                        </div>
                    </div>

                    <div style={styles.metaRowInfo}>
                        <div style={styles.metaCol}>
                            <span style={styles.metaLabel}>FROM:</span>
                            <span style={styles.metaVal}>{start_date ? format(new Date(start_date), "MM/dd/yyyy") : "__________"}</span>
                        </div>
                        <div style={styles.metaCol}>
                            <span style={styles.metaLabel}>TO:</span>
                            <span style={styles.metaVal}>{end_date ? format(new Date(end_date), "MM/dd/yyyy") : "__________"}</span>
                        </div>
                    </div>
                </div>

                <table style={styles.table}>
                    <thead>
                        <tr style={styles.theadRow}>
                            <th style={{ ...styles.th, width: "100px" }}>Date</th>
                            <th style={{ ...styles.th, width: "220px" }}>Task ID</th>
                            <th style={styles.th}>Start</th>
                            <th style={styles.th}>Finish</th>
                            <th style={styles.th}>Regular hours</th>
                            <th style={styles.th}>Overtime</th>
                            <th style={styles.th}>Sick</th>
                            <th style={styles.th}>Vacation</th>
                            <th style={styles.th}>Other</th>
                            <th style={styles.th}>Total hours</th>
                        </tr>
                    </thead>
                    <tbody>
                        {editableData.map((row, idx) => (
                            <tr key={idx} style={styles.tbodyRow}>
                                <td style={styles.td}>{row.day}</td>
                                <td style={styles.td}><input style={styles.tableInput} value={row.task_id} onChange={(e) => handleCellChange(idx, 'task_id', e.target.value)} /></td>
                                <td style={styles.td}><input style={styles.tableInput} value={row.start_time} onChange={(e) => handleCellChange(idx, 'start_time', e.target.value)} /></td>
                                <td style={styles.td}><input style={styles.tableInput} value={row.end_time} onChange={(e) => handleCellChange(idx, 'end_time', e.target.value)} /></td>
                                <td style={styles.td}><input style={styles.tableInput} value={row.regular_hrs} onChange={(e) => handleCellChange(idx, 'regular_hrs', e.target.value)} /></td>
                                <td style={styles.td}><input style={styles.tableInput} value={row.overtime_hrs} onChange={(e) => handleCellChange(idx, 'overtime_hrs', e.target.value)} /></td>
                                <td style={styles.td}><input style={styles.tableInput} value={row.sick_hrs} onChange={(e) => handleCellChange(idx, 'sick_hrs', e.target.value)} /></td>
                                <td style={styles.td}><input style={styles.tableInput} value={row.vacation_hrs} onChange={(e) => handleCellChange(idx, 'vacation_hrs', e.target.value)} /></td>
                                <td style={styles.td}><input style={styles.tableInput} value={(parseFloat(row.holiday_hrs) + parseFloat(row.other_hrs)).toFixed(2)} onChange={(e) => handleCellChange(idx, 'other_hrs', e.target.value)} /></td>
                                <td style={{ ...styles.td, fontWeight: 700, background: "#f8fafc" }}>{row.total_hrs}</td>
                            </tr>
                        ))}
                        <tr style={styles.totalRow}>
                            <td style={styles.totalLabel} colSpan={4}>TOTAL HOURS</td>
                            <td style={styles.totalVal}>{totals.reg.toFixed(2)}</td>
                            <td style={styles.totalVal}>{totals.ot.toFixed(2)}</td>
                            <td style={styles.totalVal}>{totals.sick.toFixed(2)}</td>
                            <td style={styles.totalVal}>{totals.vac.toFixed(2)}</td>
                            <td style={styles.totalVal}>{totals.other.toFixed(2)}</td>
                            <td style={{ ...styles.totalVal, background: "#6A4C9C", color: "#fff", fontWeight: 800 }}>{totals.grand.toFixed(2)}</td>
                        </tr>
                    </tbody>
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
        paddingBottom: 40,
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
    saveBtn: {
        padding: "8px 16px",
        borderRadius: 8,
        border: "none",
        background: "#6A4C9C",
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
        borderRadius: 8,
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
        minWidth: "1100px",
        fontFamily: "'Inter', sans-serif",
    },
    logoRow: {
        marginBottom: 30,
    },
    redsageLogo: {
        width: "180px",
    },
    headerInfo: {
        marginBottom: 30,
    },
    templateTitle: {
        fontSize: 24,
        fontWeight: 700,
        color: "#1e293b",
        marginBottom: 20,
    },
    metaRowInfo: {
        display: "flex",
        gap: 60,
        marginBottom: 12,
        fontSize: 15,
    },
    metaCol: {
        display: "flex",
        gap: 10,
        alignItems: "baseline",
    },
    metaLabel: {
        fontWeight: 700,
        color: "#475569",
        minWidth: "80px",
    },
    metaVal: {
        color: "#1e293b",
        borderBottom: "1px solid #cbd5e1",
        minWidth: "150px",
        paddingBottom: "2px",
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
        border: "2px solid #6A4C9C",
    },
    theadRow: {
        background: "#6A4C9C",
    },
    th: {
        color: "#fff",
        padding: "12px 8px",
        fontSize: 13,
        fontWeight: 600,
        border: "1px solid rgba(255,255,255,0.1)",
    },
    td: {
        padding: "0",
        border: "1px solid #cbd5e1",
        textAlign: "center",
        fontSize: 14,
    },
    tableInput: {
        width: "100%",
        border: "none",
        background: "transparent",
        padding: "10px 4px",
        fontSize: "13px",
        outline: "none",
        textAlign: "center",
        color: "#1e293b",
    },
    totalRow: {
        background: "#f1f5f9",
    },
    totalLabel: {
        padding: "12px",
        textAlign: "right",
        fontWeight: 700,
        fontSize: 13,
        color: "#1e293b",
        border: "1px solid #cbd5e1",
    },
    totalVal: {
        padding: "12px 4px",
        fontWeight: 700,
        fontSize: 14,
        border: "1px solid #cbd5e1",
        textAlign: "center",
    },
    signatureGrid: {
        marginTop: 50,
        display: "flex",
        gap: 60,
    },
    sigBlock: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 25,
    },
    sigLine: {
        display: "flex",
        alignItems: "flex-end",
        gap: 15,
    },
    sigLabel: {
        fontSize: 12,
        fontWeight: 700,
        width: 180,
        color: "#475569",
    },
    sigUnderline: {
        flex: 1,
        borderBottom: "1px solid #000",
        height: 24,
    },
    dateBlockSig: {
        width: 250,
        display: "flex",
        flexDirection: "column",
        gap: 25,
    },
    sigDate: {
        display: "flex",
        alignItems: "flex-end",
        gap: 12,
    },
    sigLabelSmall: {
        fontSize: 11,
        fontWeight: 700,
        color: "#64748b",
    },
    sigUnderlineSmall: {
        flex: 1,
        borderBottom: "1px solid #000",
        height: 24,
    },
    footer: {
        marginTop: 60,
        textAlign: "center",
        fontSize: 11,
        color: "#94a3b8",
        paddingTop: 20,
        borderTop: "1px solid #f1f5f9",
    }
};
