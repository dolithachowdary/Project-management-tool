import React from "react";

const getPriorityStyles = (priority) => {
    switch (priority?.toLowerCase()) {
        case "high":
            return {
                backgroundColor: "#fee2e2",
                color: "#b91c1c",
                borderColor: "#fecaca",
            };
        case "medium":
            return {
                backgroundColor: "#fef3c7",
                color: "#92400e",
                borderColor: "#fde68a",
            };
        case "low":
            return {
                backgroundColor: "#dcfce7",
                color: "#15803d",
                borderColor: "#bbf7d0",
            };
        default:
            return {
                backgroundColor: "#f3f4f6",
                color: "#475569",
                borderColor: "#e2e8f0",
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
