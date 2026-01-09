import api from "./axios";

export const getProjectLogs = (projectId) =>
  api.get("/change-logs/raw", {
    params: {
      entity_type: "project",
      entity_id: projectId,
    },
  });

export const getGlobalLogs = (params) =>
  api.get("/change-logs/raw", { params });
