import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getProjects, getProjectMembers } from "../api/projects";
import { getSupervisors } from "../api/users";
import { generatePreview } from "../api/timesheets";
import { Calendar, Users, Briefcase, ChevronRight } from "lucide-react";

export default function TimesheetGenerator({ onPreview }) {
    const [projects, setProjects] = useState([]);
    const [members, setMembers] = useState([]);
    const [supervisors, setSupervisors] = useState([]);

    const [selectedProjectId, setSelectedProjectId] = useState("");
    const [selectedMemberId, setSelectedMemberId] = useState("");
    const [selectedSupervisorId, setSelectedSupervisorId] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (selectedProjectId) {
            loadMembers(selectedProjectId);
        } else {
            setMembers([]);
        }
    }, [selectedProjectId]);

    const loadInitialData = async () => {
        try {
            const [projRes, superRes] = await Promise.all([
                getProjects(),
                getSupervisors()
            ]);
            setProjects(projRes.data?.data || projRes.data || []);
            setSupervisors(superRes.data?.data || superRes.data || []);
        } catch (err) {
            console.error("Failed to load initial data", err);
        }
    };

    const loadMembers = async (pid) => {
        try {
            const res = await getProjectMembers(pid);
            setMembers(res.data?.data || res.data || []);
        } catch (err) {
            console.error("Failed to load members", err);
        }
    };

    const handleGenerate = async () => {
        if (!selectedMemberId || !startDate || !endDate) {
            toast.error("Please fill all required fields");
            return;
        }

        try {
            setLoading(true);
            const res = await generatePreview({
                project_id: selectedProjectId,
                user_id: selectedMemberId,
                start_date: startDate,
                end_date: endDate
            });

            const previewData = res.data?.data || res.data;
            // Add supervisor info for the preview
            const supervisor = supervisors.find(s => s.id === selectedSupervisorId);
            onPreview({ ...previewData, supervisor_id: selectedSupervisorId, supervisor_name: supervisor?.full_name });
        } catch (err) {
            console.error("Failed to generate preview", err);
            toast.error(err.response?.data?.error || "Generation failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.card}>
            <h3 style={styles.cardTitle}>Generate Timesheet</h3>
            <p style={styles.cardSub}>Select parameters to generate a timesheet for an employee.</p>

            <div style={styles.formGrid}>
                <div style={styles.field}>
                    <label style={styles.label}><Briefcase size={14} /> Project</label>
                    <select
                        style={styles.select}
                        value={selectedProjectId}
                        onChange={(e) => setSelectedProjectId(e.target.value)}
                    >
                        <option value="">Select Project</option>
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>

                <div style={styles.field}>
                    <label style={styles.label}><Users size={14} /> Employee</label>
                    <select
                        style={styles.select}
                        value={selectedMemberId}
                        onChange={(e) => setSelectedMemberId(e.target.value)}
                        disabled={!selectedProjectId}
                    >
                        <option value="">Select Employee</option>
                        {members.map(m => (
                            <option key={m.id} value={m.id}>{m.full_name}</option>
                        ))}
                    </select>
                </div>

                <div style={styles.field}>
                    <label style={styles.label}><Users size={14} /> Supervisor</label>
                    <select
                        style={styles.select}
                        value={selectedSupervisorId}
                        onChange={(e) => setSelectedSupervisorId(e.target.value)}
                    >
                        <option value="">Select Supervisor</option>
                        {supervisors.map(s => (
                            <option key={s.id} value={s.id}>{s.full_name}</option>
                        ))}
                    </select>
                </div>

                <div style={styles.field}>
                    <label style={styles.label}><Calendar size={14} /> Start Date</label>
                    <input
                        type="date"
                        style={styles.input}
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>

                <div style={styles.field}>
                    <label style={styles.label}><Calendar size={14} /> End Date</label>
                    <input
                        type="date"
                        style={styles.input}
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
            </div>

            <button
                style={styles.generateBtn}
                onClick={handleGenerate}
                disabled={loading}
            >
                {loading ? "Generating..." : "Generate Preview"} <ChevronRight size={18} />
            </button>
        </div>
    );
}

const styles = {
    card: {
        background: "var(--card-bg)",
        padding: "24px",
        borderRadius: "16px",
        border: "1px solid var(--border-color)",
        boxShadow: "var(--shadow-sm)",
        marginBottom: "32px",
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 700,
        color: "var(--text-primary)",
        margin: 0,
        marginBottom: 8,
    },
    cardSub: {
        fontSize: 14,
        color: "var(--text-secondary)",
        margin: 0,
        marginBottom: 24,
    },
    formGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 20,
        marginBottom: 24,
    },
    field: {
        display: "flex",
        flexDirection: "column",
        gap: 8,
    },
    label: {
        fontSize: 13,
        fontWeight: 600,
        color: "var(--text-secondary)",
        display: "flex",
        alignItems: "center",
        gap: 6,
    },
    select: {
        padding: "10px 12px",
        borderRadius: "8px",
        border: "1px solid var(--border-color)",
        background: "var(--input-bg)",
        fontSize: 14,
        color: "var(--text-primary)",
        outline: "none",
    },
    input: {
        padding: "9px 12px",
        borderRadius: "8px",
        border: "1px solid var(--border-color)",
        background: "var(--input-bg)",
        fontSize: 14,
        color: "var(--text-primary)",
        outline: "none",
    },
    generateBtn: {
        width: "100%",
        padding: "12px",
        background: "var(--accent-color)",
        color: "#fff",
        border: "none",
        borderRadius: "10px",
        fontSize: 15,
        fontWeight: 600,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        transition: "background 0.2s",
    }
};
