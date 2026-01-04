import React, { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, eachDayOfInterval, parseISO, isValid } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const RED = "#C62828";

const DatePicker = ({ value, onChange, label, placeholder = "Select date", required, name }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const containerRef = useRef(null);

    // Sync current month view when modal opens or value changes
    useEffect(() => {
        if (value) {
            const parsed = parseISO(value);
            if (isValid(parsed)) {
                setCurrentMonth(parsed);
            }
        }
    }, [isOpen, value]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleDateClick = (date) => {
        const formattedDate = format(date, "yyyy-MM-dd");
        // Compatibility with standard event handlers
        onChange({
            target: {
                name: name || label,
                value: formattedDate
            }
        });
        setIsOpen(false);
    };

    const renderHeader = () => {
        return (
            <div style={styles.calendarHeader}>
                <button type="button" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} style={styles.navBtn}>
                    <ChevronLeft size={18} />
                </button>
                <span style={styles.currentMonth}>
                    {format(currentMonth, "MMMM yyyy")}
                </span>
                <button type="button" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} style={styles.navBtn}>
                    <ChevronRight size={18} />
                </button>
            </div>
        );
    };

    const renderDays = () => {
        const days = ["S", "M", "T", "W", "T", "F", "S"];
        return (
            <div style={styles.daysRow}>
                {days.map((day, idx) => (
                    <div key={idx} style={styles.dayLabel}>{day}</div>
                ))}
            </div>
        );
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
        const selectedDate = value ? parseISO(value) : null;

        return (
            <div style={styles.grid}>
                {calendarDays.map((day, i) => {
                    const isSelected = selectedDate && isValid(selectedDate) && isSameDay(day, selectedDate);
                    const isCurrentMonth = isSameMonth(day, monthStart);
                    const isTodayDate = isSameDay(day, new Date());

                    return (
                        <div
                            key={i}
                            onClick={() => handleDateClick(day)}
                            className="datepicker-cell"
                            style={{
                                ...styles.cell,
                                ...(isSelected ? styles.selectedCell : {}),
                                ...(!isCurrentMonth ? styles.otherMonthCell : {}),
                                ...(isTodayDate && !isSelected ? styles.todayCell : {}),
                            }}
                        >
                            {format(day, "d")}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div style={styles.container} ref={containerRef}>
            <style>
                {`
          .datepicker-cell:hover {
            background-color: ${isOpen ? '#f1f5f9' : 'transparent'};
          }
          .datepicker-cell:active {
            transform: scale(0.95);
          }
          .datepicker-input-wrapper:hover input {
            border-color: #cbd5e1;
          }
        `}
            </style>

            {label && <label style={styles.label}>{label} {required && <span style={styles.required}>*</span>}</label>}

            <div
                style={styles.inputWrapper}
                onClick={() => setIsOpen(!isOpen)}
                className="datepicker-input-wrapper"
            >
                <input
                    type="text"
                    readOnly
                    placeholder={placeholder}
                    value={value && isValid(parseISO(value)) ? format(parseISO(value), "MMM dd, yyyy") : ""}
                    style={styles.input}
                />
                <CalendarIcon size={16} color="#94a3b8" style={styles.icon} />
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        style={styles.dropdown}
                    >
                        {renderHeader()}
                        {renderDays()}
                        {renderCells()}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const styles = {
    container: {
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        position: "relative",
        width: "100%",
    },
    label: {
        fontSize: "13px",
        fontWeight: "500",
        color: "#475569",
        marginBottom: "4px",
        display: "block"
    },
    required: {
        color: "#ef4444",
    },
    inputWrapper: {
        position: "relative",
        cursor: "pointer",
        width: "100%"
    },
    input: {
        width: "100%",
        padding: "10px 12px 10px 38px",
        borderRadius: "8px",
        border: "1px solid #e2e8f0",
        fontSize: "14px",
        color: "#1e293b",
        outline: "none",
        background: "#fff",
        cursor: "pointer",
        boxSizing: "border-box",
        transition: "border-color 0.2s",
        fontFamily: "'Poppins', sans-serif"
    },
    icon: {
        position: "absolute",
        left: "12px",
        top: "50%",
        transform: "translateY(-50%)",
    },
    dropdown: {
        position: "absolute",
        top: "100%",
        left: 0,
        marginTop: "8px",
        background: "#fff",
        borderRadius: "12px",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        border: "1px solid #f1f5f9",
        padding: "12px",
        zIndex: 9999,
        width: "240px",
    },
    calendarHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "12px",
    },
    navBtn: {
        background: "none",
        border: "none",
        color: "#64748b",
        cursor: "pointer",
        padding: "6px",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.2s",
    },
    currentMonth: {
        fontWeight: "700",
        fontSize: "14px",
        color: "#1e293b",
    },
    daysRow: {
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
        marginBottom: "8px",
    },
    dayLabel: {
        fontSize: "12px",
        fontWeight: "700",
        color: "#94a3b8",
        textAlign: "center",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
        gap: "4px",
    },
    cell: {
        aspectRatio: "1",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "12px",
        fontWeight: "600",
        color: "#475569",
        cursor: "pointer",
        borderRadius: "6px",
        transition: "all 0.2s",
    },
    selectedCell: {
        background: RED,
        color: "#fff",
        boxShadow: `0 4px 12px ${RED}40`,
    },
    otherMonthCell: {
        color: "#cbd5e1",
    },
    todayCell: {
        color: RED,
        background: "#fff1f1",
    },
};

export default DatePicker;
