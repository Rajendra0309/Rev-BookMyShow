import axios from 'axios';

const API = `${import.meta.env.VITE_API_URL}/theatres`;
const getAuthHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

export const getAllTheatres = (city = '') =>
    axios.get(API, { headers: getAuthHeader(), params: city ? { city } : {} });

export const getTheatreById = (id) =>
    axios.get(`${API}/${id}`, { headers: getAuthHeader() });

export const createTheatre = (data) =>
    axios.post(API, data, { headers: getAuthHeader() });

export const updateTheatre = (id, data) =>
    axios.put(`${API}/${id}`, data, { headers: getAuthHeader() });

export const deleteTheatre = (id) =>
    axios.delete(`${API}/${id}`, { headers: getAuthHeader() });

// Screens
export const getScreensByTheatre = (theatreId) =>
    axios.get(`${API}/${theatreId}/screens`, { headers: getAuthHeader() });

export const addScreenToTheatre = (theatreId, data) =>
    axios.post(`${API}/${theatreId}/screens`, data, { headers: getAuthHeader() });

export const deleteScreen = (screenId) =>
    axios.delete(`${API}/screens/${screenId}`, { headers: getAuthHeader() });

// Seats
export const getSeatsByScreen = (screenId) =>
    axios.get(`${API}/screens/${screenId}/seats`, { headers: getAuthHeader() });

export const addSeats = (screenId, seats) =>
    axios.post(`${API}/screens/${screenId}/seats`, { seats }, { headers: getAuthHeader() });

export const deleteAllSeats = (screenId) =>
    axios.delete(`${API}/screens/${screenId}/seats`, { headers: getAuthHeader() });
