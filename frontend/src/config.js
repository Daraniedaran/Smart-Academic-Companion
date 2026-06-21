// Centralized API configurations for the Smart Academic Companion
// Strip trailing slash to prevent double-slash URLs (e.g. //chat)
const rawUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
export const API_BASE_URL = rawUrl.replace(/\/+$/, '');
