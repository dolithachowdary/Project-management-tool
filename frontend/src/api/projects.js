import api from "./axios";

/* ---------------- READ ---------------- */

export const getProjects = () =>
  api.getWithCache("/projects");

export const getProjectById = (id) =>
  api.get(`/projects/${id}`);

export const getProjectSummary = (id) =>
  api.getWithCache(`/projects/${id}/summary`);

export const getProjectActivity = (id) =>
  api.get(`/projects/${id}/activity`);

export const createProject = (data) =>
  api.post("/projects", data);

export const updateProject = (id, data) =>
  api.patch(`/projects/${id}`, data);

export const deleteProject = (id) =>
  api.delete(`/projects/${id}`);

export const getProjectMembers = (id) =>
  api.get(`/projects/${id}/members`);

export const getProjectHierarchy = (id) =>
  api.get(`/projects/${id}/hierarchy`);
