import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import MemberWorkloadGraph from '../components/MemberWorkloadGraph';
import Avatar from '../components/Avatar';
import Loader from '../components/Loader';
import { ArrowLeft, Users, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import api from '../api/axios';

const Reports = () => {
    const navigate = useNavigate();
    const userData = JSON.parse(localStorage.getItem('userData'));
    const role = userData?.role || '';

    const [workloadData, setWorkloadData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchWorkloadData();
    }, []);

    const fetchWorkloadData = async () => {
        try {
            setLoading(true);

            const response = await api.get('/dashboard/team-workload');

            if (response.data.success) {
                setWorkloadData(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching workload data:', err);
            console.error('Error response:', err.response);
            if (err.response?.status === 401) {
                setError('Your session has expired. Please log in again.');
            } else if (err.response?.status === 403) {
                setError(err.response?.data?.error || 'Access denied. Only Project Managers and Admins can view this page.');
            } else {
                setError(err.response?.data?.error || 'Failed to load workload data');
            }
        } finally {
            setLoading(false);
        }
    };

    // Calculate statistics
    const stats = {
        total: workloadData.length,
        overloaded: workloadData.filter(m => m.workload_status === 'overloaded').length,
        underutilized: workloadData.filter(m => m.workload_status === 'underutilized').length,
        balanced: workloadData.filter(m => m.workload_status === 'balanced').length,
    };

    // Prepare data for graph
    const graphData = workloadData.map(member => ({
        id: member.id,
        name: member.name,
        total: parseInt(member.active_tasks),
        completed: 0, // We're showing active tasks, not completed
        role: member.role
    }));

    const overloadedMembers = workloadData.filter(m => m.workload_status === 'overloaded');
    const underutilizedMembers = workloadData.filter(m => m.workload_status === 'underutilized');

    if (loading) {
        return (
            <div style={styles.pageContainer}>
                <Sidebar />
                <div style={styles.mainContent}>
                    <Header role={role} />
                    <Loader />
                </div>
            </div>
        );
    }

    if (error) {
        const isAuthError = error.includes('session has expired') || error.includes('Unauthorized');

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
                        <div style={styles.errorContainer}>
                            <AlertTriangle size={48} color="#ef4444" />
                            <h2 style={styles.errorTitle}>{isAuthError ? 'Session Expired' : 'Access Denied'}</h2>
                            <p style={styles.errorText}>{error}</p>
                            {isAuthError && (
                                <button
                                    onClick={() => {
                                        localStorage.clear();
                                        navigate('/login');
                                    }}
                                    style={styles.loginButton}
                                >
                                    Go to Login
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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

                    <div style={styles.header}>
                        <div>
                            <h1 style={styles.title}>Team Workload Reports</h1>
                            <p style={styles.subtitle}>Analyze task distribution and team capacity</p>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div style={styles.statsGrid}>
                        <div style={styles.statCard}>
                            <div style={styles.statIcon} data-color="blue">
                                <Users size={24} />
                            </div>
                            <div style={styles.statContent}>
                                <div style={styles.statValue}>{stats.total}</div>
                                <div style={styles.statLabel}>Total Team Members</div>
                            </div>
                        </div>

                        <div style={styles.statCard}>
                            <div style={styles.statIcon} data-color="red">
                                <AlertTriangle size={24} />
                            </div>
                            <div style={styles.statContent}>
                                <div style={styles.statValue}>{stats.overloaded}</div>
                                <div style={styles.statLabel}>Overloaded</div>
                            </div>
                        </div>

                        <div style={styles.statCard}>
                            <div style={styles.statIcon} data-color="green">
                                <CheckCircle size={24} />
                            </div>
                            <div style={styles.statContent}>
                                <div style={styles.statValue}>{stats.balanced}</div>
                                <div style={styles.statLabel}>Balanced</div>
                            </div>
                        </div>

                        <div style={styles.statCard}>
                            <div style={styles.statIcon} data-color="orange">
                                <TrendingUp size={24} />
                            </div>
                            <div style={styles.statContent}>
                                <div style={styles.statValue}>{stats.underutilized}</div>
                                <div style={styles.statLabel}>Underutilized</div>
                            </div>
                        </div>
                    </div>

                    {/* Workload Graph */}
                    <div style={styles.chartCard}>
                        <h2 style={styles.chartTitle}>Active Tasks Distribution</h2>
                        <p style={styles.chartSubtitle}>Current active task count per team member</p>
                        <div style={styles.graphWrapper}>
                            <MemberWorkloadGraph data={graphData} />
                        </div>
                    </div>

                    {/* Detailed Lists */}
                    <div style={styles.listsGrid}>
                        {/* Overloaded Members */}
                        {overloadedMembers.length > 0 && (
                            <div style={styles.listCard}>
                                <div style={styles.listHeader}>
                                    <AlertTriangle size={20} color="#ef4444" />
                                    <h3 style={styles.listTitle}>Overloaded Members</h3>
                                </div>
                                <div style={styles.listContent}>
                                    {overloadedMembers.map(member => (
                                        <div key={member.id} style={styles.memberRow}>
                                            <div style={styles.memberInfo}>
                                                <Avatar name={member.name} id={member.id} size={36} />
                                                <div style={styles.memberDetails}>
                                                    <div style={styles.memberName}>{member.name}</div>
                                                    <div style={styles.memberRole}>{member.role}</div>
                                                </div>
                                            </div>
                                            <div style={styles.memberStats}>
                                                <div style={styles.statBadge} data-type="danger">
                                                    {member.active_tasks} tasks
                                                </div>
                                                <div style={styles.statBadge} data-type="warning">
                                                    {member.total_points} pts
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Underutilized Members */}
                        {underutilizedMembers.length > 0 && (
                            <div style={styles.listCard}>
                                <div style={styles.listHeader}>
                                    <TrendingUp size={20} color="#f59e0b" />
                                    <h3 style={styles.listTitle}>Underutilized Members</h3>
                                </div>
                                <div style={styles.listContent}>
                                    {underutilizedMembers.map(member => (
                                        <div key={member.id} style={styles.memberRow}>
                                            <div style={styles.memberInfo}>
                                                <Avatar name={member.name} id={member.id} size={36} />
                                                <div style={styles.memberDetails}>
                                                    <div style={styles.memberName}>{member.name}</div>
                                                    <div style={styles.memberRole}>{member.role}</div>
                                                </div>
                                            </div>
                                            <div style={styles.memberStats}>
                                                <div style={styles.statBadge} data-type="info">
                                                    {member.active_tasks} tasks
                                                </div>
                                                <div style={styles.statBadge} data-type="info">
                                                    {member.total_points} pts
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
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
    header: {
        marginBottom: '32px',
    },
    title: {
        fontSize: '32px',
        fontWeight: '700',
        color: '#0f172a',
        margin: '0 0 8px 0',
    },
    subtitle: {
        fontSize: '16px',
        color: '#64748b',
        margin: 0,
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        marginBottom: '32px',
    },
    statCard: {
        background: '#fff',
        borderRadius: '16px',
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    },
    statIcon: {
        width: '56px',
        height: '56px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statContent: {
        flex: 1,
    },
    statValue: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: '4px',
    },
    statLabel: {
        fontSize: '13px',
        color: '#64748b',
        fontWeight: '500',
    },
    chartCard: {
        background: '#fff',
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '32px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0',
    },
    chartTitle: {
        fontSize: '20px',
        fontWeight: '700',
        color: '#0f172a',
        margin: '0 0 4px 0',
    },
    chartSubtitle: {
        fontSize: '14px',
        color: '#64748b',
        margin: '0 0 24px 0',
    },
    graphWrapper: {
        minHeight: '300px',
    },
    listsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '24px',
        marginBottom: '32px',
    },
    listCard: {
        background: '#fff',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0',
    },
    listHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px',
        paddingBottom: '16px',
        borderBottom: '2px solid #f1f5f9',
    },
    listTitle: {
        fontSize: '18px',
        fontWeight: '700',
        color: '#0f172a',
        margin: 0,
    },
    listContent: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    memberRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px',
        borderRadius: '12px',
        background: '#f8fafc',
        transition: 'background 0.2s ease',
    },
    memberInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    memberDetails: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    memberName: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#0f172a',
    },
    memberRole: {
        fontSize: '12px',
        color: '#64748b',
    },
    memberStats: {
        display: 'flex',
        gap: '8px',
    },
    statBadge: {
        padding: '4px 12px',
        borderRadius: '8px',
        fontSize: '12px',
        fontWeight: '600',
    },
    infoNote: {
        background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)',
        border: '1px solid #93c5fd',
        borderRadius: '12px',
        padding: '16px 20px',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
    },
    infoIcon: {
        fontSize: '20px',
        flexShrink: 0,
    },
    infoText: {
        fontSize: '14px',
        color: '#1e40af',
        lineHeight: '1.6',
    },
    errorContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 200px)',
        gap: '16px',
        textAlign: 'center',
    },
    errorTitle: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#0f172a',
        margin: 0,
    },
    errorText: {
        fontSize: '16px',
        color: '#64748b',
        margin: '0 0 24px 0',
        maxWidth: '500px',
    },
    loginButton: {
        padding: '12px 32px',
        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
        color: '#fff',
        border: 'none',
        borderRadius: '12px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
    },
};

// Add CSS for dynamic colors and animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    [data-color="blue"] {
        background: linear-gradient(135deg, #dbeafe, #bfdbfe);
        color: #3b82f6;
    }

    [data-color="red"] {
        background: linear-gradient(135deg, #fee2e2, #fecaca);
        color: #ef4444;
    }

    [data-color="green"] {
        background: linear-gradient(135deg, #d1fae5, #a7f3d0);
        color: #10b981;
    }

    [data-color="orange"] {
        background: linear-gradient(135deg, #fed7aa, #fbbf24);
        color: #f59e0b;
    }

    [data-type="danger"] {
        background: #fee2e2;
        color: #dc2626;
    }

    [data-type="warning"] {
        background: #fef3c7;
        color: #d97706;
    }

    [data-type="info"] {
        background: #e0e7ff;
        color: #4f46e5;
    }

    div[style*="memberRow"]:hover {
        background: #f1f5f9 !important;
    }

    div[style*="statCard"]:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
    }

    button[style*="backBtn"]:hover {
        color: #3b82f6 !important;
    }
`;
document.head.appendChild(styleSheet);

export default Reports;
