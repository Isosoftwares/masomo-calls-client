// ================================
// UPDATED APP.JS - Main Application with All Routes
// ================================

import axios from "../api/axios";


export const authAPI = {
  login: (credentials) => axios.post("/auth/login", credentials),
  register: (userData) => axios.post("/auth/register", userData),
  getProfile: () => axios.get("/auth/profile"),
  updateProfile: (profileData) => axios.put("/auth/profile", profileData),
};

// Calls API
export const callsAPI = {
  createCall: (callData) => axios.post("/calls", callData),
  getCallHistory: (params) => axios.get("/record-calls/history", { params }),
  getActiveCalls: () => axios.get("/calls/active"),
  updateCall: (callId, updates) => axios.put(`/calls/${callId}`, updates),
  endCall: (callId) => axios.delete(`/calls/${callId}`),
};

// Agents API
export const agentsAPI = {
  getAgents: (params) => axios.get("/agents", { params }),
  getAgentById: (agentId) => axios.get(`/agents/${agentId}`),
  updateStatus: (status) => axios.put("/agents/status", { status }),
  updateSkills: (skills) => axios.put("/agents/skills", { skills }),
  updateAvailability: (availability) =>
    axios.put("/agents/availability", availability),
  getPerformance: (agentId, params) =>
    axios.get(`/agents/${agentId}/performance`, { params }),
};

// Queues API
export const queuesAPI = {
  getQueues: () => axios.get("/queues"),
  createQueue: (queueData) => axios.post("/queues", queueData),
  updateQueue: (queueId, updates) => axios.put(`/queues/${queueId}`, updates),
  addAgent: (queueId, agentData) =>
    axios.post(`/queues/${queueId}/agents`, agentData),
  removeAgent: (queueId, agentId) =>
    axios.delete(`/queues/${queueId}/agents/${agentId}`),
  getStats: (queueId, params) =>
    axios.get(`/queues/${queueId}/stats`, { params }),
};

// Analytics API
export const analyticsAPI = {
  getDashboard: (params) => axios.get("/analytics/dashboard", { params }),
  getCallVolume: (params) => axios.get("/analytics/call-volume", { params }),
  getAgentPerformance: (params) =>
    axios.get("/analytics/agent-performance", { params }),
  getQueuePerformance: (params) =>
    axios.get("/analytics/queue-performance", { params }),
  exportCalls: (params) => axios.get("/analytics/export-calls", { params }),
};

// Phone Numbers API
export const phoneNumbersAPI = {
  getPhoneNumbers: (params) => axios.get("/phone-numbers", { params }),
  purchaseNumber: (numberData) =>
    axios.post("/phone-numbers/purchase", numberData),
  updateNumber: (numberId, updates) =>
    axios.put(`/phone-numbers/${numberId}`, updates),
  releaseNumber: (numberId) => axios.delete(`/phone-numbers/${numberId}`),
  getStats: (numberId, params) =>
    axios.get(`/phone-numbers/${numberId}/stats`, { params }),
};

// Notifications API
export const notificationsAPI = {
  getNotifications: () => axios.get("/notifications"),
  markAsRead: (notificationId) =>
    axios.put(`/notifications/${notificationId}/read`),
  getSettings: () => axios.get("/notifications/settings"),
  updateSettings: (settings) => axios.put("/notifications/settings", settings),
};

export default axios;
