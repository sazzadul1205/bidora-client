import axios from "axios";

const authApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper to attach the Bearer token
export const getAuthConfig = () => {
  const token = localStorage.getItem("token");
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

// Public Auth Endpoints

export const register = async (userData) => {
  const response = await authApi.post("/auth/register", userData);
  const data = response.data?.data || {};
  if (data.token) {
    localStorage.setItem("token", data.token);
  }
  if (data.refreshToken) {
    localStorage.setItem("refreshToken", data.refreshToken);
  }
  if (data.roles) {
    localStorage.setItem("roles", JSON.stringify(data.roles));
  }
  localStorage.setItem("profileSetupRequired", String(!!data.profileSetupRequired));
  return response;
};

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
  localStorage.setItem("profileSetupRequired", String(!!data.profileSetupRequired));
  return response;
};

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

  return response;
};

export const getCurrentUser = () => {
  return authApi.get("/auth/me", getAuthConfig());
};

export const setupProfile = async (profileData) => {
  const token = localStorage.getItem("token");
  const response = await authApi.post(
    "/profile/setup",
    profileData,
    token ? { headers: { Authorization: `Bearer ${token}` } } : {},
  );
  const data = response.data?.data || {};
  if (data.token) {
    localStorage.setItem("token", data.token);
  }
  if (data.refreshToken) {
    localStorage.setItem("refreshToken", data.refreshToken);
  }
  if (data.roles) {
    localStorage.setItem("roles", JSON.stringify(data.roles));
  }
  localStorage.setItem("profileSetupRequired", String(!!data.profileSetupRequired));
  return response;
};

export const updateProfile = (profileData, frontNidFile, backNidFile) => {
  const formData = new FormData();
  formData.append("FullName", profileData.fullName || "");
  formData.append("Address", profileData.address || "");
  formData.append("City", profileData.city || "");
  formData.append("NationalIdNumber", profileData.nationalId || "");
  formData.append("PhoneNumber", profileData.phoneNumber || "");

  if (frontNidFile) { formData.append("NationalIdFrontImage", frontNidFile); }
  if (backNidFile) { formData.append("NationalIdBackImage", backNidFile); }

  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "multipart/form-data",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  return authApi.put("/auth/me", formData, { headers });
};

export const changePassword = (passwordData) => {
  return authApi.post("/auth/change-password", passwordData, getAuthConfig());
};

export const logout = async () => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      await authApi.post("/auth/logout", { refreshToken });
    }
  } catch (err) {
    console.error(err);
    
    // Ignore errors, still clear local storage
  }
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("roles");
  localStorage.removeItem("tokenExpiresInMinutes");
  localStorage.removeItem("profileSetupRequired");
};

export default authApi;