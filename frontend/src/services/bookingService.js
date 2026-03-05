import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const createShow = (data) =>
  axios.post(`${API}/shows/create`, data, { headers: getAuthHeader() });

export const getShows = () =>
  axios.get(`${API}/shows`, { headers: getAuthHeader() });

export const cancelShow = (id) =>
  axios.put(`${API}/shows/cancel/${id}`, {}, { headers: getAuthHeader() });

export const createBooking = (data) =>
  axios.post(`${API}/bookings/create`, data, { headers: getAuthHeader() });

export const checkSeatAvailability = (showId) =>
  axios.get(`${API}/bookings/availability/${showId}`, { headers: getAuthHeader() });

export const getMyBookings = (userId) =>
  axios.get(`${API}/bookings/user/${userId}`, { headers: getAuthHeader() });

export const cancelBooking = (id) =>
  axios.put(`${API}/bookings/cancel/${id}`, {}, { headers: getAuthHeader() });

export const updateShow = (id, data) =>
  axios.put(`${API}/shows/${id}`, data, { headers: getAuthHeader() });