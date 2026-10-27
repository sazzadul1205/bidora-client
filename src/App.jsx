import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicLayout from "./Layouts/PublicLayout/PublicLayout";
import AuthenticatedLayout from "./Layouts/AuthenticatedLayout/AuthenticatedLayout";
import Login from "./pages/Auth/Login/Login";
import Register from "./pages/Auth/Register/Register";
import Products from "./pages/Frontend/Products/Products";
import Auctions from "./pages/Frontend/Auctions/Auctions";
import AuctionDetails from "./pages/Frontend/AuctionDetails/AuctionDetails";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard/AdminDashboard";
import Users from "./pages/admin/Users/Users";
import AdminProducts from "./pages/admin/Products/AdminProducts";
import Deposits from "./pages/admin/Deposits/Deposits";
import Verifications from "./pages/admin/Verifications/Verifications";
import Disputes from "./pages/admin/Disputes/Disputes";
import Categories from "./pages/admin/Categories/Categories";
import EditProduct from "./pages/seller/EditProduct/EditProduct";
import ViewProduct from "./pages/seller/ViewProduct/ViewProduct";
import AdminAuction from "./pages/admin/Auctions/Auctions";
import PlatformWallet from "./pages/admin/Wallet/PlatformWallet";

// Buyer Pages
import BuyerDashboard from "./pages/buyer/Dashboard/BuyerDashboard";
import MyBids from "./pages/buyer/MyBids/MyBids";
import WonAuctions from "./pages/buyer/WonAuctions/WonAuctions";

// Seller Pages
import SellerDashboard from "./pages/seller/Dashboard/SellerDashboard";
import MyProducts from "./pages/seller/MyProducts/MyProducts";
import SellerAuctionView from "./pages/seller/SellerAuctionView/SellerAuctionView";
import CreateProduct from "./pages/seller/CreateProduct/CreateProduct";
import SellerSales from "./pages/seller/Sales/SellerSales";

// Shared / Guards / Layouts
import ProfileCompletionGuard from "./components/Auth/ProfileCompletionGuard";
import ProfilePending from "./pages/ProfilePending/ProfilePending";
import Wallet from "./pages/Wallet/Wallet";
import Settings from "./pages/Auth/Settings/Settings";
import AdminTransactions from "./pages/admin/Transactions/AdminTransactions";
import AdminSales from "./pages/admin/Sales/AdminSales";
import TermsOfUse from "./pages/Frontend/TermsOfUse/TermsOfUse";
import PrivacyPolicy from "./pages/Frontend/PrivacyPolicy/PrivacyPolicy";
import AboutUs from "./pages/Frontend/AboutUs/AboutUs";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Products />} />
          <Route path="/auctions" element={<Auctions />} />
          <Route path="/auction/:id" element={<AuctionDetails />} />
          <Route path="/terms" element={<TermsOfUse />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/about" element={<AboutUs />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Profile Pending Route (Outside Auth Layout) */}
        <Route path="/profile-pending" element={<ProfilePending />} />

        {/* Authenticated Routes */}
        <Route element={<AuthenticatedLayout />}>
          {/* ADMIN ROUTES */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<Users />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/deposits" element={<Deposits />} />
          <Route path="/admin/verifications" element={<Verifications />} />
          <Route path="/admin/auctions" element={<AdminAuction />} />
          <Route path="/admin/disputes" element={<Disputes />} />
          <Route path="/admin/categories" element={<Categories />} />
          <Route path="/admin/wallet" element={<PlatformWallet />} />
          <Route path="/admin/transactions" element={<AdminTransactions />} />
          <Route path="/admin/sales" element={<AdminSales />} />

          {/* BUYER ROUTES */}
          <Route
            path="/buyer/dashboard"
            element={
              <ProfileCompletionGuard>
                <BuyerDashboard />
              </ProfileCompletionGuard>
            }
          />
          <Route
            path="/buyer/bids"
            element={
              <ProfileCompletionGuard>
                <MyBids />
              </ProfileCompletionGuard>
            }
          />
          <Route
            path="/buyer/won"
            element={
              <ProfileCompletionGuard>
                <WonAuctions />
              </ProfileCompletionGuard>
            }
          />

          {/* SELLER ROUTES */}
          <Route
            path="/seller/dashboard"
            element={
              <ProfileCompletionGuard>
                <SellerDashboard />
              </ProfileCompletionGuard>
            }
          />
          <Route
            path="/seller/products"
            element={
              <ProfileCompletionGuard>
                <MyProducts />
              </ProfileCompletionGuard>
            }
          />
          <Route
            path="/seller/products/create"
            element={
              <ProfileCompletionGuard>
                <CreateProduct />
              </ProfileCompletionGuard>
            }
          />
          <Route
            path="/seller/products/edit/:id"
            element={
              <ProfileCompletionGuard>
                <EditProduct />
              </ProfileCompletionGuard>
            }
          />
          <Route
            path="/seller/products/view/:id"
            element={
              <ProfileCompletionGuard>
                <ViewProduct />
              </ProfileCompletionGuard>
            }
          />
          <Route
            path="/seller/sales"
            element={
              <ProfileCompletionGuard>
                <SellerSales />
              </ProfileCompletionGuard>
            }
          />
          <Route
            path="/seller/auctions/:id"
            element={
              <ProfileCompletionGuard>
                <SellerAuctionView />
              </ProfileCompletionGuard>
            }
          />

          {/* SHARED ROUTES */}
          <Route
            path="/wallet"
            element={
              <ProfileCompletionGuard>
                <Wallet />
              </ProfileCompletionGuard>
            }
          />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
