import { create } from 'zustand';
import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

export const useStore = create((set, get) => ({
  projects: [],
  currentProject: null,
  endpoints: [],
  isLoading: false,
  error: null,

  fetchProjects: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/projects');
      set({ projects: response.data, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchProject: async (id) => {
    set({ isLoading: true });
    try {
      const response = await api.get(`/projects/${id}`);
      set({ currentProject: response.data, error: null, isLoading: false });
    } catch (err) {
      console.error('Failed to fetch project', err);
      set({ currentProject: null, error: err.message, isLoading: false });
    }
  },

  fetchEndpoints: async (projectId) => {
    try {
      const response = await api.get(`/projects/${projectId}/endpoints`);
      set({ endpoints: response.data, error: null });
    } catch (err) {
      console.error('Failed to fetch endpoints', err);
      set({ endpoints: [], error: err.message });
    }
  },

  createProject: async (data) => {
    try {
      const resp = await api.post('/projects', data);
      set({ projects: [...get().projects, resp.data], error: null });
      return resp.data;
    } catch (err) {
      console.error('Failed to create project', err);
      set({ error: err.message });
      throw err;
    }
  },

  createEndpoint: async (projectId, data) => {
    try {
      const resp = await api.post(`/projects/${projectId}/endpoints`, data);
      set({ endpoints: [...get().endpoints, resp.data], error: null });
      return resp.data;
    } catch (err) {
      console.error('Failed to create endpoint', err);
      set({ error: err.message });
      throw err;
    }
  },

  deleteEndpoint: async (projectId, endpointId) => {
    try {
      await api.delete(`/projects/${projectId}/endpoints/${endpointId}`);
      set({ endpoints: get().endpoints.filter(e => e.id !== endpointId), error: null });
    } catch (err) {
      console.error('Failed to delete endpoint', err);
      set({ error: err.message });
    }
  }
}));
