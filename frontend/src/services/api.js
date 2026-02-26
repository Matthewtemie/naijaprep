import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

export const authApi = {
  signup: (data) => api.post("/auth/signup", data),
  login: (data) => api.post("/auth/login", data),
};

export const mealsApi = {
  generate: (userId, profile) =>
    api.post("/meals/generate", { user_id: userId, profile }),
  getCurrent: (userId) => api.get(`/meals/current/${userId}`),
};

export const emailApi = {
  sendPlan: (userId) => api.post("/email/send-plan", { user_id: userId }),
};

export default api;