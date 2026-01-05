import React, { useState } from "react";
import toast from "react-hot-toast";
import { createModule } from "../api/modules";

const AddModuleModal = ({ isOpen, onClose, projectId, onModuleAdded }) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return toast.error("Module name is required");

        setLoading(true);
        try {
            await createModule({
                project_id: projectId,
                name: name.trim(),
                description: description.trim()
            });
            setName("");
            setDescription("");
            if (onModuleAdded) onModuleAdded();
            onClose();
        } catch (err) {
            console.error("Failed to create module:", err);
            toast.error(err.response?.data?.message || "Failed to create module");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <div style={styles.header}>
                    <h3 style={styles.title}>Add New Module</h3>
                    <button onClick={onClose} style={styles.closeBtn}>✕</button>
                </div>

                <form onSubmit={handleSubmit} style={styles.body}>
                    <div style={styles.field}>
                        <label style={styles.label}>Module Name</label>
                        <input
                            style={styles.input}
                            placeholder="e.g. Authentication"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>Description</label>
                        <textarea
                            style={{ ...styles.input, minHeight: 80, resize: "none" }}
                            placeholder="What this module handles..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div style={styles.footer}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={styles.cancelBtn}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            style={styles.createBtn}
                            disabled={loading}
                        >
                            {loading ? "Creating..." : "Create Module"}
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
        width: 440,
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
        display: "flex",
        flexDirection: "column",
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
    closeBtn: { border: "none", background: "none", fontSize: 18, cursor: "pointer", color: "#64748b" },
    body: { padding: 20 },
    field: { display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 },
    label: { fontSize: 14, fontWeight: 600, color: "#475569" },
    input: {
        padding: "10px 12px",
        borderRadius: 8,
        border: "1px solid #e2e8f0",
        fontSize: 14,
        color: "#1e293b",
        outline: "none",
        transition: "border-color 0.2s",
    },
    footer: {
        paddingTop: 8,
        display: "flex",
        justifyContent: "flex-end",
        gap: 12,
    },
    cancelBtn: {
        padding: "8px 16px",
        borderRadius: 8,
        border: "1px solid #e2e8f0",
        background: "#fff",
        color: "#64748b",
        fontWeight: 600,
        cursor: "pointer",
    },
    createBtn: {
        padding: "8px 20px",
        borderRadius: 8,
        border: "none",
        background: "#c62828",
        color: "#fff",
        fontWeight: 600,
        cursor: "pointer",
        boxShadow: "0 4px 6px -1px rgba(198, 40, 40, 0.2)",
    },
};

export default AddModuleModal;
