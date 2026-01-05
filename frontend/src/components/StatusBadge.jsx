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
                backgroundColor: "#fffbeb",
                color: "#92400e",
                borderColor: "#fde68a",
            };
        case "in progress":
        case "in_progress":
            return {
                backgroundColor: "#eff6ff",
                color: "#1d4ed8",
                borderColor: "#bfdbfe",
            };
        case "done":
        case "completed":
        case "finished":
            return {
                backgroundColor: "#f0fdf4",
                color: "#15803d",
                borderColor: "#bbf7d0",
            };
        case "review":
            return {
                backgroundColor: "#f5f3ff",
                color: "#6d28d9",
                borderColor: "#ddd6fe",
            };
        case "blocked":
            return {
                backgroundColor: "#fef2f2",
                color: "#b91c1c",
                borderColor: "#fecaca",
            };
        default:
            return {
                backgroundColor: "#f3f4f6",
                color: "#475569",
                borderColor: "#e2e8f0",
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
