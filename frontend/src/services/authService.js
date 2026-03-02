import axios from "axios";

const API = 'http://localhost:5000/api/auth';

export const register = (data) => axios.post(`${API}/register`, data);
export const login = (data) => axios.post(`${API}/login`, data);

export const saveToken = (token) => localStorage.setItem('token', token);
export const getToken = () => localStorage.getItem('token');
export const getUser = () => JSON.parse(localStorage.getItem('user') || 'null');
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};