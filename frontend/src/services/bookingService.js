// latest code by samruddhi
import axios from 'axios';

const API = `${import.meta.env.VITE_API_URL}/bookings`;
const getAuthHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

export const createBooking = (data) =>
    axios.post(`${API}/create`, data, { headers: getAuthHeader() });

export const getMyBookings = (userId) =>
    axios.get(`${API}/user/${userId}`, { headers: getAuthHeader() });

export const cancelBooking = (id) =>
    axios.put(`${API}/cancel/${id}`, {}, { headers: getAuthHeader() });

export const checkSeatAvailability = (showId) =>
    axios.get(`${API}/availability/${showId}`, { headers: getAuthHeader() });
