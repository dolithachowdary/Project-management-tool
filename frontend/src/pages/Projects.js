// src/pages/Projects.js
import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Card from "../components/Card";
import { ProjectsAPI } from "../lib/projects";

const Projects = ({ role = "Project Manager" }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // form state for create — default status is lowercase (backend-safe)
  const [form, setForm] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    status: "active", // backend expects lowercase values
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await ProjectsAPI.list();
      // API might return { data: [...] } or an array directly; handle both
      const list = Array.isArray(data) ? data : data.data || data.projects || [];
      setProjects(list);
    } catch (err) {
      console.error("Failed to load projects", err);
      alert("Failed to load projects. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!form.name || !form.start_date) {
      alert("Please provide at least a project name and start date.");
      return;
    }

    try {
      // payload uses form.status which is already lowercase
      const payload = {
        name: form.name,
        description: form.description,
        start_date: form.start_date,
        end_date: form.end_date || null,
        status: form.status, // already lowercase ('active'|'on hold'|'completed')
      };

      await ProjectsAPI.create(payload);

      setShowAddModal(false);
      setForm({
        name: "",
        description: "",
        start_date: "",
        end_date: "",
        status: "active",
      });

      await loadProjects();
    } catch (err) {
      console.error("Create project failed", err);
      // show backend error message if available
      const msg = err?.response?.data?.message || err?.message || "Create project failed";
      alert(msg);
    }
  };

  // Normalizes status for comparison (backend stores lowercase)
  const filterByStatus = (statusReadable) => {
    // Accept both readable "Active" and lowercase "active"
    const normalized = (statusReadable || "").toString().toLowerCase();
    return projects.filter((project) => (project.status || "").toString().toLowerCase() === normalized);
  };

  if (loading) {
    return (
      <div style={{ display: "flex" }}>
        <Sidebar />
        <div style={{ flex: 1 }}>
          <Header role={role} />
          <div style={{ padding: 24 }}>Loading projects...</div>
        </div>
      </div>
    );
  }

  // helper to pretty-print status in the UI (capitalize words)
  const pretty = (s) =>
    (s || "")
      .toString()
      .split(" ")
      .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
      .join(" ");

  return (
    <div style={styles.pageContainer}>
      <Sidebar />
      <div style={styles.mainContent}>
        <Header role={role} />

        <div style={styles.pageInner}>
          <h2 style={styles.pageTitle}>Projects</h2>

          {/* === Active Projects === */}
          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>Active Projects</h3>
            <div style={styles.cardGrid}>
              {filterByStatus("active").map((p) => (
                <div key={p.id || p._id} style={styles.cardWrapper}>
                  <Card>
                    <div style={styles.cardHeader}>
                      <h4 style={styles.projectTitle}>{p.name}</h4>
                      <span style={{ ...styles.badge, ...styles.activeBadge }}>
                        {pretty(p.status || "active")}
                      </span>
                    </div>
                    <div style={styles.progressOuter}>
                      <div
                        style={{
                          ...styles.progressInner,
                          width: `${p.progress || 0}%`,
                        }}
                      />
                    </div>
                    <p style={styles.progressText}>{p.progress ?? 0}% complete</p>
                  </Card>
                </div>
              ))}
              {filterByStatus("active").length === 0 && <div>No active projects</div>}
            </div>
          </section>

          {/* === On Hold === */}
          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>On Hold</h3>
            <div style={styles.cardGrid}>
              {filterByStatus("on hold").map((p) => (
                <div key={p.id || p._id} style={styles.cardWrapper}>
                  <Card>
                    <div style={styles.cardHeader}>
                      <h4 style={styles.projectTitle}>{p.name}</h4>
                      <span style={{ ...styles.badge, ...styles.holdBadge }}>
                        {pretty(p.status || "on hold")}
                      </span>
                    </div>
                    <div style={styles.progressOuter}>
                      <div
                        style={{
                          ...styles.progressInner,
                          backgroundColor: "#fbc02d",
                          width: `${p.progress || 0}%`,
                        }}
                      />
                    </div>
                    <p style={styles.progressText}>{p.progress ?? 0}% complete</p>
                  </Card>
                </div>
              ))}
              {filterByStatus("on hold").length === 0 && <div>No on-hold projects</div>}
            </div>
          </section>

          {/* === Completed === */}
          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>Completed</h3>
            <div style={styles.cardGrid}>
              {filterByStatus("completed").map((p) => (
                <div key={p.id || p._id} style={styles.cardWrapper}>
                  <Card>
                    <div style={styles.cardHeader}>
                      <h4 style={styles.projectTitle}>{p.name}</h4>
                      <span style={{ ...styles.badge, ...styles.completedBadge }}>
                        {pretty(p.status || "completed")}
                      </span>
                    </div>
                    <div style={styles.progressOuter}>
                      <div
                        style={{
                          ...styles.progressInner,
                          backgroundColor: "#2e7d32",
                          width: `${p.progress ?? 100}%`,
                        }}
                      />
                    </div>
                    <p style={styles.progressText}>{p.progress ?? 100}% complete</p>
                  </Card>
                </div>
              ))}
              {filterByStatus("completed").length === 0 && <div>No completed projects</div>}
            </div>
          </section>
        </div>

        {/* Floating Buttons */}
        <div style={styles.fabContainer}>
          <button style={styles.addBtn} onClick={() => setShowAddModal(true)}>
            + Add Project
          </button>
        </div>

        {/* Add Project Modal */}
        {showAddModal && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <div style={styles.modalHeader}>
                <h3>Add Project</h3>
                <button onClick={() => setShowAddModal(false)} style={styles.closeBtn}>×</button>
              </div>
              <form onSubmit={handleCreate} style={styles.form}>
                <label>Project Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                />
                <label>Description</label>
                <textarea
                  required
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                />
                <label>Start Date</label>
                <input
                  type="date"
                  required
                  value={form.start_date}
                  onChange={(e) => setForm((p) => ({ ...p, start_date: e.target.value }))}
                />
                <label>End Date (optional)</label>
                <input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm((p) => ({ ...p, end_date: e.target.value }))}
                />
                <label>Status</label>
                <select
                  required
                  value={form.status}
                  onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                >
                  {/* note: value attributes are lowercase (backend-safe) while the labels are friendly */}
                  <option value="active">Active</option>
                  <option value="on hold">On Hold</option>
                  <option value="completed">Completed</option>
                </select>
                <button type="submit" style={styles.submitBtn}>Add Project</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  pageContainer: {
    display: "flex",
    backgroundColor: "#f9f9f9",
    height: "100vh",
    overflow: "hidden",
  },
  mainContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
    position: "relative",
  },
  pageInner: {
    padding: "30px",
    backgroundColor: "#f9f9f9",
    boxSizing: "border-box",
  },
  pageTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#222",
    marginBottom: "25px",
  },
  section: { marginBottom: "40px" },
  sectionTitle: {
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#222",
    marginBottom: "15px",
  },
  cardGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
    justifyContent: "flex-start",
  },
  cardWrapper: {
    flex: "1 1 300px",
    minWidth: "280px",
    maxWidth: "340px",
    display: "flex",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  projectTitle: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#222",
  },
  badge: {
    padding: "4px 10px",
    borderRadius: "5px",
    color: "#fff",
    fontSize: "12px",
    fontWeight: "500",
  },
  activeBadge: { backgroundColor: "#c62828" },
  holdBadge: { backgroundColor: "#fbc02d", color: "#222" },
  completedBadge: { backgroundColor: "#2e7d32" },
  progressOuter: {
    backgroundColor: "#eee",
    borderRadius: "5px",
    height: "8px",
    overflow: "hidden",
  },
  progressInner: {
    height: "8px",
    backgroundColor: "#c62828",
    borderRadius: "5px",
    transition: "width 0.3s ease",
  },
  progressText: {
    marginTop: "8px",
    fontSize: "0.85rem",
    color: "#555",
  },
  fabContainer: {
    position: "fixed",
    bottom: "30px",
    right: "30px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  addBtn: {
    backgroundColor: "#c62828",
    color: "#fff",
    padding: "12px 18px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "500",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    background: "#fff",
    borderRadius: "10px",
    padding: "25px",
    width: "480px",
    maxHeight: "80vh",
    overflowY: "auto",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "22px",
    cursor: "pointer",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  submitBtn: {
    marginTop: "10px",
    backgroundColor: "#c62828",
    color: "#fff",
    padding: "10px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default Projects;
