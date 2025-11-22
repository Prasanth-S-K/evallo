import { api } from "./api";

export const employeeService = {
  // Get all employees using fetch (with teams included)
  getAll: async () => {
    return await api.get("/employees");
  },

  // Get single employee using fetch (with teams included)
  getById: async (id) => {
    return await api.get(`/employees/${id}`);
  },

  // Create employee using fetch
  create: async (employeeData) => {
    return await api.post("/employees", employeeData);
  },

  // Update employee using fetch
  update: async (id, employeeData) => {
    return await api.put(`/employees/${id}`, employeeData);
  },

  // Delete employee using fetch
  delete: async (id) => {
    return await api.delete(`/employees/${id}`);
  },
};
