import React from "react";
import { getInitials, getAvatarColor } from "../utils/helpers";

const Avatar = ({ name, id, color, size = 32, style = {} }) => {
    const initials = getInitials(name);
    const bgColor = color || getAvatarColor(id || name || "?");

    const avatarStyle = {
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: bgColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.4,
        fontWeight: "700",
        color: "#334155",
        border: "2px solid var(--header-bg)",
        flexShrink: 0,
        cursor: "default",
        ...style,
    };

    return (
        <div style={avatarStyle} title={name}>
            {initials}
        </div>
    );
};

export const AvatarGroup = ({ members = [], size = 32, max = 4 }) => {
    const visibleMembers = members.slice(0, max);
    const remaining = members.length - max;

    return (
        <div style={{ display: "flex", alignItems: "center", marginLeft: 4 }}>
            {visibleMembers.map((m, idx) => (
                <Avatar
                    key={m.id || idx}
                    name={m.name || m.full_name}
                    id={m.id}
                    color={m.color}
                    size={size}
                    style={{ marginLeft: idx === 0 ? 0 : -(size * 0.3) }}
                />
            ))}
            {remaining > 0 && (
                <div
                    style={{
                        width: size,
                        height: size,
                        borderRadius: "50%",
                        backgroundColor: "var(--bg-secondary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: size * 0.35,
                        fontWeight: "600",
                        color: "var(--text-secondary)",
                        border: "2px solid var(--header-bg)",
                        marginLeft: -(size * 0.3),
                        zIndex: max,
                    }}
                >
                    +{remaining}
                </div>
            )}
        </div>
    );
};

export default Avatar;
