import api from "./axios";

export const getDashboardStats = () =>
    api.get("/dashboard/stats").catch(() => {
        // Fallback if endpoint not found - will handle in component
        return { data: { success: false } };
    });

export const getUpcomingDeadlines = () =>
    api.get("/dashboard/upcoming-deadlines");

export const getWeeklyStats = () =>
    api.get("/dashboard/weekly-stats");

export const getGlobalActivityList = () =>
    api.get("/change-logs");
