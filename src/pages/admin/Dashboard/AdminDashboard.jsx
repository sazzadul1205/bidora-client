import PageTitle from "../../../components/PageTitle";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminDashboard } from "../../../services/adminApi";
import {
  Users,
  Package,
  CreditCard,
  ShieldCheck,
  Gavel,
  Scale,
  Wallet,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { Skeleton } from "../../../components/Skeleton";
import { formatCurrency as formatMoney } from "../../../utils/currency";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getAdminDashboard();
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

  const totalPendingTasks =
    (data?.pendingProducts || 0) +
    (data?.pendingDeposits || 0) +
    (data?.pendingVerifications || 0) +
    (data?.openDisputes || 0);

  return (
    <>
      <PageTitle title="Admin Dashboard" />
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-bold text-text-main">Admin Dashboard</h1>
          <p className="text-sm text-text-muted mt-1">
            Platform overview and moderation queue.
          </p>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface p-5 rounded-xl border border-border-main shadow-sm flex items-center gap-4">
            <div className="p-3 bg-primary-50 text-primary-600 rounded-lg shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted">Total Users</p>
              <p className="text-2xl font-bold text-text-main">
                {data?.totalUsers || 0}
              </p>
            </div>
          </div>

          <div className="bg-surface p-5 rounded-xl border border-border-main shadow-sm flex items-center gap-4">
            <div className="p-3 bg-accent-50 text-accent-600 rounded-lg shrink-0">
              <Gavel className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted">
                Active Auctions
              </p>
              <p className="text-2xl font-bold text-text-main">
                {data?.activeAuctions || 0}
              </p>
            </div>
          </div>

          <div className="bg-surface p-5 rounded-xl border border-border-main shadow-sm flex items-center gap-4">
            <div
              className={`p-3 rounded-lg shrink-0 ${totalPendingTasks > 0 ? "bg-warning-50 text-warning-600" : "bg-neutral-50 text-neutral-400"}`}
            >
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted">
                Pending Tasks
              </p>
              <p className="text-2xl font-bold text-text-main">
                {totalPendingTasks}
              </p>
            </div>
          </div>

          <div className="bg-linear-to-br from-neutral-900 to-neutral-800 p-5 rounded-xl shadow-md text-text-inverse flex items-center gap-4">
            <div className="p-3 bg-surface/20 rounded-lg shrink-0">
              <Wallet className="w-6 h-6 text-text-inverse" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-300">
                Platform Revenue
              </p>
              <p className="text-2xl font-bold">
                {formatMoney(data?.platformBalance)}
              </p>
            </div>
          </div>
        </div>

        {/* MODERATION QUEUE */}
        <div className="bg-surface rounded-xl border border-border-main shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border-main flex items-center justify-between bg-neutral-50/50">
            <h2 className="text-base font-bold text-text-main">
              Moderation Queue
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border-main">
            <Link
              to="/admin/verifications"
              className="p-6 hover:bg-neutral-50 transition-colors block group"
            >
              <div className="flex items-center gap-3 mb-2">
                <ShieldCheck className="w-5 h-5 text-primary-600" />
                <p className="font-semibold text-text-main">Verifications</p>
              </div>
              <p className="text-3xl font-bold text-text-main mb-2">
                {data?.pendingVerifications || 0}
              </p>
              <span className="text-xs font-semibold text-primary-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                Review Profiles <ArrowRight className="w-3 h-3" />
              </span>
            </Link>

            <Link
              to="/admin/deposits"
              className="p-6 hover:bg-neutral-50 transition-colors block group"
            >
              <div className="flex items-center gap-3 mb-2">
                <CreditCard className="w-5 h-5 text-success-600" />
                <p className="font-semibold text-text-main">Deposits</p>
              </div>
              <p className="text-3xl font-bold text-text-main mb-2">
                {data?.pendingDeposits || 0}
              </p>
              <span className="text-xs font-semibold text-success-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                Review Deposits <ArrowRight className="w-3 h-3" />
              </span>
            </Link>

            <Link
              to="/admin/products"
              className="p-6 hover:bg-neutral-50 transition-colors block group"
            >
              <div className="flex items-center gap-3 mb-2">
                <Package className="w-5 h-5 text-accent-600" />
                <p className="font-semibold text-text-main">Products</p>
              </div>
              <p className="text-3xl font-bold text-text-main mb-2">
                {data?.pendingProducts || 0}
              </p>
              <span className="text-xs font-semibold text-accent-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                Review Products <ArrowRight className="w-3 h-3" />
              </span>
            </Link>

            <Link
              to="/admin/disputes"
              className="p-6 hover:bg-neutral-50 transition-colors block group"
            >
              <div className="flex items-center gap-3 mb-2">
                <Scale className="w-5 h-5 text-danger-600" />
                <p className="font-semibold text-text-main">Disputes</p>
              </div>
              <p className="text-3xl font-bold text-text-main mb-2">
                {data?.openDisputes || 0}
              </p>
              <span className="text-xs font-semibold text-danger-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                Resolve Disputes <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
