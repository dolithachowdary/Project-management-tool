import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { updateProject, deleteProject } from "../api/projects";
import { ChevronDown, Trash2 } from "lucide-react";
import DatePicker from "./DatePicker";

const COLORS = [
    "#9e2a2b",
    "#bf5000",
    "#124559",
    "#3d348b",
    "#AB274F",
    "#E6A817",
    "#AF6E4D",
    "#008080",
    "#3AA8C1",
    "#645394",
    "#C04000",
];

const EditProjectModal = ({ isOpen, onClose, project, onProjectUpdated, onProjectDeleted }) => {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        start_date: "",
        end_date: "",
        status: "",
        color: ""
    });
    const [loading, setLoading] = useState(false);
    const [showColors, setShowColors] = useState(false);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);

    const colorDropdownRef = useRef(null);
    const colorPickerBtnRef = useRef(null);

    useEffect(() => {
        if (project) {
            setFormData({
                name: project.name || "",
                description: project.description || "",
                start_date: project.start_date ? project.start_date.split("T")[0] : "",
                end_date: project.end_date ? project.end_date.split("T")[0] : "",
                status: project.status || "active",
                color: project.color || "#4F7DFF"
            });
        }
    }, [project]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                showColors &&
                colorDropdownRef.current &&
                !colorDropdownRef.current.contains(event.target) &&
                colorPickerBtnRef.current &&
                !colorPickerBtnRef.current.contains(event.target)
            ) {
                setShowColors(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showColors]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };


    const handleDelete = async () => {
        setShowConfirmDelete(true);
    };

    const confirmDelete = async () => {
        setLoading(true);
        try {
            await deleteProject(project.id);
            if (onProjectDeleted) onProjectDeleted();
            else if (onProjectUpdated) onProjectUpdated();
            onClose();
        } catch (err) {
            console.error("Failed to delete project:", err);
            toast.error(err.response?.data?.message || "Failed to delete project");
        } finally {
            setLoading(false);
            setShowConfirmDelete(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append("name", formData.name);
        data.append("description", formData.description);
        data.append("start_date", formData.start_date);
        data.append("end_date", formData.end_date);
        data.append("status", formData.status);
        data.append("color", formData.color);

        try {
            await updateProject(project.id, data);
            if (onProjectUpdated) onProjectUpdated();
            onClose();
        } catch (err) {
            console.error("Failed to update project:", err);
            toast.error(err.response?.data?.message || "Failed to update project");
        } finally {
            setLoading(false);
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
                                This will permanently delete all data related to this project including tasks, modules, and sprints.
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
                    <h3 style={styles.title}>Edit Project</h3>
                    <button onClick={onClose} style={styles.closeBtn}>✕</button>
                </div>

                <form onSubmit={handleSubmit} style={styles.body} className="hide-scrollbar">
                    <div style={styles.row}>
                        <div style={{ ...styles.field, flex: 1, marginBottom: 0 }}>
                            <label style={styles.label}>Project Name</label>
                            <input
                                style={styles.input}
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div style={{ ...styles.field, marginBottom: 0 }}>
                            <label style={styles.label}>Color</label>
                            <div style={styles.colorTriggerWrapper}>
                                <div
                                    ref={colorPickerBtnRef}
                                    style={styles.colorTrigger}
                                    onClick={() => setShowColors(!showColors)}
                                >
                                    <div style={{ ...styles.colorPreview, background: formData.color }} />
                                    <ChevronDown size={14} color="#666" />
                                </div>

                                {showColors && (
                                    <div ref={colorDropdownRef} style={styles.colorDropdown}>
                                        {COLORS.map((c) => (
                                            <div
                                                key={c}
                                                onClick={() => {
                                                    setFormData({ ...formData, color: c });
                                                    setShowColors(false);
                                                }}
                                                style={{ ...styles.colorCell, background: c }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: 16 }} />

                    <div style={styles.field}>
                        <label style={styles.label}>Description</label>
                        <textarea
                            style={{ ...styles.input, minHeight: 80 }}
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </div>

                    <div style={styles.row}>
                        <DatePicker
                            label="Start Date"
                            name="start_date"
                            value={formData.start_date}
                            onChange={handleChange}
                        />
                        <DatePicker
                            label="End Date"
                            name="end_date"
                            value={formData.end_date}
                            onChange={handleChange}
                        />
                    </div>

                    <div style={styles.field}>
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

                    <div style={styles.footer}>
                        <button
                            type="button"
                            onClick={handleDelete}
                            style={styles.deleteBtn}
                            title="Delete Project"
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
};

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
    },
    header: {
        padding: "16px 20px",
        borderBottom: "1px solid #f1f5f9",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    title: { fontSize: 18, fontWeight: 700, color: "#1e293b", margin: 0 },
    closeBtn: { border: "none", background: "none", fontSize: 18, cursor: "pointer" },
    body: { padding: 20, overflowY: "auto", maxHeight: "calc(90vh - 120px)" },
    field: { display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 },
    row: { display: "flex", gap: 12 },
    label: { fontSize: 14, fontWeight: 600, color: "#475569" },
    input: {
        padding: "10px 12px",
        borderRadius: 8,
        border: "1px solid #e2e8f0",
        fontSize: 14,
        outline: "none",
    },
    footer: {
        display: "flex",
        justifyContent: "flex-end",
        gap: 12,
        marginTop: 8,
    },
    cancelBtn: { padding: "8px 16px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontWeight: 600, color: "#64748b" },
    saveBtn: { padding: "8px 20px", borderRadius: 8, border: "none", background: "#c62828", color: "#fff", fontWeight: 600, cursor: "pointer" },
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
    colorTriggerWrapper: { display: "flex", alignItems: "center", gap: 12, position: "relative" },
    colorTrigger: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 12px",
        borderRadius: 8,
        border: "1px solid #e2e8f0",
        cursor: "pointer",
        background: "#fff",
        width: "fit-content",
    },
    colorPreview: { width: 24, height: 24, borderRadius: 6, border: "1px solid #eee" },
    colorDropdown: { position: "absolute", top: "calc(100% + 5px)", right: 0, background: "#fff", border: "1px solid #f1f5f9", borderRadius: 12, padding: 12, display: "grid", gridTemplateColumns: "repeat(4, 28px)", gap: 10, zIndex: 100, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)" },
    colorCell: { width: 28, height: 28, borderRadius: 6, cursor: "pointer", border: "1px solid rgba(0,0,0,0.05)" },

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

export default EditProjectModal;
