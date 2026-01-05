import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { updateSprint, deleteSprint } from "../api/sprints";
import { Plus, Trash2, X } from "lucide-react";
import DatePicker from "./DatePicker";

export default function EditSprintModal({ isOpen, onClose, sprint, onSprintUpdated, onSprintDeleted }) {
    /* -------- STATE -------- */
    const [formData, setFormData] = useState({
        name: "",
        start_date: "",
        end_date: "",
        status: "",
    });
    const [goals, setGoals] = useState([{ text: "" }]);
    const [loading, setLoading] = useState(false);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [errors, setErrors] = useState({});

    /* -------- EFFECT -------- */
    useEffect(() => {
        if (sprint) {
            setFormData({
                name: sprint.name || "",
                start_date: sprint.start_date ? sprint.start_date.split("T")[0] : "",
                end_date: sprint.end_date ? sprint.end_date.split("T")[0] : "",
                status: sprint.status || "active",
            });
            // Handle goals (newline separated string to array or JSON)
            if (sprint.goal) {
                try {
                    const parsed = JSON.parse(sprint.goal);
                    if (Array.isArray(parsed)) {
                        setGoals(parsed.map(g => typeof g === 'string' ? { text: g } : { text: g.text }));
                    } else {
                        setGoals([{ text: sprint.goal }]);
                    }
                } catch (e) {
                    setGoals(sprint.goal.split("\n").map(g => ({ text: g })));
                }
            } else {
                setGoals([{ text: "" }]);
            }
            setErrors({});
        }
    }, [sprint]);

    if (!isOpen) return null;

    /* -------- HANDLERS -------- */
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const addGoal = () => setGoals([...goals, { text: "" }]);

    const removeGoal = (index) => {
        if (goals.length > 1) {
            const newGoals = goals.filter((_, i) => i !== index);
            setGoals(newGoals);
        } else {
            setGoals([{ text: "" }]);
        }
    };

    const updateGoal = (index, value) => {
        const newGoals = [...goals];
        newGoals[index] = { text: value };
        setGoals(newGoals);
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = "Sprint name is required";
        if (!formData.start_date) newErrors.startDate = "Start date is required";
        if (!formData.end_date) newErrors.endDate = "End date is required";
        if (goals.every(g => !g.text.trim())) newErrors.goals = "At least one goal is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            const updateData = {
                ...formData,
                goal: JSON.stringify(goals.filter(g => g.text.trim())),
            };

            await updateSprint(sprint.id, updateData);
            if (onSprintUpdated) onSprintUpdated();
            onClose();
        } catch (err) {
            console.error("Failed to update sprint", err);
            toast.error("Failed to update sprint");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => setShowConfirmDelete(true);

    const confirmDelete = async () => {
        setLoading(true);
        try {
            await deleteSprint(sprint.id);
            if (onSprintDeleted) onSprintDeleted();
            else if (onSprintUpdated) onSprintUpdated();
            onClose();
        } catch (err) {
            console.error("Failed to delete sprint", err);
            toast.error("Failed to delete sprint");
        } finally {
            setLoading(false);
            setShowConfirmDelete(false);
        }
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                {/* CONFIRM DELETE OVERLAY */}
                {showConfirmDelete && (
                    <div style={styles.confirmOverlay}>
                        <div style={styles.confirmBox}>
                            <h4 style={styles.confirmTitle}>Are you sure you want to delete this?</h4>
                            <p style={styles.confirmText}>
                                This will permanently delete this sprint and its associated data. This action cannot be undone.
                            </p>
                            <div style={styles.confirmActions}>
                                <button
                                    onClick={() => setShowConfirmDelete(false)}
                                    style={styles.cancelBtn}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    style={styles.confirmDeleteBtn}
                                    disabled={loading}
                                >
                                    {loading ? "Deleting..." : "Delete"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div style={styles.header}>
                    <h3 style={styles.title}>Edit Sprint</h3>
                    <button onClick={onClose} style={styles.closeBtn}><X size={20} /></button>
                </div>

                <form onSubmit={handleSave} style={styles.body} className="hide-scrollbar">
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Sprint Name <span style={styles.required}>*</span></label>
                        <input
                            style={{ ...styles.input, borderColor: errors.name ? "#ef4444" : "#e2e8f0" }}
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                        {errors.name && <div style={styles.errorMsg}>{errors.name}</div>}
                    </div>

                    <div style={styles.row}>
                        <DatePicker
                            label="Start Date"
                            required
                            name="start_date"
                            value={formData.start_date}
                            onChange={(e) => {
                                handleChange(e);
                                if (errors.startDate) setErrors(prev => ({ ...prev, startDate: null }));
                            }}
                        />
                        <DatePicker
                            label="End Date"
                            required
                            name="end_date"
                            value={formData.end_date}
                            onChange={(e) => {
                                handleChange(e);
                                if (errors.endDate) setErrors(prev => ({ ...prev, endDate: null }));
                            }}
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Status</label>
                        <select
                            style={styles.input}
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                        >
                            <option value="active">Active</option>
                            <option value="on_hold">On Hold</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>

                    <div style={styles.formGroup}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                            <label style={styles.label}>Sprint Goals <span style={styles.required}>*</span></label>
                            <button
                                type="button"
                                onClick={addGoal}
                                style={styles.addGoalIconButton}
                                title="Add Goal"
                            >
                                <Plus size={18} color="#c62828" />
                            </button>
                        </div>
                        <div style={styles.goalsList} className="hide-scrollbar">
                            {goals.map((g, i) => (
                                <div key={i} style={styles.goalRow}>
                                    <div style={styles.goalInputStack}>
                                        <input
                                            style={{ ...styles.input, marginBottom: 0 }}
                                            placeholder={`Goal ${i + 1}`}
                                            value={g.text}
                                            onChange={e => {
                                                updateGoal(i, e.target.value);
                                                if (errors.goals) setErrors(prev => ({ ...prev, goals: null }));
                                            }}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeGoal(i)}
                                        style={styles.actionBtn}
                                        title="Remove Goal"
                                    >
                                        <Trash2 size={16} color="#ef4444" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        {errors.goals && <div style={styles.errorMsg}>{errors.goals}</div>}
                    </div>

                    <div style={styles.footer}>
                        <button
                            type="button"
                            onClick={handleDelete}
                            style={styles.deleteBtn}
                            title="Delete Sprint"
                            disabled={loading}
                        >
                            <Trash2 size={20} color="#ef4444" />
                        </button>
                        <div style={{ flex: 1 }} />
                        <button type="button" onClick={onClose} style={styles.cancelBtn}>Cancel</button>
                        <button type="submit" style={styles.saveBtn} disabled={loading}>
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const styles = {
    overlay: {
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.4)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2000,
        backdropFilter: "blur(4px)",
    },
    modal: {
        width: 500,
        background: "#fff",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    },
    header: {
        padding: "16px 20px",
        borderBottom: "1px solid #f1f5f9",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    title: { fontSize: 18, fontWeight: 700, color: "#1e293b", margin: 0 },
    closeBtn: { border: "none", background: "none", cursor: "pointer", color: "#64748b" },
    body: { padding: 20, overflowY: "auto", maxHeight: "calc(90vh - 120px)" },
    formGroup: { marginBottom: 16 },
    label: { display: "block", fontSize: 14, fontWeight: 600, color: "#475569", marginBottom: 6 },
    required: { color: "#ef4444", marginLeft: 2 },
    input: {
        width: "100%",
        padding: "10px 12px",
        borderRadius: 8,
        border: "1px solid #e2e8f0",
        fontSize: 14,
        outline: "none",
        fontFamily: "inherit",
        boxSizing: "border-box",
    },
    row: { display: "flex", gap: 12, marginBottom: 16 },
    errorMsg: { fontSize: 12, color: "#ef4444", marginTop: 4 },
    footer: { display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 },
    cancelBtn: { padding: "10px 16px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontWeight: 600, color: "#64748b" },
    saveBtn: { padding: "10px 20px", borderRadius: 8, border: "none", background: "#c62828", color: "#fff", fontWeight: 600, cursor: "pointer" },
    deleteBtn: {
        background: "none",
        border: "1px solid #fee2e2",
        padding: "8px",
        borderRadius: 8,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.2s",
        "&:hover": { background: "#fee2e2" }
    },
    addGoalIconButton: {
        background: "none",
        border: "none",
        padding: 4,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    goalsList: {
        display: "flex",
        flexDirection: "column",
        gap: 12,
        maxHeight: 250,
        overflowY: "auto",
        paddingRight: 4,
    },
    goalRow: { display: "flex", gap: 8, alignItems: "flex-start" },
    goalInputStack: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 6
    },
    progressRow: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "0 4px"
    },
    rangeInput: {
        flex: 1,
        height: 6,
        borderRadius: 3,
        appearance: "none",
        background: "#e2e8f0",
        outline: "none",
        accentColor: "#c62828",
    },
    progressLabel: {
        fontSize: 12,
        fontWeight: 600,
        color: "#64748b",
        minWidth: 35,
        textAlign: "right"
    },
    actionBtn: {
        background: "none",
        border: "1px solid #fee2e2",
        padding: "8px",
        borderRadius: 8,
        cursor: "pointer",
        margin: "auto 0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.2s",
        flexShrink: 0,
        "&:hover": { background: "#fee2e2" }
    },
    confirmOverlay: {
        position: "absolute",
        inset: 0,
        background: "rgba(15, 23, 42, 0.7)",
        backdropFilter: "blur(2px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2100,
        padding: 20,
    },
    confirmBox: {
        background: "#fff",
        borderRadius: 16,
        padding: 24,
        width: "100%",
        maxWidth: 320,
        textAlign: "center",
        boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
    },
    confirmTitle: { fontSize: 16, fontWeight: 700, color: "#1e293b", margin: "0 0 12px 0" },
    confirmText: { fontSize: 13, color: "#64748b", margin: "0 0 24px 0", lineHeight: 1.5 },
    confirmActions: { display: "flex", gap: 12, justifyContent: "center" },
    confirmDeleteBtn: {
        padding: "8px 24px",
        borderRadius: 8,
        border: "none",
        background: "#ef4444",
        color: "#fff",
        fontWeight: 600,
        cursor: "pointer",
        fontSize: 14,
    },
};
