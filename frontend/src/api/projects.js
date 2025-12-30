import api from "./axios";

/* ---------------- READ ---------------- */

export const getProjects = () =>
  api.get("/projects");

export const getProjectById = (id) =>
  api.get(`/projects/${id}`); 

export const getProjectSummary = (id) =>
  api.get(`/projects/${id}/summary`);

export const getProjectActivity = (id) =>
  api.get(`/projects/${id}/activity`);

export const createProject = (data) =>
  api.post("/projects", data);

export const updateProject = (id, data) =>
  api.patch(`/projects/${id}`, data);

export const deleteProject = (id) =>
  api.delete(`/projects/${id}`);
