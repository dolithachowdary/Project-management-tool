import React, { useEffect, useState, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Loader from "../components/Loader";
import Avatar from "../components/Avatar";
import { getGlobalLogs } from "../api/changeLogs";
import { format, parseISO, subDays } from "date-fns";
import { History } from "lucide-react";

export default function Logs() {
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState([]);
    const [selectedDate] = useState(format(new Date(), "yyyy-MM-dd"));

    // Pagination (loading 3 days at a time)
    const [daysLoaded, setDaysLoaded] = useState(3);
    const [loadingMore, setLoadingMore] = useState(false);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem("userData"));
        if (userData?.role) {
            const normalizedRole = userData.role.toLowerCase();
            if (normalizedRole !== "admin" && normalizedRole !== "project manager") {
                window.location.href = "/dashboard";
                return;
            }
            setRole(userData.role);
        } else {
            window.location.href = "/login";
        }
    }, []);

    const fetchLogs = useCallback(async (days = 3) => {
        try {
            if (days > 3) setLoadingMore(true);
            else setLoading(true);

            const endDate = selectedDate;
            const startDate = format(subDays(parseISO(selectedDate), days - 1), "yyyy-MM-dd");

            const params = {
                start_date: startDate + " 00:00:00",
                end_date: endDate + " 23:59:59"
            };

            console.log("Fetching logs with params:", params);
            const res = await getGlobalLogs(params);
            console.log("Received logs:", res.data?.data || res.data);
            setLogs(res.data?.data || res.data || []);
        } catch (err) {
            console.error("Failed to fetch logs", err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [selectedDate]);

    useEffect(() => {
        fetchLogs(daysLoaded);
    }, [fetchLogs, daysLoaded]);

    const handleShowMore = () => {
        setDaysLoaded(prev => prev + 3);
    };

    // Group logs by date
    const groupedLogs = logs.reduce((acc, log) => {
        const dateKey = format(parseISO(log.changed_at), "yyyy-MM-dd");
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(log);
        return acc;
    }, {});

    const sortedDates = Object.keys(groupedLogs).sort((a, b) => b.localeCompare(a));

    if (!role) return <Loader />;

    return (
        <div style={styles.app}>
            <Sidebar role={role} />
            <div style={styles.main}>
                <Header />
                <div style={styles.content}>
                    <div style={styles.logContainer}>
                        {loading ? <Loader /> : (
                            <>
                                {sortedDates.length === 0 ? (
                                    <div style={styles.emptyState}>
                                        <History size={48} color="var(--border-color)" />
                                        <h3>No logs found</h3>
                                        <p>Try adjusting your filters or date range.</p>
                                    </div>
                                ) : (
                                    sortedDates.map(date => (
                                        <div key={date} style={styles.dateSection}>
                                            <div style={styles.dateHeader}>
                                                {format(parseISO(date), "EEEE, MMM dd")}
                                            </div>
                                            <div style={styles.table}>
                                                <div style={styles.tableHeader}>
                                                    <span style={styles.colId}>ID</span>
                                                    <span style={styles.colUser}>Author</span>
                                                    <span style={styles.colAction}>Action</span>
                                                    <span style={styles.colProject}>Project</span>
                                                    <span style={styles.colTime}>Time</span>
                                                </div>
                                                {groupedLogs[date].map(log => (
                                                    <div key={log.id} style={styles.tableRow}>
                                                        <span style={styles.colId}>{log.entity_id}</span>
                                                        <span style={styles.colUser}>
                                                            <Avatar name={log.user_name} size={24} />
                                                            <span style={styles.userName}>{log.user_name}</span>
                                                        </span>
                                                        <span style={styles.colAction}>{log.message}</span>
                                                        <span style={styles.colProject}>{log.project_name || "-"}</span>
                                                        <span style={styles.colTime}>{format(parseISO(log.changed_at), "HH:mm")}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                )}
                                <div style={styles.footer}>
                                    <button
                                        style={styles.showMoreBtn}
                                        onClick={handleShowMore}
                                        disabled={loadingMore}
                                    >
                                        {loadingMore ? "Loading..." : "Show More (3 days)"}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}


const styles = {
    app: { display: "flex", height: "100vh", overflow: "hidden", backgroundColor: "var(--bg-secondary)" },
    main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
    content: { flex: 1, overflowY: "auto", padding: "32px" },
    pageHeader: { marginBottom: "32px" },
    titleArea: { marginBottom: "24px" },
    title: { fontSize: "28px", fontWeight: "800", color: "var(--text-primary)", margin: 0 },
    subtitle: { fontSize: "15px", color: "var(--text-secondary)", marginTop: "4px" },
    filterBar: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" },
    filterGroup: { display: "flex", gap: "12px" },
    selectWrap: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        background: "var(--card-bg)",
        border: "1px solid var(--border-color)",
        borderRadius: "12px",
        padding: "0 12px",
        height: "44px",
        boxShadow: "var(--shadow-sm)"
    },
    select: { border: "none", outline: "none", background: "none", fontSize: "14px", fontWeight: "600", color: "var(--text-primary)", minWidth: "120px" },
    icon: { color: "var(--text-secondary)" },
    dateNav: { display: "flex", alignItems: "center", gap: "8px" },
    navBtn: {
        width: "44px",
        height: "44px",
        borderRadius: "12px",
        border: "1px solid var(--border-color)",
        background: "var(--card-bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        color: "var(--text-primary)"
    },
    dateDisplay: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        background: "var(--card-bg)",
        border: "1px solid var(--border-color)",
        borderRadius: "12px",
        padding: "0 16px",
        height: "44px",
        fontWeight: "700",
        color: "var(--text-primary)",
        position: "relative",
        cursor: "pointer"
    },
    hiddenPicker: { position: "absolute", inset: 0, cursor: "pointer", width: "100%" },
    logContainer: { display: "flex", flexDirection: "column", gap: "40px" },
    dateSection: { display: "flex", flexDirection: "column", gap: "16px" },
    dateHeader: { fontSize: "16px", fontWeight: "700", color: "var(--text-secondary)", paddingLeft: "4px" },
    table: { background: "var(--card-bg)", borderRadius: "16px", border: "1px solid var(--border-color)", overflow: "hidden", boxShadow: "var(--shadow-sm)" },
    tableHeader: {
        display: "grid",
        gridTemplateColumns: "250px 180px 1fr 180px 80px",
        padding: "16px 24px",
        background: "var(--bg-secondary)",
        borderBottom: "1px solid var(--border-color)",
        fontSize: "13px",
        fontWeight: "700",
        color: "var(--text-secondary)",
        textTransform: "uppercase",
        letterSpacing: "0.5px"
    },
    tableRow: {
        display: "grid",
        gridTemplateColumns: "250px 180px 1fr 180px 80px",
        padding: "16px 24px",
        borderBottom: "1px solid var(--border-color)",
        alignItems: "center",
        fontSize: "14px",
        transition: "background 0.2s"
    },
    colId: {
        color: "var(--text-secondary)",
        fontFamily: "monospace",
        paddingRight: "16px",
        wordBreak: "break-all"
    },
    colUser: { display: "flex", alignItems: "center", gap: "10px" },
    userName: { fontWeight: "600", color: "var(--text-primary)" },
    colAction: { color: "var(--text-primary)" },
    colProject: { color: "var(--text-secondary)" },
    colStatus: { display: "flex" },
    badge: { padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", color: "var(--text-primary)", textTransform: "capitalize" },
    colTime: { color: "var(--text-secondary)", textAlign: "right", fontWeight: "500" },
    emptyState: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "100px 0", color: "var(--text-secondary)" },
    footer: { display: "flex", justifyContent: "center", padding: "40px 0" },
    showMoreBtn: {
        padding: "12px 24px",
        borderRadius: "12px",
        border: "1px solid var(--border-color)",
        background: "var(--card-bg)",
        fontSize: "15px",
        fontWeight: "700",
        color: "var(--text-primary)",
        cursor: "pointer",
        transition: "all 0.2s"
    }
};
