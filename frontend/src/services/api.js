import axios from "axios";

// This points to your Flask backend
const API_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Auth endpoints
export const authApi = {
  signup: (data) => api.post("/auth/signup", data),
  login: (data) => api.post("/auth/login", data),
};

// Meal plan endpoints
export const mealsApi = {
  generate: (userId, profile) =>
    api.post("/meals/generate", { user_id: userId, profile }),
  getCurrent: (userId) => api.get(`/meals/current/${userId}`),
};

// Email endpoints
export const emailApi = {
  sendPlan: (userId) => api.post("/email/send-plan", { user_id: userId }),
};

export default api;