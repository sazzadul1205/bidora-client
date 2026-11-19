import axios from "axios";

const authApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// DEBUG LOGGING — enabled only in dev, silenced in production builds
const DEBUG = import.meta.env.DEV;
const reqLog = (cfg) => {
  if (!DEBUG) {return;} console.warn("%c[API REQUEST]", "color: #2563eb; font-weight: bold", {
    method: cfg.method?.toUpperCase(),
    url: cfg.url,
    params: cfg.params,
    data: cfg.data,
  });
};

const resLog = (res) => {
  if (!DEBUG) {return;} console.warn("%c[API RESPONSE]", "color: #16a34a; font-weight: bold", {
    url: res.config?.url,
    status: res.status,
    data: res.data,
  });
};
const errLog = (err) => {
  if (!DEBUG) {return;} console.warn("%c[API ERROR]", "color: #dc2626; font-weight: bold", {
    url: err.config?.url,
    status: err.response?.status,
    data: err.response?.data,
  });
};
authApi.interceptors.request.use(
  (cfg) => {
    reqLog(cfg);
    return cfg;
  },
  (err) => {
    errLog(err);
    return Promise.reject(err);
  },
);

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

authApi.interceptors.response.use(
  (res) => {
    resLog(res);
    return res;
  },
  async (err) => {
    errLog(err);
    const originalRequest = err.config;

    // If error is 401 and we haven't tried to refresh yet
    if (err.response?.status === 401 && !originalRequest._retry) {
      // Don't try to refresh for auth endpoints
      if (originalRequest.url.includes("/auth/login") || 
          originalRequest.url.includes("/auth/register") ||
          originalRequest.url.includes("/auth/refresh")) {
        return Promise.reject(err);
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        // Wait for the refresh to complete
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return authApi(originalRequest);
        }).catch((err) => {
          return Promise.reject(err);
        });
      }

      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        const response = await authApi.post("/auth/refresh", { refreshToken });
        const data = response.data?.data || {};
        
        const newToken = data.token;
        const newRefreshToken = data.refreshToken;

        localStorage.setItem("token", newToken);
        if (newRefreshToken) {
          localStorage.setItem("refreshToken", newRefreshToken);
        }

        // Update the auth header for future requests
        authApi.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        processQueue(null, newToken);
        return authApi(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Clear tokens and redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("roles");
        localStorage.removeItem("tokenExpiresInMinutes");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  },
);

// Helper to manually attach the Bearer token for protected routes
export const getAuthConfig = () => {
  const token = localStorage.getItem("token");
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

// Public Auth Endpoints

// Creates a new account. (Buyer or Seller)
export const register = (userData) => {
  return authApi.post("/auth/register", userData);
};

// Logs in, 
export const login = async (credentials) => {
  const response = await authApi.post("/auth/login", credentials);
  const data = response.data?.data || {};
  localStorage.setItem("token", data.token);
  if (data.refreshToken) {
    localStorage.setItem("refreshToken", data.refreshToken);
  }
  if (data.roles) {
    localStorage.setItem("roles", JSON.stringify(data.roles));
  }
  if (data.expiresInMinutes) {
    localStorage.setItem("tokenExpiresInMinutes", data.expiresInMinutes);
  }
  return response;
};

// Refresh access token using refresh token
export const refreshToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }
  const response = await authApi.post("/auth/refresh", { refreshToken });
  const data = response.data?.data || {};
  const newToken = data.token;
  const newRefreshToken = data.refreshToken;
  
  localStorage.setItem("token", newToken);
  if (newRefreshToken) {
    localStorage.setItem("refreshToken", newRefreshToken);
  }
  
  authApi.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
  return response;
};

// Gets the current logged-in user's account and profile details
export const getCurrentUser = () => {
  return authApi.get("/auth/me", getAuthConfig());
};

// Updates the user's profile details (multipart/form-data for NID images)
export const updateProfile = (profileData, frontNidFile, backNidFile) => {
  const formData = new FormData();
  formData.append("FullName", profileData.fullName || "");
  formData.append("Address", profileData.address || "");
  formData.append("City", profileData.city || "");
  formData.append("NationalIdNumber", profileData.nationalId || "");
  formData.append("PhoneNumber", profileData.phoneNumber || "");

  if (frontNidFile) {formData.append("NationalIdFrontImage", frontNidFile);}
  if (backNidFile) {formData.append("NationalIdBackImage", backNidFile);}

  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "multipart/form-data",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  return authApi.put("/auth/me", formData, { headers });
};

// Changes the user's password
export const changePassword = (passwordData) => {
  return authApi.post("/auth/change-password", passwordData, getAuthConfig());
};

// Clears the token, roles, and expiration from the browser
export const logout = async () => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      await authApi.post("/auth/logout", { refreshToken });
    }
  } catch (err) {
    // Ignore errors, still clear local storage
    console.warn("Server logout failed:", err);
  }
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("roles");
  localStorage.removeItem("tokenExpiresInMinutes");
};

export default authApi;
