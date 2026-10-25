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
export const updateProfile = (profileData) => {
  return authApi.put('/auth/me', profileData, getAuthConfig())
}

// Changes the user's password. Backend expects { currentPassword, newPassword, confirmNewPassword }
export const changePassword = (passwordData) => {
  return authApi.post('/auth/change-password', passwordData, getAuthConfig())
}

// Clears the token from the browser
export const logout = () => {
  localStorage.removeItem('token')
}

export default authApi