import axios from 'axios'

const authApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// --- DEBUG LOGGING (remove later when stable) ---
const DEBUG = true
const reqLog = (cfg) => {
  if (!DEBUG) return
  console.log('%c[API REQUEST]', 'color: #2563eb; font-weight: bold', {
    method: cfg.method?.toUpperCase(),
    url: cfg.url,
    params: cfg.params,
    data: cfg.data,
    headers: cfg.headers,
  })
  console.log('%c[API REQUEST RAW]', 'color: #2563eb; font-weight: bold',
    'URL:', cfg.method?.toUpperCase(), cfg.url,
    '\nPAYLOAD:', JSON.stringify(cfg.data, null, 2),
    '\nHEADERS:', JSON.stringify(cfg.headers, null, 2)
  )
}
const resLog = (res) => {
  if (!DEBUG) return
  console.log('%c[API RESPONSE]', 'color: #16a34a; font-weight: bold', {
    url: res.config?.url,
    status: res.status,
    data: res.data,
  })
  console.log('%c[API RESPONSE RAW]', 'color: #16a34a; font-weight: bold',
    'URL:', res.config?.url,
    '\nSTATUS:', res.status,
    '\nBODY:', JSON.stringify(res.data, null, 2)
  )
}
const errLog = (err) => {
  if (!DEBUG) return
  console.log('%c[API ERROR RAW]', 'color: #dc2626; font-weight: bold',
    'URL:', err.config?.url,
    '\nSTATUS:', err.response?.status,
    '\nREQUEST BODY:', JSON.stringify(err.config?.data, null, 2),
    '\nRESPONSE BODY:', JSON.stringify(err.response?.data, null, 2),
    '\nERROR MESSAGE:', err.message
  )
}
authApi.interceptors.request.use(
  (cfg) => { reqLog(cfg); return cfg },
  (err) => { errLog(err); return Promise.reject(err) }
)
authApi.interceptors.response.use(
  (res) => { resLog(res); return res },
  (err) => { errLog(err); return Promise.reject(err) }
)
// -------------------------------------------

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