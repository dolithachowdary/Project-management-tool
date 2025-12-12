// src/lib/tasks.js
import apiClient from "./apiClient";

export const TasksAPI = {
  list: async (params = {}) => {
    // params could be { project_id, status, assigned_to }
    const res = await apiClient.get("/tasks/", { params });
    return res.data;
  },

  getById: async (id) => {
    const res = await apiClient.get(`/tasks/id`, { params: { id } });
    return res.data;
  },

  create: async (payload) => {
    // payload example: { task_name, module_id, project_id, assignee_id, start_date, end_date, status }
    const res = await apiClient.post("/tasks/", payload);
    return res.data;
  },

  update: async (id, payload) => {
    const res = await apiClient.patch(`/tasks/id`, payload, { params: { id } });
    return res.data;
  },

  remove: async (id) => {
    const res = await apiClient.delete(`/tasks/id`, { params: { id } });
    return res.data;
  },
};
