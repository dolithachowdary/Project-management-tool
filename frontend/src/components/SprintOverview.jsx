import React from 'react';

const SprintOverview = ({ data, styles }) => {
    if (!data) return null;

    return (
        <div style={styles.emptyState}>
            Overview content coming soon...
        </div>
    );
};

export default SprintOverview;
