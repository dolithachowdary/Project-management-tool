import React from "react";

const ProjectCard = ({ project }) => {
  return (
    <div className="project-card">
      <div className="card-header">
        <h3>{project.name}</h3>
        <span className={`status ${project.status.toLowerCase()}`}>
          {project.status}
        </span>
      </div>
      <p>{project.description}</p>
      <div className="card-actions">
        <button className="edit-btn">Edit</button>
        <button className="delete-btn">Delete</button>
      </div>
    </div>
  );
};

export default ProjectCard;
