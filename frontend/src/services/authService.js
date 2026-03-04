import axios from "axios";

const API = `${import.meta.env.VITE_API_URL}/auth`;

export const register = (data) => axios.post(`${API}/register`, data);
export const login = (data) => axios.post(`${API}/login`, data);
export const forgotPassword = (data) => axios.post(`${API}/forgot-password`, data);
export const getSecurityQuestion = (email) => axios.get(`${API}/security-question?email=${email}`);
export const changePassword = (data) => axios.post(`${API}/change-password`, data);

export const saveToken = (token) => localStorage.setItem('token', token);
export const getToken = () => localStorage.getItem('token');
export const getUser = () => JSON.parse(localStorage.getItem('user') || 'null');
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};