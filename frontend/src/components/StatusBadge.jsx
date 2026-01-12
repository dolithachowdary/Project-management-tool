import React from "react";

/**
 * Returns the standardized styles for a given status.
 */
export const getStatusStyles = (status) => {
    const s = status?.toLowerCase()?.replace(/_/g, " ");
    switch (s) {
        case "to do":
        case "todo":
        case "planned":
            return {
                backgroundColor: "var(--warning-bg)",
                color: "var(--warning-color)",
                borderColor: "var(--warning-color)",
            };
        case "in progress":
        case "in_progress":
            return {
                backgroundColor: "var(--info-bg)",
                color: "var(--info-color)",
                borderColor: "var(--info-color)",
            };
        case "done":
        case "completed":
        case "finished":
            return {
                backgroundColor: "var(--success-bg)",
                color: "var(--success-color)",
                borderColor: "var(--success-color)",
            };
        case "review":
            return {
                backgroundColor: "var(--purple-bg)",
                color: "var(--purple-color)",
                borderColor: "var(--purple-color)",
            };
        case "blocked":
            return {
                backgroundColor: "var(--error-bg)",
                color: "var(--error-color)",
                borderColor: "var(--error-color)",
            };
        default:
            return {
                backgroundColor: "var(--bg-secondary)",
                color: "var(--text-secondary)",
                borderColor: "var(--border-color)",
            };
    }
};

/**
 * A reusable pill-style badge for task statuses.
 */
const StatusBadge = ({ status, style = {}, onClick }) => {
    const styles = getStatusStyles(status);

    // Normalize display text
    let displayText = status || "To Do";
    if (displayText.toLowerCase() === "todo") displayText = "To Do";
    if (displayText.toLowerCase() === "in_progress") displayText = "In Progress";
    if (displayText.toLowerCase() === "planned") displayText = "To Do";

    return (
        <span
            onClick={onClick}
            style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "4px 12px",
                borderRadius: "20px",
                fontSize: "11px",
                fontWeight: "700",
                border: "1px solid",
                textTransform: "capitalize",
                whiteSpace: "nowrap",
                cursor: onClick ? "pointer" : "default",
                ...styles,
                ...style,
            }}
        >
            {displayText}
        </span>
    );
};

export default StatusBadge;
