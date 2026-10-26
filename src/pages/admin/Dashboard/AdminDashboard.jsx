import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminDashboard } from "../../../services/adminApi";
import {
  Users, Package, CreditCard, ShieldCheck,
  Gavel, Scale, Wallet, AlertCircle, ArrowRight
} from "lucide-react";
import { Skeleton } from "../../../components/Skeleton";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getAdminDashboard();
        if (mounted) setData(res.data.data);
      } catch (err) {
        console.error("Failed to load dashboard", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64 mb-2" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const formatMoney = (num) =>
    `$${Number(num || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const totalPendingTasks =
    (data?.pendingProducts || 0) +
    (data?.pendingDeposits || 0) +
    (data?.pendingVerifications || 0) +
    (data?.openDisputes || 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Platform overview and moderation queue.
        </p>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Users</p>
            <p className="text-2xl font-bold text-gray-900">{data?.totalUsers || 0}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg shrink-0">
            <Gavel className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Active Auctions</p>
            <p className="text-2xl font-bold text-gray-900">{data?.activeAuctions || 0}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className={`p-3 rounded-lg shrink-0 ${totalPendingTasks > 0 ? 'bg-orange-50 text-orange-600' : 'bg-gray-50 text-gray-400'}`}>
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Pending Tasks</p>
            <p className="text-2xl font-bold text-gray-900">{totalPendingTasks}</p>
          </div>
        </div>

        <div className="bg-linear-to-br from-gray-900 to-gray-800 p-5 rounded-xl shadow-md text-white flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-lg shrink-0">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-300">Platform Revenue</p>
            <p className="text-2xl font-bold">{formatMoney(data?.platformBalance)}</p>
          </div>
        </div>
      </div>

      {/* MODERATION QUEUE */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="text-base font-bold text-gray-900">Moderation Queue</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-100">

          <Link to="/admin/verifications" className="p-6 hover:bg-gray-50 transition-colors block group">
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <p className="font-semibold text-gray-900">Verifications</p>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">{data?.pendingVerifications || 0}</p>
            <span className="text-xs font-semibold text-blue-600 flex items-center gap-1 group-hover:gap-2 transition-all">
              Review Profiles <ArrowRight className="w-3 h-3" />
            </span>
          </Link>

          <Link to="/admin/deposits" className="p-6 hover:bg-gray-50 transition-colors block group">
            <div className="flex items-center gap-3 mb-2">
              <CreditCard className="w-5 h-5 text-green-600" />
              <p className="font-semibold text-gray-900">Deposits</p>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">{data?.pendingDeposits || 0}</p>
            <span className="text-xs font-semibold text-green-600 flex items-center gap-1 group-hover:gap-2 transition-all">
              Review Deposits <ArrowRight className="w-3 h-3" />
            </span>
          </Link>

          <Link to="/admin/products" className="p-6 hover:bg-gray-50 transition-colors block group">
            <div className="flex items-center gap-3 mb-2">
              <Package className="w-5 h-5 text-purple-600" />
              <p className="font-semibold text-gray-900">Products</p>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">{data?.pendingProducts || 0}</p>
            <span className="text-xs font-semibold text-purple-600 flex items-center gap-1 group-hover:gap-2 transition-all">
              Review Products <ArrowRight className="w-3 h-3" />
            </span>
          </Link>

          <Link to="/admin/disputes" className="p-6 hover:bg-gray-50 transition-colors block group">
            <div className="flex items-center gap-3 mb-2">
              <Scale className="w-5 h-5 text-red-600" />
              <p className="font-semibold text-gray-900">Disputes</p>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">{data?.openDisputes || 0}</p>
            <span className="text-xs font-semibold text-red-600 flex items-center gap-1 group-hover:gap-2 transition-all">
              Resolve Disputes <ArrowRight className="w-3 h-3" />
            </span>
          </Link>

        </div>
      </div>

    </div>
  );
}