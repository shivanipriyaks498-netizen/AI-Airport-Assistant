import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",

  // Allow 35 seconds for the backend to respond
  timeout: 35000,

  headers: {
    "Content-Type": "application/json"
  }
});

// Attach login token automatically
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