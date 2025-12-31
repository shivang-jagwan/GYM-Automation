// src/api/axios.js
import axios from 'axios';

// Change this baseURL as needed for deployment
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // for session auth; remove if using token auth only
});

// CSRF token helper
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// Add CSRF token to all requests
api.interceptors.request.use(config => {
  const csrfToken = getCookie('csrftoken');
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  return config;
});

// TWEAK 3: System status tracking
// Simple event-based system status (online/offline)
let systemStatusListeners = [];
let currentSystemStatus = true; // Default: online

// Subscribe to status changes
export function subscribeToSystemStatus(callback) {
  systemStatusListeners.push(callback);
  // Immediately call with current status
  callback(currentSystemStatus);
  // Return unsubscribe function
  return () => {
    systemStatusListeners = systemStatusListeners.filter(cb => cb !== callback);
  };
}

// Notify all listeners of status change
function updateSystemStatus(isOnline) {
  if (currentSystemStatus !== isOnline) {
    currentSystemStatus = isOnline;
    systemStatusListeners.forEach(cb => cb(isOnline));
  }
}

// TWEAK 3: Response interceptor to track API success/failure
api.interceptors.response.use(
  (response) => {
    // API call succeeded - system is online
    updateSystemStatus(true);
    return response;
  },
  (error) => {
    // Check if it's a network error or 5xx server error
    if (!error.response || (error.response.status >= 500 && error.response.status < 600)) {
      // Network error or server error - system appears offline
      updateSystemStatus(false);
    }
    // For 4xx errors, system is still online (client error)
    return Promise.reject(error);
  }
);

// Set token for all requests if present
export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Token ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

export default api;
