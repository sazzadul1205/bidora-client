
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Products from './pages/Products'

function App() {
  return (
    <BrowserRouter>
      <nav className="flex gap-6 bg-white p-5 shadow-sm">
        <Link to="/" className="text-blue-700 hover:underline">
          Products
        </Link>
        <Link to="/login" className="text-blue-700 hover:underline">
          Login
        </Link>
        <Link to="/register" className="text-blue-700 hover:underline">
          Register
        </Link>
      </nav>

      <Routes>
        <Route path="/" element={<Products />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
