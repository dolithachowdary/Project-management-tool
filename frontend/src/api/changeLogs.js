import api from "./axios";

export const getProjectLogs = (projectId) =>
  api.get("/change-logs", {
    params: {
      entity_type: "project",
      entity_id: projectId,
    },
  });
