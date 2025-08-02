// src/utils/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://app.velloresemicon.com/api",
  timeout: 10000,
});

// Automatically attach token if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
