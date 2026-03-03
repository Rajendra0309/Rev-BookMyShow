import axios from 'axios';

const API = `${import.meta.env.VITE_API_URL}/reports`;

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

/* ---------- Notification Endpoints ---------- */
export const getNotifications = (userId) =>
    axios.get(`${API}/notifications/${userId}`, { headers: getAuthHeader() });

export const markAsRead = (notifId) =>
    axios.put(`${API}/notifications/${notifId}/read`, {}, { headers: getAuthHeader() });

export const deleteNotification = (notifId) =>
    axios.delete(`${API}/notifications/${notifId}`, { headers: getAuthHeader() });

/* ---------- Report Endpoints (Admin Only) ---------- */
export const getRevenueReport = (params = {}) =>
    axios.get(`${API}/revenue`, { headers: getAuthHeader(), params });

export const getOccupancyReport = () =>
    axios.get(`${API}/occupancy`, { headers: getAuthHeader() });

export const getBookingReport = (params = {}) =>
    axios.get(`${API}/bookings`, { headers: getAuthHeader(), params });
