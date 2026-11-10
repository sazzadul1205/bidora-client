import PageTitle from "../../../components/PageTitle";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getBuyerDashboard } from "../../../services/buyerApi";
import {
  Gavel,
  Trophy,
  Wallet,
  AlertCircle,
  Search,
  ArrowRight,
  CheckCircle2,
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
      </div>
    );
  }

  return (
    <>
      <PageTitle title="Buyer Dashboard" />
      <div className="max-w-6xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-main">Welcome back!</h1>
            <p className="text-sm text-text-muted mt-1">
              Track your bids, wins, and wallet balance at a glance.
            </p>
          </div>
          <button
            onClick={() => navigate("/auctions")}
            className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-text-inverse px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
          >
            <Search className="w-4 h-4" /> Browse Auctions
          </button>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface p-5 rounded-xl border border-border-main shadow-sm flex items-center gap-4">
            <div className="p-3 bg-primary-50 text-primary-600 rounded-lg shrink-0">
              <Gavel className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted">Active Bids</p>
              <p className="text-2xl font-bold text-text-main">
                {data?.activeBids || 0}
              </p>
            </div>
          </div>

          <div className="bg-surface p-5 rounded-xl border border-border-main shadow-sm flex items-center gap-4">
            <div className="p-3 bg-success-50 text-success-600 rounded-lg shrink-0">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted">Leading</p>
              <p className="text-2xl font-bold text-success-700">
                {data?.leadingBids || 0}
              </p>
            </div>
          </div>

          <div className="bg-surface p-5 rounded-xl border border-border-main shadow-sm flex items-center gap-4">
            <div className="p-3 bg-accent-50 text-accent-600 rounded-lg shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted">
                Auctions Won
              </p>
              <p className="text-2xl font-bold text-text-main">
                {data?.wonCount || 0}
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

        {/* ALERTS */}
        {data?.awaitingPayment > 0 && (
          <div className="bg-warning-50 border border-warning-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-warning-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-warning-900">
                  Action Required
                </h3>
                <p className="text-sm text-warning-800 mt-0.5">
                  You have {data.awaitingPayment} won auction(s) awaiting
                  payment. Please complete payment to secure your items.
                </p>
              </div>
            </div>
            <Link
              to="/buyer/won"
              className="px-4 py-2 bg-warning-600 hover:bg-warning-700 text-text-inverse text-xs font-semibold rounded-lg transition-colors shadow-sm shrink-0"
            >
              Pay Now
            </Link>
          </div>
        )}

        {/* QUICK ACTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/buyer/bids"
            className="bg-surface p-5 rounded-xl border border-border-main shadow-sm hover:border-primary-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-primary-50 p-2.5 rounded-lg group-hover:bg-primary-100 transition-colors">
                <Gavel className="w-5 h-5 text-primary-600" />
              </div>
              <h3 className="font-bold text-text-main">My Bids</h3>
            </div>
            <p className="text-sm text-text-muted mb-4">
              View your active bids and track your bidding history.
            </p>
            <span className="text-sm font-semibold text-primary-600 flex items-center gap-1 group-hover:gap-2 transition-all">
              View Bids <ArrowRight className="w-4 h-4" />
            </span>
          </Link>

          <Link
            to="/buyer/won"
            className="bg-surface p-5 rounded-xl border border-border-main shadow-sm hover:border-success-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-success-50 p-2.5 rounded-lg group-hover:bg-success-100 transition-colors">
                <Trophy className="w-5 h-5 text-success-600" />
              </div>
              <h3 className="font-bold text-text-main">Won Auctions</h3>
            </div>
            <p className="text-sm text-text-muted mb-4">
              Pay for your wins, confirm delivery, and manage disputes.
            </p>
            <span className="text-sm font-semibold text-success-600 flex items-center gap-1 group-hover:gap-2 transition-all">
              View Wins <ArrowRight className="w-4 h-4" />
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
              <h3 className="font-bold text-text-main">Wallet</h3>
            </div>
            <p className="text-sm text-text-muted mb-4">
              Manage funds, view transactions, and request deposits.
            </p>
            <span className="text-sm font-semibold text-accent-600 flex items-center gap-1 group-hover:gap-2 transition-all">
              Open Wallet <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </div>

        {/* SUMMARY */}
        <div className="bg-surface rounded-xl border border-border-main shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border-main flex items-center justify-between bg-neutral-50/50">
            <h2 className="text-base font-bold text-text-main">
              Account Summary
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border-main">
            <div className="p-6 text-center">
              <p className="text-sm font-medium text-text-muted mb-1">
                Total Spent
              </p>
              <p className="text-3xl font-bold text-text-main">
                {formatMoney(data?.totalSpent)}
              </p>
            </div>
            <div className="p-6 text-center">
              <p className="text-sm font-medium text-text-muted mb-1">
                Reserved Funds
              </p>
              <p className="text-3xl font-bold text-warning-600">
                {formatMoney(data?.reservedBalance)}
              </p>
            </div>
            <div className="p-6 text-center">
              <p className="text-sm font-medium text-text-muted mb-1">
                Awaiting Payment
              </p>
              <p className="text-3xl font-bold text-primary-600">
                {data?.awaitingPayment || 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
