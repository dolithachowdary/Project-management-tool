import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ProjectCard from "../components/ProjectCard";
import ProjectModal from "../components/ProjectModal";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://192.168.0.111:5000/api/projects", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-section">
        <Header />
        <div className="projects-container">
          <div className="projects-header">
            <h2>Projects</h2>
            <button className="add-btn" onClick={() => setShowModal(true)}>
              + Add Project
            </button>
          </div>

          <div className="project-list">
            {projects.length > 0 ? (
              projects.map((p) => <ProjectCard key={p.id} project={p} />)
            ) : (
              <p>No projects found.</p>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <ProjectModal onClose={() => setShowModal(false)} onAdd={fetchProjects} />
      )}
    </div>
  );
};

export default Projects;
