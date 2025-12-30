import api from "./axios";

export const getTasks = (project_id) =>
    api.getWithCache("/tasks", project_id ? { params: { project_id } } : {});

export const createTask = (data) =>
    api.post("/tasks", data);

export const updateTask = (id, data) =>
    api.patch(`/tasks/${id}`, data);

export const deleteTask = (id) =>
    api.delete(`/tasks/${id}`);
