// src/lib/modules.js
import apiClient from "./apiClient";

export const ModulesAPI = {
  list: async (params = {}) => {
    const res = await apiClient.get("/modules/", { params });
    return res.data;
  },

  create: async (payload) => {
    const res = await apiClient.post("/modules/", payload);
    return res.data;
  },

  remove: async (id) => {
    const res = await apiClient.delete(`/modules/id`, { params: { id } });
    return res.data;
  },
};
