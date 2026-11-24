import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8001/api';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json', 
  },
});

// ---------------------------------------------------------------
// Token storage helpers
// (In-memory + localStorage. See note below on this tradeoff.)
// ---------------------------------------------------------------

const ACCESS_TOKEN_KEY = 'ias_access_token';
const REFRESH_TOKEN_KEY = 'ias_refresh_token';

export const tokenStorage = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setTokens: (access, refresh) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    if (refresh) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
    }
  },
  clearTokens: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

// ---------------------------------------------------------------
// Request interceptor: attach access token to every outgoing request
// ---------------------------------------------------------------

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = tokenStorage.getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---------------------------------------------------------------
// Response interceptor: on 401, refresh the access token and retry.
//
// Handles concurrent 401s (e.g. three components fire requests at
// once, all get 401) by queuing retries behind a single in-flight
// refresh call, rather than triggering multiple simultaneous
// refresh requests (which would race against ROTATE_REFRESH_TOKENS
// and cause all but one to fail).
// ---------------------------------------------------------------

let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(callback) {
  refreshSubscribers.push(callback);
}

function onTokenRefreshed(newAccessToken) {
  refreshSubscribers.forEach((callback) => callback(newAccessToken));
  refreshSubscribers = [];
}

function onRefreshFailed() {
  refreshSubscribers = [];
  tokenStorage.clearTokens();
  window.location.href = '/login';
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response) {
      // Network error, no response at all — nothing to refresh against.
      return Promise.reject(error);
    }

    const isAuthEndpoint =
      originalRequest.url?.includes('/auth/login/') ||
      originalRequest.url?.includes('/auth/token/refresh/');

    if (error.response.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      const refreshToken = tokenStorage.getRefreshToken();

      if (!refreshToken) {
        onRefreshFailed();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // A refresh is already in flight — queue this request to
        // retry once that refresh resolves, instead of firing a
        // second concurrent refresh call.
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((newAccessToken) => {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            originalRequest._retry = true;
            resolve(axiosInstance(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(`${BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken = response.data.access;
        const newRefreshToken = response.data.refresh; // present due to ROTATE_REFRESH_TOKENS

        tokenStorage.setTokens(newAccessToken, newRefreshToken);
        isRefreshing = false;
        onTokenRefreshed(newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        onRefreshFailed();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;