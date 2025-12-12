// src/lib/projects.js
import apiClient from "./apiClient";

export const ProjectsAPI = {
  list: async (params = {}) => {
    const res = await apiClient.get("/projects/", { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await apiClient.get(`/projects/id`, { params: { id } });
    return res.data;
  },
  create: async (payload) => {
    const res = await apiClient.post("/projects/", payload);
    return res.data;
  },
  update: async (id, payload) => {
    const res = await apiClient.patch(`/projects/id`, payload, { params: { id } });
    return res.data;
  },
  remove: async (id) => {
    const res = await apiClient.delete(`/projects/id`, { params: { id } });
    return res.data;
  },
};
