import { BrowserRouter, Routes, Route } from 'react-router-dom'

import PublicLayout from './Layouts/PublicLayout/PublicLayout'
import Login from './pages/Auth/Login/Login'
import Register from './pages/Auth/Register/Register'
import Products from './pages/Products'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Wrap all public pages inside the layout */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Products />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App