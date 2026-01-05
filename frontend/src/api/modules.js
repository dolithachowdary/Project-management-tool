import api from "./axios";

export const getModules = (project_id) =>
  api.getWithCache("/modules", { params: { project_id } });

export const createModule = (data) =>
  api.post("/modules", data);

export const updateModule = (id, data) =>
  api.patch(`/modules/${id}`, data);

export const deleteModule = (id) =>
  api.delete(`/modules/${id}`);

