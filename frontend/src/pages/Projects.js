import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Card from "../components/Card";
import AddProject from "../components/AddProject";
import { getProjects } from "../api/projects";
import { useNavigate } from "react-router-dom";

export default function Projects() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState({});
  const [open, setOpen] = useState(false);

  const load = async () => {
    const res = await getProjects();

    const grouped = res.data.reduce((acc, p) => {
      const key =
        p.status === "active"
          ? "Active Projects"
          : p.status === "on_hold"
          ? "On Hold Projects"
          : "Completed Projects";

      acc[key] = acc[key] || [];
      acc[key].push({
        id: p.id,
        title: p.name,
        startDate: p.start_date,
        endDate: p.end_date,
        progress: 0,
        members: [],
        timeLeft: p.status.replace("_", " "),
        color: "#d47b4a",
      });
      return acc;
    }, {});

    setGroups(grouped);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar />

      <div style={{ flex: 1, overflowY: "auto" }}>
        <Header />

        <div style={{ padding: 20 }}>
          {Object.entries(groups).map(([section, projects]) => (
            <section key={section} style={{ marginBottom: 25 }}>
              <h3 style={{ marginBottom: 8 }}>{section}</h3>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
                {projects.map((p) => (
                  <div
                    key={p.id}
                    style={{ minWidth: 280, maxWidth: 340, cursor: "pointer" }}
                    onClick={() => navigate(`/projects/${p.id}`)}
                  >
                    <Card {...p} />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <AddProject
        isOpen={open}
        onClose={() => setOpen(false)}
        onCreated={load}
      />

      <button
        onClick={() => setOpen(true)}
        style={{
          position: "fixed",
          right: 24,
          bottom: 24,
          padding: "14px 18px",
          background: "#4F7DFF",
          color: "#fff",
          borderRadius: 999,
          border: "none",
          cursor: "pointer",
        }}
      >
        + Add Project
      </button>
    </div>
  );
}


/* ---------------- STYLES (RESTORED) ---------------- */

const styles = {
  pageContainer: {
    display: "flex",
    height: "100vh",
    background: "#f9f9f9",
  },

  mainContent: {
    flex: 1,
    overflowY: "auto",
  },

  pageInner: {
    padding: 20,
  },

  section: {
    marginBottom: 25,
  },

  sectionTitle: {
    marginBottom: 8,
    fontWeight: 600,
    fontSize: 18,
  },

  cardGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 20,
  },

  cardWrapper: {
    flex: "1 1 300px",
    maxWidth: 340,
    minWidth: 280,
    cursor: "pointer",
  },

  fab: {
    position: "fixed",
    bottom: 24,
    right: 24,
    padding: "14px 18px",
    background: "#4F7DFF",
    color: "#fff",
    border: "none",
    borderRadius: "999px",
    fontSize: 15,
    fontWeight: 500,
    cursor: "pointer",
    boxShadow: "0 6px 18px rgba(0,0,0,0.2)",
    zIndex: 1001,
  },
};
