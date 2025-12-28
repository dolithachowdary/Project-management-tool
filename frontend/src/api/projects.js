import api from "./axios";

export const getProjects = () => api.get("/projects");

export const getProjectById = (id) =>
  api.get("/projects", { params: { id } });

export const createProject = (data) =>
  api.post("/projects", data);

export const updateProject = (id, data) =>
  api.patch("/projects", data, { params: { id } });

export const deleteProject = (id) =>
  api.delete("/projects", { params: { id } });
