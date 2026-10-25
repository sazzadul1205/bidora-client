import axios from 'axios'

const authApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Small helper to build the auth header from the saved token.
const authHeader = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Register a new Buyer or Seller.
export const register = (userData) => {
  return authApi.post('/auth/register', userData)
}

// Log in and save the JWT.
export const login = async (credentials) => {
  const response = await authApi.post('/auth/login', credentials)

  localStorage.setItem('token', response.data.token)

  return response
}

// Retrieve the logged-in user's account and profile.
export const getCurrentUser = () => {
  return authApi.get('/auth/me', { headers: authHeader() })
}

// Update the logged-in user's profile.
export const updateProfile = (profileData) => {
  return authApi.put('/auth/me', profileData, { headers: authHeader() })
}

// Change the logged-in user's password.
export const changePassword = (passwordData) => {
  return authApi.post('/auth/change-password', passwordData, { headers: authHeader() })
}

// Log out locally.
export const logout = () => {
  localStorage.removeItem('token')
}

export default authApi