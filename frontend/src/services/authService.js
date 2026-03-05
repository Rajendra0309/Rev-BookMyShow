import axios from "axios";

const API = `${import.meta.env.VITE_API_URL}/auth`;

export const register = (data) => {
  return axios.post(`${API}/register`, data);
};

export const login = (data) => {
  return axios.post(`${API}/login`, data);
};

export const saveToken = (token, user) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};

export const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const getToken = () => {
  return localStorage.getItem("token");
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};