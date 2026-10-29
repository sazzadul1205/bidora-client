import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getSellerDashboard } from "../../../services/sellerApi";
import {
  Package,
  Gavel,
  DollarSign,
  Plus,
  ArrowRight,
  TrendingUp,
  Wallet,
  AlertCircle
} from "lucide-react";
import { Skeleton } from "../../../components/Skeleton";

export default function SellerDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getSellerDashboard();
        if (mounted) setData(res.data.data);
      } catch (err) {
        console.error("Failed to load dashboard", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      </div>
    );
  }

  const formatMoney = (num) =>
    `৳${Number(num || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track your products, auctions, and earnings at a glance.
          </p>
        </div>
        <button
          onClick={() => navigate("/seller/products/create")}
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> List New Item
        </button>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Listings */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Listings</p>
            <p className="text-2xl font-bold text-gray-900">{data?.totalProducts || 0}</p>
          </div>
        </div>

        {/* Active Auctions */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg shrink-0">
            <Gavel className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Live Auctions</p>
            <p className="text-2xl font-bold text-gray-900">{data?.activeAuctions || 0}</p>
          </div>
        </div>

        {/* Total Earnings */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Earnings</p>
            <p className="text-2xl font-bold text-gray-900">{formatMoney(data?.totalEarnings)}</p>
          </div>
        </div>

        {/* Wallet Balance */}
        <div className="bg-linear-to-br from-blue-600 to-blue-700 p-5 rounded-xl shadow-md text-white flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-lg shrink-0">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-blue-100">Available Balance</p>
            <p className="text-2xl font-bold">{formatMoney(Math.max(0, data?.availableBalance || 0))}</p>
          </div>
        </div>
      </div>

      {/* ALERTS / ACTION REQUIRED */}
      {(data?.awaitingDispatch > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-amber-900">Action Required</h3>
              <p className="text-sm text-amber-800 mt-0.5">
                {data.awaitingDispatch > 0 && `${data.awaitingDispatch} sale(s) awaiting dispatch.`}
              </p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            {data.awaitingDispatch > 0 && (
              <Link to="/seller/sales" className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm">
                Dispatch Sales
              </Link>
            )}
          </div>
        </div>
      )}

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/seller/products" className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all group">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-50 p-2.5 rounded-lg group-hover:bg-blue-100 transition-colors">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900">Manage Products</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">View drafts, track approval status, and edit your listings.</p>
          <span className="text-sm font-semibold text-blue-600 flex items-center gap-1 group-hover:gap-2 transition-all">
            Go to Products <ArrowRight className="w-4 h-4" />
          </span>
        </Link>

        <Link to="/seller/sales" className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-green-300 hover:shadow-md transition-all group">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-green-50 p-2.5 rounded-lg group-hover:bg-green-100 transition-colors">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900">My Sales</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">Track your sold items, dispatch orders, and view revenue.</p>
          <span className="text-sm font-semibold text-green-600 flex items-center gap-1 group-hover:gap-2 transition-all">
            View Sales <ArrowRight className="w-4 h-4" />
          </span>
        </Link>

        <Link to="/wallet" className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-purple-300 hover:shadow-md transition-all group">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-purple-50 p-2.5 rounded-lg group-hover:bg-purple-100 transition-colors">
              <Wallet className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900">Wallet & Deposits</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">Manage your funds, view transactions, and request deposits.</p>
          <span className="text-sm font-semibold text-purple-600 flex items-center gap-1 group-hover:gap-2 transition-all">
            Open Wallet <ArrowRight className="w-4 h-4" />
          </span>
        </Link>
      </div>

      {/* SALES SUMMARY */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="text-base font-bold text-gray-900">Sales Summary</h2>
          <Link to="/seller/sales" className="text-sm text-blue-600 font-medium hover:underline">
            View All Sales
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          <div className="p-6 text-center">
            <p className="text-sm font-medium text-gray-500 mb-1">Completed Orders</p>
            <p className="text-3xl font-bold text-gray-900">{data?.soldCount || 0}</p>
          </div>
          <div className="p-6 text-center">
            <p className="text-sm font-medium text-gray-500 mb-1">Awaiting Dispatch</p>
            <p className="text-3xl font-bold text-orange-600">{data?.awaitingDispatch || 0}</p>
          </div>
          <div className="p-6 text-center">
            <p className="text-sm font-medium text-gray-500 mb-1">Approved Products</p>
            <p className="text-3xl font-bold text-green-600">{data?.approved || 0}</p>
          </div>
        </div>
      </div>

    </div>
  );
}