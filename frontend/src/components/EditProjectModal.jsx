import React, { useState, useEffect } from "react";
import { updateProject } from "../api/projects";

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

const EditProjectModal = ({ isOpen, onClose, project, onProjectUpdated }) => {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        end_date: "",
        status: "",
        color: ""
    });
    const [projectDoc, setProjectDoc] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showColors, setShowColors] = useState(false);

    useEffect(() => {
        if (project) {
            setFormData({
                name: project.name || "",
                description: project.description || "",
                end_date: project.end_date ? project.end_date.split("T")[0] : "",
                status: project.status || "active",
                color: project.color || "#4F7DFF"
            });
        }
    }, [project]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setProjectDoc(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append("name", formData.name);
        data.append("description", formData.description);
        data.append("end_date", formData.end_date);
        data.append("status", formData.status);
        data.append("color", formData.color);
        if (projectDoc) {
            data.append("document", projectDoc);
        }

        try {
            await updateProject(project.id, data);
            if (onProjectUpdated) onProjectUpdated();
            onClose();
        } catch (err) {
            console.error("Failed to update project:", err);
            alert(err.response?.data?.message || "Failed to update project");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
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
                            <div style={styles.colorRow}>
                                <div
                                    style={{ ...styles.colorPreview, background: formData.color }}
                                    onClick={() => setShowColors(!showColors)}
                                />
                                {showColors && (
                                    <div style={styles.colorDropdown}>
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
                                <span style={{ fontSize: 12, color: "#64748b" }}>Click box to change color</span>
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
                        <div style={{ ...styles.field, flex: 1 }}>
                            <label style={styles.label}>End Date</label>
                            <input
                                type="date"
                                style={styles.input}
                                name="end_date"
                                value={formData.end_date}
                                onChange={handleChange}
                            />
                        </div>
                        <div style={{ ...styles.field, flex: 1 }}>
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
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>Update Document (PRD)</label>
                        <input type="file" onChange={handleFileChange} style={styles.input} />
                    </div>

                    <div style={styles.footer}>
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
    cancelBtn: { padding: "8px 16px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff" },
    saveBtn: { padding: "8px 20px", borderRadius: 8, border: "none", background: "#c62828", color: "#fff", fontWeight: 600 },
    colorRow: { display: "flex", alignItems: "center", gap: 12, position: "relative" },
    colorPreview: { width: 32, height: 32, borderRadius: 8, border: "1px solid #e2e8f0", cursor: "pointer" },
    colorDropdown: { position: "absolute", bottom: "100%", right: 0, marginBottom: 8, background: "#fff", border: "1px solid #f1f5f9", borderRadius: 12, padding: 10, display: "grid", gridTemplateColumns: "repeat(4, 28px)", gap: 10, zIndex: 10, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" },
    colorCell: { width: 28, height: 28, borderRadius: 6, cursor: "pointer" },
};

export default EditProjectModal;
