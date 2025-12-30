import React from 'react';
import { getInitials, getAvatarColor } from '../utils/helpers';

const Avatar = ({ name, size = 32, style = {}, className = '' }) => {
    const initials = getInitials(name);
    const backgroundColor = getAvatarColor(name);

    const baseStyle = {
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.4, // Scale font with size
        fontWeight: 600,
        color: '#333', // Dark text for contrast on light pastel
        border: '1px solid rgba(0,0,0,0.05)',
        userSelect: 'none',
        textTransform: 'uppercase',
        ...style
    };

    return (
        <div
            className={`avatar-component ${className}`}
            style={baseStyle}
            title={name}
        >
            {initials}
        </div>
    );
};

export default Avatar;
