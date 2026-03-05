import axios from "axios";

const API = "http://localhost:5000/api";

// Create show
export const createShow = (data) => {
  return axios.post(`${API}/shows/create`, data);
};

// Get shows
export const getShows = () => {
  return axios.get(`${API}/shows`);
};

// Cancel show
export const cancelShow = (id) => {
  return axios.put(`${API}/shows/cancel/${id}`);
};

// Create booking
export const createBooking = (data) => {
  return axios.post(`${API}/bookings/create`, data);
};

// Check seat availability
export const checkSeatAvailability = (showId) => {
  return axios.get(`${API}/bookings/seats/${showId}`);
};