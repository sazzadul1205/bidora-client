import PageTitle from "../../../components/PageTitle";
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
  AlertCircle,
} from "lucide-react";
import { Skeleton } from "../../../components/Skeleton";
import { formatCurrency as formatMoney } from "../../../utils/currency";

export default function SellerDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getSellerDashboard();
        if (mounted) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load dashboard", err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <>
      <PageTitle title="Seller Dashboard" />
      <div className="max-w-6xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-main">
              Seller Dashboard
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Track your products, auctions, and earnings at a glance.
            </p>
          </div>
          <button
            onClick={() => navigate("/seller/products/create")}
            className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-text-inverse px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> List New Item
          </button>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface p-5 rounded-xl border border-border-main shadow-sm flex items-center gap-4">
            <div className="p-3 bg-primary-50 text-primary-600 rounded-lg shrink-0">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted">
                Total Listings
              </p>
              <p className="text-2xl font-bold text-text-main">
                {data?.totalProducts || 0}
              </p>
            </div>
          </div>

          <div className="bg-surface p-5 rounded-xl border border-border-main shadow-sm flex items-center gap-4">
            <div className="p-3 bg-accent-50 text-accent-600 rounded-lg shrink-0">
              <Gavel className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted">
                Live Auctions
              </p>
              <p className="text-2xl font-bold text-text-main">
                {data?.activeAuctions || 0}
              </p>
            </div>
          </div>

          <div className="bg-surface p-5 rounded-xl border border-border-main shadow-sm flex items-center gap-4">
            <div className="p-3 bg-success-50 text-success-600 rounded-lg shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted">
                Total Earnings
              </p>
              <p className="text-2xl font-bold text-text-main">
                {formatMoney(data?.totalEarnings)}
              </p>
            </div>
          </div>

          <div className="bg-linear-to-br from-primary-600 to-primary-700 p-5 rounded-xl shadow-md text-text-inverse flex items-center gap-4">
            <div className="p-3 bg-surface/20 rounded-lg shrink-0">
              <Wallet className="w-6 h-6 text-text-inverse" />
            </div>
            <div>
              <p className="text-sm font-medium text-primary-100">
                Available Balance
              </p>
              <p className="text-2xl font-bold">
                {formatMoney(Math.max(0, data?.availableBalance || 0))}
              </p>
            </div>
          </div>
        </div>

        {/* ALERTS / ACTION REQUIRED */}
        {data?.awaitingDispatch > 0 && (
          <div className="bg-warning-50 border border-warning-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-warning-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-warning-900">
                  Action Required
                </h3>
                <p className="text-sm text-warning-800 mt-0.5">
                  {data.awaitingDispatch > 0 &&
                    `${data.awaitingDispatch} sale(s) awaiting dispatch.`}
                </p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              {data.awaitingDispatch > 0 && (
                <Link
                  to="/seller/sales"
                  className="px-3 py-1.5 bg-warning-600 hover:bg-warning-700 text-text-inverse text-xs font-semibold rounded-lg transition-colors shadow-sm"
                >
                  Dispatch Sales
                </Link>
              )}
            </div>
          </div>
        )}

        {/* QUICK ACTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/seller/products"
            className="bg-surface p-5 rounded-xl border border-border-main shadow-sm hover:border-primary-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-primary-50 p-2.5 rounded-lg group-hover:bg-primary-100 transition-colors">
                <Package className="w-5 h-5 text-primary-600" />
              </div>
              <h3 className="font-bold text-text-main">Manage Products</h3>
            </div>
            <p className="text-sm text-text-muted mb-4">
              View drafts, track approval status, and edit your listings.
            </p>
            <span className="text-sm font-semibold text-primary-600 flex items-center gap-1 group-hover:gap-2 transition-all">
              Go to Products <ArrowRight className="w-4 h-4" />
            </span>
          </Link>

          <Link
            to="/seller/sales"
            className="bg-surface p-5 rounded-xl border border-border-main shadow-sm hover:border-success-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-success-50 p-2.5 rounded-lg group-hover:bg-success-100 transition-colors">
                <TrendingUp className="w-5 h-5 text-success-600" />
              </div>
              <h3 className="font-bold text-text-main">My Sales</h3>
            </div>
            <p className="text-sm text-text-muted mb-4">
              Track your sold items, dispatch orders, and view revenue.
            </p>
            <span className="text-sm font-semibold text-success-600 flex items-center gap-1 group-hover:gap-2 transition-all">
              View Sales <ArrowRight className="w-4 h-4" />
            </span>
          </Link>

          <Link
            to="/wallet"
            className="bg-surface p-5 rounded-xl border border-border-main shadow-sm hover:border-accent-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-accent-50 p-2.5 rounded-lg group-hover:bg-accent-100 transition-colors">
                <Wallet className="w-5 h-5 text-accent-600" />
              </div>
              <h3 className="font-bold text-text-main">Wallet & Deposits</h3>
            </div>
            <p className="text-sm text-text-muted mb-4">
              Manage your funds, view transactions, and request deposits.
            </p>
            <span className="text-sm font-semibold text-accent-600 flex items-center gap-1 group-hover:gap-2 transition-all">
              Open Wallet <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </div>

        {/* SALES SUMMARY */}
        <div className="bg-surface rounded-xl border border-border-main shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border-main flex items-center justify-between bg-neutral-50/50">
            <h2 className="text-base font-bold text-text-main">
              Sales Summary
            </h2>
            <Link
              to="/seller/sales"
              className="text-sm text-primary-600 font-medium hover:underline"
            >
              View All Sales
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border-main">
            <div className="p-6 text-center">
              <p className="text-sm font-medium text-text-muted mb-1">
                Completed Orders
              </p>
              <p className="text-3xl font-bold text-text-main">
                {data?.soldCount || 0}
              </p>
            </div>
            <div className="p-6 text-center">
              <p className="text-sm font-medium text-text-muted mb-1">
                Awaiting Dispatch
              </p>
              <p className="text-3xl font-bold text-warning-600">
                {data?.awaitingDispatch || 0}
              </p>
            </div>
            <div className="p-6 text-center">
              <p className="text-sm font-medium text-text-muted mb-1">
                Approved Products
              </p>
              <p className="text-3xl font-bold text-success-600">
                {data?.approved || 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
