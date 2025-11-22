// API Base URL
const API_BASE_URL = "http://localhost:5000/api";

// Helper function for API calls with authentication
const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem("hrms_token");

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Handle unauthorized (token expired)
    if (response.status === 401) {
      localStorage.removeItem("hrms_token");
      localStorage.removeItem("hrms_user");
      localStorage.removeItem("hrms_organisation");
      window.location.href = "/login";
      throw new Error("Authentication failed");
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "API request failed");
    }

    return data;
  } catch (error) {
    console.error("API call error:", error);
    throw error;
  }
};

// API methods
export const api = {
  // GET request
  get: (endpoint) => apiCall(endpoint),

  // POST request
  post: (endpoint, data) =>
    apiCall(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // PUT request
  put: (endpoint, data) =>
    apiCall(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // DELETE request
  delete: (endpoint) =>
    apiCall(endpoint, {
      method: "DELETE",
    }),
};

/*
// AXIOS VERSION (commented for learning)
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hrms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('hrms_token');
      localStorage.removeItem('hrms_user');
      localStorage.removeItem('hrms_organisation');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
*/
