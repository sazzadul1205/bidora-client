import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicLayout from "./Layouts/PublicLayout/PublicLayout";
import AuthenticatedLayout from "./Layouts/AuthenticatedLayout/AuthenticatedLayout";
import Login from "./pages/Auth/Login/Login";
import Register from "./pages/Auth/Register/Register";
import Products from "./pages/Products/Products";
import Dashboard from "./pages/Dashboard";
import SellerDashboard from "./pages/SellerDashboard";
import BuyerDashboard from "./pages/buyer/Dashboard/BuyerDashboard";
import MyBids from "./pages/buyer/MyBids/MyBids";
import WonAuctions from "./pages/buyer/WonAuctions/WonAuctions";
import MyProducts from "./pages/seller/MyProducts/MyProducts";
import SellerAuctionView from "./pages/seller/SellerAuctionView/SellerAuctionView";
import CreateProduct from "./pages/seller/CreateProduct/CreateProduct";
import SellerSales from "./pages/seller/Sales/SellerSales";
import Settings from "./pages/Auth/Settings/Settings";
import Auctions from "./pages/Auctions/Auctions";
import AuctionDetails from "./pages/AuctionDetails/AuctionDetails";

import ProfileCompletionGuard from "./components/Auth/ProfileCompletionGuard";
import ProfilePending from "./pages/ProfilePending/ProfilePending";
import Wallet from "./pages/Wallet/Wallet";

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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Products />} />
          <Route path="/auctions" element={<Auctions />} />
          <Route path="/auction/:id" element={<AuctionDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Profile Pending Route */}
        <Route path="/profile-pending" element={<ProfilePending />} />

        {/* Authenticated Routes */}
        <Route element={<AuthenticatedLayout />}>
          {/* ADMIN ROUTES */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<Users />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/deposits" element={<Deposits />} />
          <Route path="/admin/verifications" element={<Verifications />} />
          <Route path="/admin/auctions" element={<AdminAuction />} />
          <Route path="/admin/disputes" element={<Disputes />} />
          <Route path="/admin/categories" element={<Categories />} />

          {/* BUYER ROUTES */}
          <Route
            path="/buyer"
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
          <Route
            path="/dashboard"
            element={
              <ProfileCompletionGuard>
                <Dashboard />
              </ProfileCompletionGuard>
            }
          />
          <Route
            path="/wallet"
            element={
              <ProfileCompletionGuard>
                <Wallet />
              </ProfileCompletionGuard>
            }
          />

          {/* SELLER ROUTES */}
          <Route
            path="/seller"
            element={
              <ProfileCompletionGuard>
                <SellerDashboard />
              </ProfileCompletionGuard>
            }
          />
          <Route
            path="/seller-dashboard"
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

          {/* Account Settings */}
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
