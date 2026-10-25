import { Outlet } from "react-router-dom"
import Navbar from "../../Shared/Navbar/Navbar"
import Footer from "../../Shared/Footer/Footer"


function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFBFC]">
      <Navbar />
      {/* Removed 'flex items-center' so long pages scroll normally */}
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default PublicLayout