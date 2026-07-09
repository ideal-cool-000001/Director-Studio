// ═══════════════════════════════════════════
// API 服务层 — Axios 实例 + 项目/图/Agent 服务
// ═══════════════════════════════════════════

import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/** Axios 实例 */
export const api = axios.create({
  baseURL: `${API_BASE}/api/v1`,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// 请求拦截器：注入 JWT Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器：统一错误处理
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

// ─── 项目 API ───
export const projectService = {
  list: () => api.get('/projects'),
  get: (id: string) => api.get(`/projects/${id}`),
  create: (data: Record<string, unknown>) => api.post('/projects', data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
};

// ─── 图结构 API ───
export const graphService = {
  getGraph: (projectId: string) => api.get(`/projects/${projectId}/graph`),
  createNode: (projectId: string, data: Record<string, unknown>) =>
    api.post(`/projects/${projectId}/nodes`, data),
  updateNode: (projectId: string, nodeId: string, data: Record<string, unknown>) =>
    api.patch(`/projects/${projectId}/nodes/${nodeId}`, data),
  deleteNode: (projectId: string, nodeId: string) =>
    api.delete(`/projects/${projectId}/nodes/${nodeId}`),
  createEdge: (projectId: string, data: Record<string, unknown>) =>
    api.post(`/projects/${projectId}/edges`, data),
  deleteEdge: (projectId: string, edgeId: string) =>
    api.delete(`/projects/${projectId}/edges/${edgeId}`),
};

// ─── Agent 任务 API ───
export const agentService = {
  generateAll: (projectId: string, qualityLevel?: string) =>
    api.post(`/projects/${projectId}/generate`, { quality_level: qualityLevel }),
  generateNode: (projectId: string, nodeId: string, qualityLevel?: string, context?: Record<string, unknown>) =>
    api.post(`/projects/${projectId}/nodes/${nodeId}/generate`, { quality_level: qualityLevel, context }),
  regenerate: (projectId: string, modifiedNodeId: string) =>
    api.post(`/projects/${projectId}/regenerate`, { modified_node_id: modifiedNodeId }),
  getTask: (projectId: string, taskId: string) =>
    api.get(`/projects/${projectId}/tasks/${taskId}`),
  cancelTask: (projectId: string, taskId: string) =>
    api.post(`/projects/${projectId}/tasks/${taskId}/cancel`),
  approve: (projectId: string, nodeId: string) =>
    api.post(`/projects/${projectId}/nodes/${nodeId}/approve`),
  reject: (projectId: string, nodeId: string, feedback: string) =>
    api.post(`/projects/${projectId}/nodes/${nodeId}/reject`, { action: 'reject', feedback }),
  feedback: (projectId: string, nodeId: string, feedback: string) =>
    api.post(`/projects/${projectId}/nodes/${nodeId}/feedback`, { action: 'pending', feedback }),
  executeAgent: (agentType: string, nodeId: string, context: Record<string, unknown>) =>
    api.post(`/agents/${agentType}/execute`, { node_id: nodeId, context }),
  listAgents: () => api.get('/agents/list'),
};

// ─── 角色设计 API ───
export const characterService = {
  design: (nodeId: string, context: Record<string, unknown>) =>
    api.post('/agents/character_designer/execute', { node_id: nodeId, context }),
  generatePrompts: (nodeId: string, characters: unknown[], stylePreset: string) =>
    api.post('/agents/character_designer/execute', {
      node_id: nodeId,
      context: { action: 'generate_prompts', characters, style_preset: stylePreset },
    }),
  checkConsistency: (nodeId: string, characters: unknown[], stylePreset: string) =>
    api.post('/agents/character_designer/execute', {
      node_id: nodeId,
      context: { action: 'check_consistency', characters, style_preset: stylePreset },
    }),
};

// ─── 质量检验 API ───
export const qualityService = {
  checkNode: (projectId: string, nodeId: string) =>
    api.post(`/projects/${projectId}/nodes/${nodeId}/quality-check`),
  checkProject: (projectId: string) =>
    api.post(`/projects/${projectId}/quality-check`),
};

// ─── 宣发 API ───
export const promotionService = {
  generate: (projectId: string, platform?: string) =>
    api.post(`/projects/${projectId}/promotion/generate`, { platform }),
  batchExport: (projectId: string, platform?: string) =>
    api.post(`/projects/${projectId}/promotion/batch-export`, { platform }),
};

// ─── 导出 API ───
export const exportService = {
  exportProject: (projectId: string) =>
    api.post(`/projects/${projectId}/export`),
  getExportStatus: (projectId: string, exportId: string) =>
    api.get(`/projects/${projectId}/export/${exportId}`),
};

// ─── 成本 API ───
export const costService = {
  getSummary: (projectId: string) => api.get(`/projects/${projectId}/cost/summary`),
  getBreakdown: (projectId: string) => api.get(`/projects/${projectId}/cost/breakdown`),
};

// ─── 设置 API ───
export const settingsService = {
  listAIServices: (serviceType?: string) => api.get('/settings/ai-services', { params: { service_type: serviceType } }),
  getAIService: (configId: string) => api.get(`/settings/ai-services/${configId}`),
  createAIService: (data: Record<string, unknown>) => api.post('/settings/ai-services', data),
  updateAIService: (configId: string, data: Record<string, unknown>) => api.put(`/settings/ai-services/${configId}`, data),
  deleteAIService: (configId: string) => api.delete(`/settings/ai-services/${configId}`),
  toggleAIService: (configId: string, enabled: boolean) => api.post(`/settings/ai-services/${configId}/toggle`, { enabled }),
  testConnection: (serviceType: string, provider: string) => api.post('/settings/ai-services/test-connection', { service_type: serviceType, provider }),
};
