import API from "./axios";

export const getNotifications = () => API.get("/notifications");
export const markNotificationAsRead = (id) => API.put(`/notifications/${id}/read`);
export const markAllNotificationsAsRead = () => API.put("/notifications/read-all");
export const pushReminder = (data) => API.post("/notifications/push", data);
