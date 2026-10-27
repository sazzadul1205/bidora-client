import axios from "axios";

const authApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// DEBUG LOGGING
const DEBUG = true;
const reqLog = (cfg) => {
  if (!DEBUG) return;
  console.log("%c[API REQUEST]", "color: #2563eb; font-weight: bold", {
    method: cfg.method?.toUpperCase(),
    url: cfg.url,
    params: cfg.params,
    data: cfg.data,
  });
};

const resLog = (res) => {
  if (!DEBUG) return;
  console.log("%c[API RESPONSE]", "color: #16a34a; font-weight: bold", {
    url: res.config?.url,
    status: res.status,
    data: res.data,
  });
};
const errLog = (err) => {
  if (!DEBUG) return;
  console.log("%c[API ERROR]", "color: #dc2626; font-weight: bold", {
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
authApi.interceptors.response.use(
  (res) => {
    resLog(res);
    return res;
  },
  (err) => {
    errLog(err);
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

// Logs in, saves the JWT token AND roles to localStorage.
export const login = async (credentials) => {
  const response = await authApi.post("/auth/login", credentials);
  localStorage.setItem("token", response.data.token);
  if (response.data.roles) {
    localStorage.setItem("roles", JSON.stringify(response.data.roles));
  }
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

  if (frontNidFile) formData.append("NationalIdFrontImage", frontNidFile);
  if (backNidFile) formData.append("NationalIdBackImage", backNidFile);

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

// Clears the token and roles from the browser
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("roles"); 
};

export default authApi;
