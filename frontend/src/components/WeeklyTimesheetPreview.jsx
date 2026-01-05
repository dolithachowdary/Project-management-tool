import React, { useRef } from "react";
import { format } from "date-fns";
import { FileSpreadsheet, Printer, Save, Trash2, Plus } from "lucide-react";
import ExcelJS from "exceljs";

export default function TimesheetPreview({ data, onSave, isHistory = false }) {
    const printRef = useRef();
    const [editableData, setEditableData] = React.useState(null);

    React.useEffect(() => {
        if (data) setEditableData(data.daily_data);
    }, [data]);

    if (!data || !editableData) return null;

    const { employee, project, start_date, end_date } = data;

    const handleCellChange = (idx, field, val) => {
        const newData = [...editableData];
        const row = { ...newData[idx] };
        row[field] = val;

        const calculateDuration = (start, end) => {
            if (!start || !end || !start.includes(':') || !end.includes(':')) return null;
            const [sH, sM] = start.split(':').map(Number);
            const [eH, eM] = end.split(':').map(Number);
            if (isNaN(sH) || isNaN(sM) || isNaN(eH) || isNaN(eM)) return null;
            let diff = (eH * 60 + eM) - (sH * 60 + sM);
            if (diff < 0) diff += 1440; // Handle overnight
            return (diff / 60).toFixed(2);
        };

        // If time changes, update regular hours automatically
        if (field === 'start_time' || field === 'end_time') {
            const duration = calculateDuration(row.start_time, row.end_time);
            if (duration !== null) {
                row.regular_hrs = duration;
            }
        }

        // Recalculate row total
        const sum = (parseFloat(row.regular_hrs) || 0) +
            (parseFloat(row.overtime_hrs) || 0) +
            (parseFloat(row.sick_hrs) || 0) +
            (parseFloat(row.vacation_hrs) || 0) +
            (parseFloat(row.holiday_hrs) || 0) +
            (parseFloat(row.other_hrs) || 0);
        row.total_hrs = sum.toFixed(2);

        newData[idx] = row;
        setEditableData(newData);
    };

    const handleAddRow = () => {
        const newRow = {
            date: format(new Date(), "yyyy-MM-dd"),
            day: format(new Date(), "EEE, MMM d"),
            task_id: "N/A",
            start_time: "10:00",
            end_time: "18:00",
            regular_hrs: "8.00",
            overtime_hrs: "0.00",
            sick_hrs: "0.00",
            vacation_hrs: "0.00",
            holiday_hrs: "0.00",
            other_hrs: "0.00",
            total_hrs: "8.00"
        };
        setEditableData([...editableData, newRow]);
    };

    const handleDeleteRow = (idx) => {
        const newData = editableData.filter((_, i) => i !== idx);
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

    const handleExportExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Timesheet");

        // 1. HEADER SECTION
        worksheet.addRow(["Redsage"]).font = { size: 18, bold: true };
        worksheet.addRow(["Timesheet Report"]).font = { size: 14, bold: true };
        worksheet.addRow([]);

        const employeeRow = worksheet.addRow(["Employee:", employee?.name || "-"]);
        employeeRow.getCell(1).font = { bold: true };

        const projectRow = worksheet.addRow(["Project:", project?.name || "-"]);
        projectRow.getCell(1).font = { bold: true };

        const dateRow = worksheet.addRow([
            "FROM:", start_date ? format(new Date(start_date), "MM/dd/yyyy") : "-",
            "", "TO:", end_date ? format(new Date(end_date), "MM/dd/yyyy") : "-"
        ]);
        dateRow.getCell(1).font = { bold: true };
        dateRow.getCell(4).font = { bold: true };
        worksheet.addRow([]);

        // 2. TABLE HEADERS
        const headerRow = worksheet.addRow([
            "DATE", "TASK ID", "START", "FINISH", "REGULAR HRS", "OVERTIME", "SICK", "VACATION", "OTHER", "TOTAL HRS"
        ]);

        headerRow.eachCell((cell) => {
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FF6A4C9C" } // Purple
            };
            cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
            cell.alignment = { horizontal: "center" };
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" }
            };
        });

        // 3. TABLE DATA
        editableData.forEach(r => {
            const row = worksheet.addRow([
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
            row.eachCell((cell) => {
                cell.alignment = { horizontal: "center" };
                cell.border = {
                    top: { style: "thin" },
                    left: { style: "thin" },
                    bottom: { style: "thin" },
                    right: { style: "thin" }
                };
            });
            // Highlight total column background like UI
            row.getCell(10).fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFF8FAFC" }
            };
            row.getCell(10).font = { bold: true };
        });

        // 4. TOTALS ROW
        const totalRowArr = [
            "TOTAL HOURS", "", "", "",
            totals.reg.toFixed(2),
            totals.ot.toFixed(2),
            totals.sick.toFixed(2),
            totals.vac.toFixed(2),
            totals.other.toFixed(2),
            totals.grand.toFixed(2)
        ];
        const finalRow = worksheet.addRow(totalRowArr);
        finalRow.eachCell((cell, colNumber) => {
            cell.font = { bold: true };
            cell.alignment = { horizontal: "center" };
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFF1F5F9" }
            };
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" }
            };

            // Style the Grand Total cell specifically (Purple)
            if (colNumber === 10) {
                cell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "FF6A4C9C" }
                };
                cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
            }
        });

        // 5. COLUMN WIDTHS
        worksheet.columns = [
            { width: 18 }, // Date
            { width: 35 }, // Task ID
            { width: 12 }, // Start
            { width: 12 }, // Finish
            { width: 15 }, // Reg
            { width: 15 }, // OT
            { width: 12 }, // Sick
            { width: 12 }, // Vac
            { width: 12 }, // Other
            { width: 15 }  // Total
        ];

        // 6. DOWNLOAD
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `timesheet_${employee?.name || 'report'}.xlsx`;
        anchor.click();
        window.URL.revokeObjectURL(url);
    };

    const handlePrint = () => {
        const content = printRef.current;

        // Temporarily hide action buttons during print
        const buttons = content.querySelectorAll('.no-print');
        buttons.forEach(b => b.style.display = 'none');

        const pri = window.open("", "PRINT", "height=800,width=1000");
        pri.document.write("<html><head><title>Timesheet</title>");
        pri.document.write("<style>body { font-family: sans-serif; padding: 20px; } table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid #000; padding: 8px; text-align: center; } th { background-color: #6A4C9C; color: #fff; } .no-print { display: none !important; }</style>");
        pri.document.write("</head><body>");
        pri.document.write(content.innerHTML);
        pri.document.write("</body></html>");
        pri.document.close();
        pri.focus();
        pri.print();
        pri.close();

        // Restore action buttons
        buttons.forEach(b => b.style.display = 'flex');
    };

    const getTasksForDateRange = (rowDateStr) => {
        if (!data.assigned_tasks || !rowDateStr) return [];
        try {
            const rowDate = new Date(rowDateStr);
            return data.assigned_tasks.filter(t => {
                if (!t.start_date) return false;
                const taskStart = new Date(t.start_date);
                const taskEnd = t.end_date ? new Date(t.end_date) : taskStart;

                // Expand task range by 2 days either side
                const expandedStart = new Date(taskStart);
                expandedStart.setDate(expandedStart.getDate() - 2);
                const expandedEnd = new Date(taskEnd);
                expandedEnd.setDate(expandedEnd.getDate() + 2);

                return rowDate >= expandedStart && rowDate <= expandedEnd;
            });
        } catch (e) {
            return [];
        }
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
                    <img src={process.env.PUBLIC_URL + "/light-redsage.png"} alt="Redsage" style={styles.redsageLogo} onError={(e) => { e.target.src = process.env.PUBLIC_URL + "/redsage.png"; }} />
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
                            {!isHistory && <th style={{ ...styles.th, width: "50px" }} className="no-print">Action</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {editableData.map((row, idx) => {
                            const filteredTasks = getTasksForDateRange(row.date || row.day);
                            const listId = `tasks-list-${idx}`;

                            return (
                                <tr key={idx} style={styles.tbodyRow}>
                                    <td style={styles.td}><input style={styles.tableInput} value={row.day} onChange={(e) => handleCellChange(idx, 'day', e.target.value)} /></td>
                                    <td style={styles.td}>
                                        <input
                                            list={listId}
                                            style={styles.tableInput}
                                            value={row.task_id}
                                            onChange={(e) => handleCellChange(idx, 'task_id', e.target.value)}
                                            placeholder="Select or Type Task ID"
                                            onClick={(e) => { if (row.task_id === 'N/A') handleCellChange(idx, 'task_id', ''); }}
                                        />
                                        <datalist id={listId}>
                                            {filteredTasks.map(t => (
                                                <option key={t.id} value={t.task_code}>{t.title}</option>
                                            ))}
                                            <option value="N/A" />
                                        </datalist>
                                    </td>
                                    <td style={styles.td}><input style={styles.tableInput} value={row.start_time} onChange={(e) => handleCellChange(idx, 'start_time', e.target.value)} /></td>
                                    <td style={styles.td}><input style={styles.tableInput} value={row.end_time} onChange={(e) => handleCellChange(idx, 'end_time', e.target.value)} /></td>
                                    <td style={styles.td}><input style={styles.tableInput} value={row.regular_hrs} onChange={(e) => handleCellChange(idx, 'regular_hrs', e.target.value)} /></td>
                                    <td style={styles.td}><input style={styles.tableInput} value={row.overtime_hrs} onChange={(e) => handleCellChange(idx, 'overtime_hrs', e.target.value)} /></td>
                                    <td style={styles.td}><input style={styles.tableInput} value={row.sick_hrs} onChange={(e) => handleCellChange(idx, 'sick_hrs', e.target.value)} /></td>
                                    <td style={styles.td}><input style={styles.tableInput} value={row.vacation_hrs} onChange={(e) => handleCellChange(idx, 'vacation_hrs', e.target.value)} /></td>
                                    <td style={styles.td}><input style={styles.tableInput} value={(parseFloat(row.holiday_hrs || 0) + parseFloat(row.other_hrs || 0)).toFixed(2)} onChange={(e) => handleCellChange(idx, 'other_hrs', e.target.value)} /></td>
                                    <td style={{ ...styles.td, fontWeight: 700, background: "#f8fafc" }}>{row.total_hrs}</td>
                                    {!isHistory && (
                                        <td style={styles.td} className="no-print">
                                            <button onClick={() => handleDeleteRow(idx)} style={styles.deleteBtn}>
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                        {!isHistory && (
                            <tr className="no-print">
                                <td colSpan={11} style={{ padding: "8px", textAlign: "left" }}>
                                    <button onClick={handleAddRow} style={styles.addBtnRow} title="Add Row">
                                        <Plus size={16} />
                                    </button>
                                </td>
                            </tr>
                        )}
                        <tr style={styles.totalRow}>
                            <td style={styles.totalLabel} colSpan={4}>TOTAL HOURS</td>
                            <td style={styles.totalVal}>{totals.reg.toFixed(2)}</td>
                            <td style={styles.totalVal}>{totals.ot.toFixed(2)}</td>
                            <td style={styles.totalVal}>{totals.sick.toFixed(2)}</td>
                            <td style={styles.totalVal}>{totals.vac.toFixed(2)}</td>
                            <td style={styles.totalVal}>{totals.other.toFixed(2)}</td>
                            <td style={{ ...styles.totalVal, background: "#6A4C9C", color: "#fff", fontWeight: 800 }}>{totals.grand.toFixed(2)}</td>
                            {!isHistory && <td className="no-print" style={{ border: "none", background: "#fff" }}></td>}
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
    },
    deleteBtn: {
        background: "none",
        border: "none",
        color: "#ef4444",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "8px",
        borderRadius: "4px",
        transition: "background 0.2s",
    },
    addBtnRow: {
        background: "#6A4C9C",
        border: "none",
        color: "#fff",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "28px",
        height: "28px",
        borderRadius: "50%",
        fontSize: "12px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        transition: "all 0.2s",
    }
};
