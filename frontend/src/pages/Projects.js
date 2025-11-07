import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Card from "../components/Card";

const Projects = ({ role = "Project Manager" }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const projects = [
    { id: 1, name: "Website Revamp", status: "Active", progress: 70 },
    { id: 2, name: "Mobile App UI", status: "Active", progress: 45 },
    { id: 3, name: "Client Onboarding", status: "On Hold", progress: 20 },
    { id: 4, name: "Automation System", status: "Completed", progress: 100 },
    { id: 5, name: "Security Upgrade", status: "Active", progress: 55 },
    { id: 6, name: "Legacy Migration", status: "On Hold", progress: 30 },
    { id: 7, name: "Marketing Dashboard", status: "Completed", progress: 100 },
  ];

  const filterByStatus = (status) =>
    projects.filter((project) => project.status === status);

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
              {filterByStatus("Active").map((p) => (
                <div key={p.id} style={styles.cardWrapper}>
                  <Card>
                    <div style={styles.cardHeader}>
                      <h4 style={styles.projectTitle}>{p.name}</h4>
                      <span style={{ ...styles.badge, ...styles.activeBadge }}>
                        Active
                      </span>
                    </div>
                    <div style={styles.progressOuter}>
                      <div
                        style={{
                          ...styles.progressInner,
                          width: `${p.progress}%`,
                        }}
                      />
                    </div>
                    <p style={styles.progressText}>{p.progress}% complete</p>
                  </Card>
                </div>
              ))}
            </div>
          </section>

          {/* === On Hold === */}
          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>On Hold</h3>
            <div style={styles.cardGrid}>
              {filterByStatus("On Hold").map((p) => (
                <div key={p.id} style={styles.cardWrapper}>
                  <Card>
                    <div style={styles.cardHeader}>
                      <h4 style={styles.projectTitle}>{p.name}</h4>
                      <span style={{ ...styles.badge, ...styles.holdBadge }}>
                        On Hold
                      </span>
                    </div>
                    <div style={styles.progressOuter}>
                      <div
                        style={{
                          ...styles.progressInner,
                          backgroundColor: "#fbc02d",
                          width: `${p.progress}%`,
                        }}
                      />
                    </div>
                    <p style={styles.progressText}>{p.progress}% complete</p>
                  </Card>
                </div>
              ))}
            </div>
          </section>

          {/* === Completed === */}
          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>Completed</h3>
            <div style={styles.cardGrid}>
              {filterByStatus("Completed").map((p) => (
                <div key={p.id} style={styles.cardWrapper}>
                  <Card>
                    <div style={styles.cardHeader}>
                      <h4 style={styles.projectTitle}>{p.name}</h4>
                      <span
                        style={{ ...styles.badge, ...styles.completedBadge }}
                      >
                        Completed
                      </span>
                    </div>
                    <div style={styles.progressOuter}>
                      <div
                        style={{
                          ...styles.progressInner,
                          backgroundColor: "#2e7d32",
                          width: `${p.progress}%`,
                        }}
                      />
                    </div>
                    <p style={styles.progressText}>100% complete</p>
                  </Card>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* === Floating Buttons (Bottom-Right) === */}
        <div style={styles.fabContainer}>
          <button style={styles.addBtn} onClick={() => setShowAddModal(true)}>
            + Add Project
          </button>
          <button
            style={styles.updateBtn}
            onClick={() => setShowUpdateModal(true)}
          >
            ✎ Update Project
          </button>
        </div>

        {/* === Add Project Modal === */}
        {showAddModal && (
          <Modal title="Add Project" onClose={() => setShowAddModal(false)}>
            <form style={styles.form}>
              <label>Project Name</label>
              <input type="text" required />
              <label>Description</label>
              <textarea required />
              <label>Start Date</label>
              <input type="date" required />
              <label>End Date (optional)</label>
              <input type="date" />
              <label>Status</label>
              <select required>
                <option>Active</option>
                <option>On Hold</option>
                <option>Completed</option>
              </select>
              <label>Document</label>
              <input type="file" />
              <button type="submit" style={styles.submitBtn}>
                Add Project
              </button>
            </form>
          </Modal>
        )}

        {/* === Update Project Modal === */}
        {showUpdateModal && (
          <Modal title="Update Project" onClose={() => setShowUpdateModal(false)}>
            <form style={styles.form}>
              <label>Project Name</label>
              <input type="text" required />
              <label>Description</label>
              <textarea required />
              <label>End Date</label>
              <input type="date" required />
              <label>Status</label>
              <select required>
                <option>Active</option>
                <option>On Hold</option>
                <option>Completed</option>
              </select>
              <label>Document</label>
              <input type="file" />
              <button type="submit" style={styles.submitBtn}>
                Update Project
              </button>
            </form>
          </Modal>
        )}
      </div>
    </div>
  );
};

// === Modal Component ===
const Modal = ({ title, children, onClose }) => (
  <div style={styles.modalOverlay}>
    <div style={styles.modal}>
      <div style={styles.modalHeader}>
        <h3>{title}</h3>
        <button onClick={onClose} style={styles.closeBtn}>
          ×
        </button>
      </div>
      {children}
    </div>
  </div>
);

// === Styles ===
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

  // === Floating Buttons ===
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
  updateBtn: {
    backgroundColor: "#2e7d32",
    color: "#fff",
    padding: "12px 18px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "500",
  },

  // === Modal Styles ===
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
    width: "400px",
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
