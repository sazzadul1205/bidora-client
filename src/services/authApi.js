import axios from 'axios'

const authApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Helper to manually attach the Bearer token for protected routes
export const getAuthConfig = () => {
  const token = localStorage.getItem('token')
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {}
}

// --- Public Auth Endpoints ---

// Creates a new account. Backend expects { email, password, fullName, role ("Buyer" or "Seller") }
export const register = (userData) => {
  return authApi.post('/auth/register', userData)
}

// Logs in and saves the JWT token to localStorage for future requests
export const login = async (credentials) => {
  const response = await authApi.post('/auth/login', credentials)
  localStorage.setItem('token', response.data.token)
  return response
}


// Gets the current logged-in user's account and profile details
export const getCurrentUser = () => {
  return authApi.get('/auth/me', getAuthConfig())
}

// Updates the user's profile details (Name, Address, City, National ID, etc.)
// Sends multipart/form-data so the backend [FromForm] binding works and NID
// image files are uploaded alongside the text fields.
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
  
  // Explicitly set Content-Type to multipart/form-data, and add the Bearer token
  const headers = {
    "Content-Type": "multipart/form-data", 
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  return authApi.put("/auth/me", formData, { headers });
};

// Changes the user's password. Backend expects { currentPassword, newPassword, confirmNewPassword }
export const changePassword = (passwordData) => {
  return authApi.post('/auth/change-password', passwordData, getAuthConfig())
}

// Clears the token from the browser
export const logout = () => {
  localStorage.removeItem('token')
}

export default authApi