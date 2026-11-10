
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.DEV
    ? "http://localhost:5000/api"
    : "https://ai-airport-assistant.onrender.com/api",

  timeout: 35000,

  headers: {
    "Content-Type": "application/json"
  }
});

API.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
