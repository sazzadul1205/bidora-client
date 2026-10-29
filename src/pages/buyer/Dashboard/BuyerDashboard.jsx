import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getBuyerDashboard } from "../../../services/buyerApi";
import {
  Gavel, Trophy, Wallet, AlertCircle,
  Search, ArrowRight, CheckCircle2
} from "lucide-react";
import { Skeleton } from "../../../components/Skeleton";
import { formatCurrency as formatMoney } from "../../../utils/currency";

export default function BuyerDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getBuyerDashboard();
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
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track your bids, wins, and wallet balance at a glance.
          </p>
        </div>
        <button
          onClick={() => navigate("/auctions")}
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          <Search className="w-4 h-4" /> Browse Auctions
        </button>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0">
            <Gavel className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Active Bids</p>
            <p className="text-2xl font-bold text-gray-900">{data?.activeBids || 0}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Leading</p>
            <p className="text-2xl font-bold text-green-700">{data?.leadingBids || 0}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Auctions Won</p>
            <p className="text-2xl font-bold text-gray-900">{data?.wonCount || 0}</p>
          </div>
        </div>

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

      {/* ALERTS */}
      {data?.awaitingPayment > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-amber-900">Action Required</h3>
              <p className="text-sm text-amber-800 mt-0.5">
                You have {data.awaitingPayment} won auction(s) awaiting payment. Please complete payment to secure your items.
              </p>
            </div>
          </div>
          <Link to="/buyer/won" className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm shrink-0">
            Pay Now
          </Link>
        </div>
      )}

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/buyer/bids" className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all group">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-50 p-2.5 rounded-lg group-hover:bg-blue-100 transition-colors">
              <Gavel className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900">My Bids</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">View your active bids and track your bidding history.</p>
          <span className="text-sm font-semibold text-blue-600 flex items-center gap-1 group-hover:gap-2 transition-all">
            View Bids <ArrowRight className="w-4 h-4" />
          </span>
        </Link>

        <Link to="/buyer/won" className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-green-300 hover:shadow-md transition-all group">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-green-50 p-2.5 rounded-lg group-hover:bg-green-100 transition-colors">
              <Trophy className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900">Won Auctions</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">Pay for your wins, confirm delivery, and manage disputes.</p>
          <span className="text-sm font-semibold text-green-600 flex items-center gap-1 group-hover:gap-2 transition-all">
            View Wins <ArrowRight className="w-4 h-4" />
          </span>
        </Link>

        <Link to="/wallet" className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-purple-300 hover:shadow-md transition-all group">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-purple-50 p-2.5 rounded-lg group-hover:bg-purple-100 transition-colors">
              <Wallet className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900">Wallet</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">Manage funds, view transactions, and request deposits.</p>
          <span className="text-sm font-semibold text-purple-600 flex items-center gap-1 group-hover:gap-2 transition-all">
            Open Wallet <ArrowRight className="w-4 h-4" />
          </span>
        </Link>
      </div>

      {/* SUMMARY */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="text-base font-bold text-gray-900">Account Summary</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          <div className="p-6 text-center">
            <p className="text-sm font-medium text-gray-500 mb-1">Total Spent</p>
            <p className="text-3xl font-bold text-gray-900">{formatMoney(data?.totalSpent)}</p>
          </div>
          <div className="p-6 text-center">
            <p className="text-sm font-medium text-gray-500 mb-1">Reserved Funds</p>
            <p className="text-3xl font-bold text-orange-600">{formatMoney(data?.reservedBalance)}</p>
          </div>
          <div className="p-6 text-center">
            <p className="text-sm font-medium text-gray-500 mb-1">Awaiting Payment</p>
            <p className="text-3xl font-bold text-blue-600">{data?.awaitingPayment || 0}</p>
          </div>
        </div>
      </div>

    </div>
  );
}