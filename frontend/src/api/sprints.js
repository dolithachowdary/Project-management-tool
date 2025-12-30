import api from "./axios";

export const getSprints = (project_id) =>
    api.getWithCache("/sprints", { params: { project_id } });

export const getSprintById = (id) =>
    api.get(`/sprints/${id}`);

export const createSprint = (data) =>
    api.post("/sprints", data);

export const updateSprint = (id, data) =>
    api.patch(`/sprints/${id}`, data);

export const deleteSprint = (id) =>
    api.delete(`/sprints/${id}`);
