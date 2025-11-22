import { api } from "./api";

export const authService = {
  // Register organisation using fetch
  register: async (orgData) => {
    return await api.post("/auth/register", orgData);

    /*
    // AXIOS VERSION
    const response = await api.post('/auth/register', orgData);
    return response.data;
    */
  },

  // Login using fetch
  login: async (email, password) => {
    return await api.post("/auth/login", { email, password });

    /*
    // AXIOS VERSION  
    const response = await api.post('/auth/login', { email, password });
    return response.data;
    */
  },

  // Store auth data
  setAuth: (data) => {
    localStorage.setItem("hrms_token", data.token);
    localStorage.setItem("hrms_user", JSON.stringify(data.user));
    localStorage.setItem(
      "hrms_organisation",
      JSON.stringify(data.organisation)
    );
  },

  // Get auth data
  getAuth: () => {
    const token = localStorage.getItem("hrms_token");
    const user = JSON.parse(localStorage.getItem("hrms_user") || "null");
    const organisation = JSON.parse(
      localStorage.getItem("hrms_organisation") || "null"
    );

    return { token, user, organisation };
  },

  // Logout
  logout: () => {
    localStorage.removeItem("hrms_token");
    localStorage.removeItem("hrms_user");
    localStorage.removeItem("hrms_organisation");
    window.location.href = "/login";
  },

  // Check if authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem("hrms_token");
  },
};
