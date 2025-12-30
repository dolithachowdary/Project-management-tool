import api from "./axios";

export const getTasks = () =>
    api.get("/tasks");

export const createTask = (data) =>
    api.post("/tasks", data);

export const updateTask = (id, data) =>
    api.patch(`/tasks/${id}`, data);

export const deleteTask = (id) =>
    api.delete(`/tasks/${id}`);
