import { Outlet } from "react-router-dom";
import Navbar from "../../Shared/Navbar/Navbar";
import Footer from "../../Shared/Footer/Footer";
import OfflineBanner from "../../components/OfflineBanner";

function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFBFC]">
      <OfflineBanner />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default PublicLayout;
