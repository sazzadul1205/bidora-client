import { BrowserRouter, Routes, Route } from 'react-router-dom'
import PublicLayout from './Layouts/PublicLayout/PublicLayout'
import AuthenticatedLayout from './Layouts/AuthenticatedLayout/AuthenticatedLayout'
import Login from './pages/Auth/Login/Login'
import Register from './pages/Auth/Register/Register'
import Products from './pages/Products'
import Dashboard from './pages/Dashboard'
import SellerDashboard from './pages/SellerDashboard'

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard/AdminDashboard'
import Users from './pages/admin/Users/Users'
import AdminProducts from './pages/admin/Products/AdminProducts'
import Deposits from './pages/admin/Deposits/Deposits'
import Verifications from './pages/admin/Verifications/Verifications'
import Auctions from './pages/admin/Auctions/Auctions'
import Disputes from './pages/admin/Disputes/Disputes'
import Categories from './pages/admin/Categories/Categories'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Products />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Authenticated Routes */}
        <Route element={<AuthenticatedLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/seller-dashboard" element={<SellerDashboard />} />
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<Users />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/deposits" element={<Deposits />} />
          <Route path="/admin/verifications" element={<Verifications />} />
          <Route path="/admin/auctions" element={<Auctions />} />
          <Route path="/admin/disputes" element={<Disputes />} />
          <Route path="/admin/categories" element={<Categories />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App