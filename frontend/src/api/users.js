import api from "./axios";

export const getAssignableUsers = () =>
  api.get("/users/assignable");

export const getSupervisors = () =>
  api.get("/users/supervisors");
