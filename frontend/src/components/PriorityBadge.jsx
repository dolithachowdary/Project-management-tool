import React from "react";

const getPriorityStyles = (priority) => {
    switch (priority?.toLowerCase()) {
        case "high":
            return {
                backgroundColor: "var(--error-bg)",
                color: "var(--error-color)",
                borderColor: "var(--error-color)",
            };
        case "medium":
            return {
                backgroundColor: "var(--warning-bg)",
                color: "var(--warning-color)",
                borderColor: "var(--warning-color)",
            };
        case "low":
            return {
                backgroundColor: "var(--success-bg)",
                color: "var(--success-color)",
                borderColor: "var(--success-color)",
            };
        default:
            return {
                backgroundColor: "var(--bg-secondary)",
                color: "var(--text-secondary)",
                borderColor: "var(--border-color)",
            };
    }
};

const PriorityBadge = ({ priority, style = {} }) => {
    const styles = getPriorityStyles(priority);

    return (
        <span
            style={{
                display: "inline-block",
                padding: "4px 12px",
                borderRadius: "20px",
                fontSize: "11px",
                fontWeight: "700",
                border: "1px solid",
                textTransform: "capitalize",
                whiteSpace: "nowrap",
                ...styles,
                ...style,
            }}
        >
            {priority || "Medium"}
        </span>
    );
};

export default PriorityBadge;
