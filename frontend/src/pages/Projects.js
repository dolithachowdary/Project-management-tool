import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Card from "../components/Card";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const Projects = ({ role = "Project Manager" }) => {
  const navigate = useNavigate();

  const [projects, setProjects] = useState({
    Active: [
      { id: "1", name: "TourO Web Development", progress: 70 },
      { id: "2", name: "Dashboard Portal", progress: 45 },
      { id: "5", name: "Designing", progress: 55 },
    ],
    "On Hold": [
      { id: "3", name: "Client Onboarding", progress: 20 },
      { id: "6", name: "Legacy Migration", progress: 30 },
    ],
    Completed: [
      { id: "4", name: "Automation System", progress: 100 },
      { id: "7", name: "Marketing Dashboard", progress: 100 },
    ],
  });

  const onDragEnd = ({ source, destination }) => {
    if (!destination) return;

    const from = source.droppableId;
    const to = destination.droppableId;

    const sourceItems = Array.from(projects[from]);
    const destItems = Array.from(projects[to]);

    const [moved] = sourceItems.splice(source.index, 1);

    if (from === to) {
      sourceItems.splice(destination.index, 0, moved);
      setProjects({ ...projects, [from]: sourceItems });
    } else {
      destItems.splice(destination.index, 0, moved);
      setProjects({
        ...projects,
        [from]: sourceItems,
        [to]: destItems,
      });
    }
  };

  return (
    <div style={styles.pageContainer}>
      <Sidebar />
      <div style={styles.mainContent}>
        <Header role={role} />

        <div style={styles.pageInner}>
          <h2 style={styles.pageTitle}>Projects</h2>

          <DragDropContext onDragEnd={onDragEnd}>
            {Object.keys(projects).map((status) => (
              <Droppable droppableId={status} key={status}>
                {(provided) => (
                  <section
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={styles.section}
                  >
                    <h3 style={styles.sectionTitle}>{status} Projects</h3>

                    <div style={styles.cardGrid}>
                      {projects[status].map((p, index) => (
                        <Draggable
                          draggableId={p.id}
                          index={index}
                          key={p.id}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                ...styles.cardWrapper,
                                ...provided.draggableProps.style,
                              }}
                            >
                              <Card>
                                <div
                                  style={{ cursor: "pointer" }}
                                  onClick={() =>
                                    navigate(`/projects/${p.id}`)
                                  }
                                >
                                  <div style={styles.cardHeader}>
                                    <h4 style={styles.projectTitle}>
                                      {p.name}
                                    </h4>
                                    <span
                                      style={{
                                        ...styles.badge,
                                        ...(status === "Active"
                                          ? styles.activeBadge
                                          : status === "On Hold"
                                          ? styles.holdBadge
                                          : styles.completedBadge),
                                      }}
                                    >
                                      {status}
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

                                  <p style={styles.progressText}>
                                    {p.progress}% complete
                                  </p>
                                </div>
                              </Card>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </section>
                )}
              </Droppable>
            ))}
          </DragDropContext>
        </div>
      </div>
    </div>
  );
};

/* ================= STYLES ================= */
const styles = {
  pageContainer: { display: "flex", height: "100vh", background: "#f9f9f9" },
  mainContent: { flex: 1, overflowY: "auto" },
  pageInner: { padding: 30 },
  pageTitle: { fontSize: "1.5rem", marginBottom: 25 },

  section: { marginBottom: 40 },
  sectionTitle: { marginBottom: 15, fontWeight: 600 },

  /* SAME GRID AS BEFORE */
  cardGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 20,
  },

  /* CRITICAL: keeps card size identical */
  cardWrapper: {
    flex: "1 1 300px",
    maxWidth: 340,
    minWidth: 280,
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
  },
  projectTitle: { fontSize: "1rem", fontWeight: 600 },

  badge: {
    padding: "4px 10px",
    borderRadius: 5,
    fontSize: 12,
    color: "#fff",
  },
  activeBadge: { background: "#c62828" },
  holdBadge: { background: "#fbc02d", color: "#222" },
  completedBadge: { background: "#2e7d32" },

  progressOuter: {
    background: "#eee",
    borderRadius: 5,
    height: 8,
    marginTop: 10,
  },
  progressInner: {
    height: 8,
    borderRadius: 5,
    background: "#c62828",
  },
  progressText: { fontSize: "0.85rem", marginTop: 6 },
};

export default Projects;
