import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Construction, ArrowLeft, Lock } from 'lucide-react';

const Reports = () => {
    const navigate = useNavigate();
    const userData = JSON.parse(localStorage.getItem('userData'));
    const role = userData?.role || '';

    return (
        <div style={styles.pageContainer}>
            <Sidebar />
            <div style={styles.mainContent}>
                <Header role={role} />

                <div style={styles.contentArea}>
                    <button onClick={() => navigate(-1)} style={styles.backBtn}>
                        <ArrowLeft size={18} />
                        <span>Go Back</span>
                    </button>

                    <div style={styles.centerContainer}>
                        <div style={styles.iconWrapper}>
                            <Construction size={80} color="#f59e0b" strokeWidth={1.5} />
                            <div style={styles.lockBadge}>
                                <Lock size={24} color="#fff" />
                            </div>
                        </div>

                        <h1 style={styles.title}>Reports Module</h1>
                        <p style={styles.subtitle}>Under Development</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    pageContainer: {
        display: 'flex',
        height: '100vh',
        background: '#f8fafc',
    },
    mainContent: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
    },
    contentArea: {
        flex: 1,
        padding: '24px',
        overflowY: 'auto',
    },
    backBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'none',
        border: 'none',
        color: '#64748b',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        padding: '8px 0',
        marginBottom: '24px',
        transition: 'color 0.2s ease',
    },
    centerContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 200px)',
        textAlign: 'center',
    },
    iconWrapper: {
        position: 'relative',
        marginBottom: '32px',
        animation: 'bounce 2s infinite',
    },
    lockBadge: {
        position: 'absolute',
        bottom: -8,
        right: -8,
        width: 48,
        height: 48,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
        border: '3px solid #fff',
    },
    title: {
        fontSize: '36px',
        fontWeight: '700',
        color: '#0f172a',
        margin: '0 0 12px 0',
    },
    subtitle: {
        fontSize: '18px',
        color: '#f59e0b',
        fontWeight: '600',
        margin: '0 0 32px 0',
        padding: '8px 24px',
        background: '#fef3c7',
        borderRadius: '24px',
        border: '2px solid #fbbf24',
    },
    messageBox: {
        maxWidth: '600px',
        background: '#fff',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0',
    },
    message: {
        fontSize: '16px',
        color: '#475569',
        lineHeight: '1.6',
        margin: '0 0 24px 0',
    },
    featureList: {
        listStyle: 'none',
        padding: 0,
        margin: '0 0 24px 0',
        textAlign: 'left',
    },
    comingSoon: {
        fontSize: '20px',
        fontWeight: '700',
        color: '#3b82f6',
        margin: 0,
        paddingTop: '16px',
        borderTop: '2px solid #e2e8f0',
    },
};

// Add CSS animation for bounce effect
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
`;
document.head.appendChild(styleSheet);

export default Reports;
