import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Create Show
export const createShow = async (showData) => {
  const response = await api.post('/shows/create', showData);
  return response.data;
};

// ✅ Get All Shows
export const getShows = async () => {
  const response = await api.get('/shows');
  return response.data;
};

// ✅ Cancel Show (Soft Delete)
export const cancelShow = async (id) => {
  const response = await api.put(`/shows/cancel/${id}`);
  return response.data;
};

// ✅ Update Show  ⭐ ADD THIS
export const updateShow = async (id, showData) => {
  const response = await api.put(`/shows/${id}`, showData);
  return response.data;
};
