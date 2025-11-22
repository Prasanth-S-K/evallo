import { api } from "./api";

export const teamService = {
  // Get all teams using fetch
  getAll: async () => {
    return await api.get("/teams");

    /*
    // AXIOS VERSION
    const response = await api.get('/teams');
    return response.data;
    */
  },

  // Get single team using fetch
  getById: async (id) => {
    return await api.get(`/teams/${id}`);

    /*
    // AXIOS VERSION
    const response = await api.get(`/teams/${id}`);
    return response.data;
    */
  },

  // Create team using fetch
  create: async (teamData) => {
    return await api.post("/teams", teamData);

    /*
    // AXIOS VERSION
    const response = await api.post('/teams', teamData);
    return response.data;
    */
  },

  // Update team using fetch
  update: async (id, teamData) => {
    return await api.put(`/teams/${id}`, teamData);

    /*
    // AXIOS VERSION
    const response = await api.put(`/teams/${id}`, teamData);
    return response.data;
    */
  },

  // Delete team using fetch
  delete: async (id) => {
    return await api.delete(`/teams/${id}`);

    /*
    // AXIOS VERSION
    const response = await api.delete(`/teams/${id}`);
    return response.data;
    */
  },

  // Assign employee to team using fetch
  assignEmployee: async (teamId, employeeId) => {
    return await api.post(`/teams/${teamId}/assign`, { employeeId });

    /*
    // AXIOS VERSION
    const response = await api.post(`/teams/${teamId}/assign`, { employeeId });
    return response.data;
    */
  },

  // Assign multiple employees to team using fetch
  assignEmployees: async (teamId, employeeIds) => {
    return await api.post(`/teams/${teamId}/assign`, { employeeIds });

    /*
    // AXIOS VERSION
    const response = await api.post(`/teams/${teamId}/assign`, { employeeIds });
    return response.data;
    */
  },

  // Unassign employee from team using fetch
  unassignEmployee: async (teamId, employeeId) => {
    return await api.delete(`/teams/${teamId}/unassign`, {
      body: JSON.stringify({ employeeId }),
    });

    /*
    // AXIOS VERSION
    const response = await api.delete(`/teams/${teamId}/unassign`, { 
      data: { employeeId } 
    });
    return response.data;
    */
  },
};
