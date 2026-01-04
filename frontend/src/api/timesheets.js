import api from "./axios";

export const getTimesheets = (params) => api.get("/timesheets", { params });
export const createTimesheet = (data) => api.post("/timesheets", data);
export const approveTimesheet = (id) => api.patch(`/timesheets/${id}/approve`);
export const getWeeklySummary = (params) => api.get("/timesheets/summary/weekly", { params });

// Generated Timesheets
export const generatePreview = (params) => api.get("/timesheets/preview", { params });
export const saveTimesheet = (data) => api.post("/timesheets/save", data);
export const getHistory = () => api.get("/timesheets/history");
export const getById = (id) => api.get(`/timesheets/${id}/generated`);
