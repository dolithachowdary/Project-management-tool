/**
 * Formats a status string for display (encapsulates "UI NEVER sends display strings to backend")
 * snake_case -> Title Case
 */
export const formatStatus = (status) => {
    if (!status) return "";

    // Handle specific backend mappings
    const map = {
        "todo": "To Do",
        "in_progress": "In Progress",
        "review": "Review",
        "done": "Done",
        "blocked": "Blocked"
    };

    if (map[status]) return map[status];

    // Fallback for already formatted or unknown
    if (Object.values(map).includes(status)) return status;

    // Generic snake_case to Title Case fallback
    return status
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

/**
 * Formats a status string for API (encapsulates "Convert to snake_case before API calls")
 * Title Case -> snake_case
 */
export const toApiStatus = (status) => {
    if (!status) return "";

    const map = {
        "To Do": "todo",
        "In Progress": "in_progress",
        "Review": "review",
        "Done": "done",
        "Blocked": "blocked"
    };

    if (map[status]) return map[status];

    // Fallback: if it's already lower_snake_case (approx check)
    if (status === status.toLowerCase() && status.includes('_')) return status;
    if (!status.includes(' ') && status === status.toLowerCase()) return status;

    return status.toLowerCase().replace(/\s+/g, '_');
};

/**
 * Generates formatted initials from a full name.
 * 2 letters max.
 */
export const getInitials = (name) => {
    if (!name || typeof name !== 'string') return "?";
    const parts = name.trim().split(/\s+/);
    if (!parts.length || !parts[0]) return "?";
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + (parts[parts.length - 1][0] || "")).toUpperCase();
};

/**
 * Generates a deterministic pastel color based on a string (name/id).
 */
export const getAvatarColor = (str) => {
    if (!str || typeof str !== 'string') return "#E0E0E0";
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Pastel colors HSL
    // Hue: based on hash
    // Saturation: 60-80%
    // Lightness: 80-90% for light background
    const h = Math.abs(hash % 360);
    return `hsl(${h}, 70%, 85%)`;
};

export const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 5) return "just now";
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
};
