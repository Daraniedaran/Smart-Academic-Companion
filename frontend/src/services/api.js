import { API_BASE_URL } from '../config';

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(data.detail || `Request failed with status ${res.status}`, res.status);
  }
  return res.json();
}

export const api = {
  chat: (message) =>
    request('/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),

  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetch(`${API_BASE_URL}/upload`, { method: 'POST', body: formData });
  },

  getNotes: () => request('/notes'),

  queryNotes: (query) =>
    request('/notes/query', {
      method: 'POST',
      body: JSON.stringify({ query }),
    }),

  analyzePerformance: (marks) =>
    request('/performance', {
      method: 'POST',
      body: JSON.stringify({ marks }),
    }),

  submitFeedback: (message) =>
    request('/feedback', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),

  healthCheck: () => request('/health'),
};

export { ApiError };
