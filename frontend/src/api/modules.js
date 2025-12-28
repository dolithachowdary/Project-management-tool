import api from "./axios";

export const getModules = (project_id) =>
  api.get("/modules", { params: { project_id } });

export const createModule = (data) =>
  api.post("/modules", data);

export const updateModule = (id, data) =>
  api.patch("/modules", data, { params: { id } });

export const deleteModule = (id) =>
  api.delete("/modules", { params: { id } });

