import { create } from 'zustand';
import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

export const useStore = create((set, get) => ({
  projects: [],
  currentProject: null,
  endpoints: [],
  logs: [],
  logStats: null,
  isLoading: false,
  error: null,

  // ── Projects ────────────────────────────────────────────────────────────────
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
      set({ currentProject: null, error: err.message, isLoading: false });
    }
  },

  createProject: async (data) => {
    try {
      const resp = await api.post('/projects', data);
      set({ projects: [...get().projects, resp.data], error: null });
      return resp.data;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  updateProject: async (id, data) => {
    try {
      const resp = await api.put(`/projects/${id}`, data);
      set({ currentProject: resp.data });
      return resp.data;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  deleteProject: async (id) => {
    try {
      await api.delete(`/projects/${id}`);
      set({ projects: get().projects.filter(p => p.id !== id) });
    } catch (err) {
      set({ error: err.message });
    }
  },

  // ── Endpoints ───────────────────────────────────────────────────────────────
  fetchEndpoints: async (projectId) => {
    try {
      const response = await api.get(`/projects/${projectId}/endpoints`);
      set({ endpoints: response.data, error: null });
    } catch (err) {
      set({ endpoints: [], error: err.message });
    }
  },

  createEndpoint: async (projectId, data) => {
    try {
      const resp = await api.post(`/projects/${projectId}/endpoints`, data);
      set({ endpoints: [...get().endpoints, resp.data], error: null });
      return resp.data;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  updateEndpoint: async (projectId, endpointId, data) => {
    try {
      const resp = await api.put(`/projects/${projectId}/endpoints/${endpointId}`, data);
      set({ endpoints: get().endpoints.map(e => e.id === endpointId ? resp.data : e) });
      return resp.data;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  toggleEndpoint: async (projectId, endpointId) => {
    try {
      const resp = await api.patch(`/projects/${projectId}/endpoints/${endpointId}/toggle`);
      set({ endpoints: get().endpoints.map(e => e.id === endpointId ? resp.data : e) });
      return resp.data;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  deleteEndpoint: async (projectId, endpointId) => {
    try {
      await api.delete(`/projects/${projectId}/endpoints/${endpointId}`);
      set({ endpoints: get().endpoints.filter(e => e.id !== endpointId) });
    } catch (err) {
      set({ error: err.message });
    }
  },

  // ── Response Variants ────────────────────────────────────────────────────────
  fetchVariants: async (endpointId) => {
    try {
      const resp = await api.get(`/endpoints/${endpointId}/variants`);
      return resp.data;
    } catch (err) {
      console.error('Failed to fetch variants', err);
      return [];
    }
  },

  createVariant: async (endpointId, data) => {
    const resp = await api.post(`/endpoints/${endpointId}/variants`, data);
    return resp.data;
  },

  updateVariant: async (variantId, data) => {
    const resp = await api.put(`/variants/${variantId}`, data);
    return resp.data;
  },

  deleteVariant: async (variantId) => {
    await api.delete(`/variants/${variantId}`);
  },

  activateVariant: async (endpointId, variantId) => {
    const resp = await api.post(`/endpoints/${endpointId}/activate-variant/${variantId}`);
    set({ endpoints: get().endpoints.map(e => e.id === endpointId ? resp.data : e) });
    return resp.data;
  },

  deactivateVariant: async (endpointId) => {
    const resp = await api.post(`/endpoints/${endpointId}/deactivate-variant`);
    set({ endpoints: get().endpoints.map(e => e.id === endpointId ? resp.data : e) });
    return resp.data;
  },

  // ── OpenAPI Import ───────────────────────────────────────────────────────────
  importOpenApiSpec: async (projectId, spec) => {
    const resp = await api.post(`/projects/${projectId}/import/openapi`, { spec });
    await get().fetchEndpoints(projectId); // refresh endpoint list
    return resp.data; // { imported, skipped, errors }
  },

  // ── Request Logs ─────────────────────────────────────────────────────────────
  fetchLogs: async (projectId, filters = {}, page = 0, size = 50) => {
    try {
      const params = { page, size, ...filters };
      const resp = await api.get(`/projects/${projectId}/logs`, { params });
      set({ logs: resp.data });
    } catch (err) {
      set({ error: err.message });
    }
  },

  clearLogs: async (projectId) => {
    try {
      await api.delete(`/projects/${projectId}/logs`);
      set({ logs: [] });
    } catch (err) {
      set({ error: err.message });
    }
  },

  fetchLogStats: async (projectId) => {
    try {
      const resp = await api.get(`/projects/${projectId}/logs/stats`);
      set({ logStats: resp.data });
      return resp.data;
    } catch (err) {
      set({ error: err.message });
      return null;
    }
  },

  exportLogs: async (projectId, format = 'csv') => {
    const resp = await api.get(`/projects/${projectId}/logs/export`, {
      params: { format },
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([resp.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${projectId}.${format}`;
    a.click();
    window.URL.revokeObjectURL(url);
  },
}));
