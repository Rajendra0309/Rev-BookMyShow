import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL
});

// Automatically attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ===============================
// GET MOVIES (Search + Pagination)
// ===============================
export const getMovies = async (params = {}) => {
  const response = await api.get('/movies', { params });
  return response.data;
};

// ===============================
// GET SINGLE MOVIE
// ===============================
export const getMovieById = async (id) => {
  const response = await api.get(`/movies/${id}`);
  return response.data;
};

// ===============================
// CREATE MOVIE (Admin)
// ===============================
export const createMovie = async (movieData) => {
  const response = await api.post('/movies', movieData);
  return response.data;
};

// ===============================
// UPDATE MOVIE (Admin)
// ===============================
export const updateMovie = async (id, movieData) => {
  const response = await api.put(`/movies/${id}`, movieData);
  return response.data;
};

// ===============================
// DELETE MOVIE (Soft Delete - Admin)
// ===============================
export const deleteMovie = async (id) => {
  const response = await api.delete(`/movies/${id}`);
  return response.data;
};

// ===============================
// CHECK SHOWS FOR MOVIE
// ===============================
export const getShowsByMovie = async (movieId) => {
  const response = await api.get(`/shows`, {
    params: { movieId }
  });
  return response.data;
};