import api from "./axios";

export const getAssignableUsers = () =>
  api.get("/users/assignable");
