import { useEffect, useState } from "react";
import {
  Wallet as WalletIcon,
  History,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Receipt,
} from "lucide-react";
import adminApi from "../../../services/adminApi";
import { Skeleton } from "../../../components/Skeleton";
import Pagination from "../../../components/Pagination/Pagination";

export default function PlatformWallet() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Search + type filter
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterType, setFilterType] = useState("All");

  // Server-side pagination for transactions
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalTx, setTotalTx] = useState(0);

  // Debounce the search box
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Fetch whenever page / size / search / filter changes
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await adminApi.getPlatformWallet({
          page,
          pageSize,
          search: debouncedSearch || undefined,
          filter: filterType !== "All" ? filterType : undefined,
        });
        if (cancelled) return;
        const d = res.data.data;
        setData({
          wallet: d.wallet,
          transactions: d.transactions?.items || [],
        });
        setTotalTx(d.transactions?.totalCount || 0);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [page, pageSize, debouncedSearch, filterType]);

  // Pagination handlers
  const goToPage = (p) => {
    if (p === page) return;
    setLoading(true);
    setPage(p);
  };

  const changePageSize = (s) => {
    if (s === pageSize) return;
    setLoading(true);
    setPageSize(s);
    setPage(1);
  };

  // Search / filter reset page inline
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
    setLoading(true);
  };

  const handleTypeChange = (type) => {
    if (type === filterType) return;
    setFilterType(type);
    setPage(1);
    setLoading(true);
  };

  const formatMoney = (n) =>
    `$${Number(n || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading && !data) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-64 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  const wallet = data?.wallet || {};
  const txs = data?.transactions || [];

  const balance = wallet?.balance ?? wallet?.Balance ?? 0;
  const reserved = wallet?.reservedBalance ?? wallet?.ReservedBalance ?? 0;

  const tabTypes = ["All", "Penalty", "Commission"];

  const getTxStyle = (type) => {
    switch (type) {
      case "Credit":
      case "Release":
        return {
          color: "text-green-700 bg-green-50 border-green-200",
          icon: ArrowUpRight,
          sign: "+",
        };
      case "Debit":
      case "Penalty":
        return {
          color: "text-red-700 bg-red-50 border-red-200",
          icon: ArrowDownRight,
          sign: "-",
        };
      case "Commission":
        return {
          color: "text-purple-700 bg-purple-50 border-purple-200",
          icon: TrendingUp,
          sign: "+",
        };
      default:
        return {
          color: "text-gray-700 bg-gray-50 border-gray-200",
          icon: History,
          sign: "",
        };
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <WalletIcon className="w-6 h-6 text-blue-600" /> Platform System
            Wallet
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track all platform revenue, penalties, and commissions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-linear-to-br from-blue-600 to-blue-700 p-6 rounded-xl shadow-md flex items-center justify-between text-white">
          <div>
            <p className="text-sm font-medium text-blue-100 mb-1">
              Available Balance
            </p>
            <p className="text-3xl font-bold">{formatMoney(balance)}</p>
            <p className="text-xs text-blue-200 mt-2 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Ready for withdrawal
            </p>
          </div>
          <div className="p-4 bg-white/10 rounded-xl">
            <WalletIcon className="w-8 h-8 text-white" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">
              Reserved Funds
            </p>
            <p className="text-3xl font-bold text-gray-900">
              {formatMoney(reserved)}
            </p>
            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Locked in active escrow
            </p>
          </div>
          <div className="p-4 bg-orange-50 rounded-xl">
            <History className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
            {tabTypes.map((type) => (
              <button
                key={type}
                onClick={() => handleTypeChange(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                  filterType === type
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search all transactions..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 min-w-225">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-900">
              <tr>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Balance After</th>
                <th className="px-6 py-4 font-medium">Reference</th>
                <th className="px-6 py-4 font-medium text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {txs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-16">
                    <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">
                      No transactions found.
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      {debouncedSearch || filterType !== "All"
                        ? "Try adjusting your search or filters."
                        : "The platform wallet has no history yet."}
                    </p>
                  </td>
                </tr>
              ) : (
                txs.map((t) => {
                  const style = getTxStyle(t.type);
                  const Icon = style.icon;
                  const isPositive = style.sign === "+";

                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-gray-50/80 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${style.color}`}
                        >
                          <Icon className="w-3.5 h-3.5" /> {t.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`font-bold text-base ${
                            isPositive ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {style.sign}
                          {formatMoney(t.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {formatMoney(t.balanceAfter)}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded border border-gray-100 inline-block max-w-62.5 truncate">
                          {t.reference || "—"}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right text-xs text-gray-500">
                        {formatDate(t.createdAt)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          pageSize={pageSize}
          totalCount={totalTx}
          onPageChange={goToPage}
          onPageSizeChange={changePageSize}
        />
      </div>
    </div>
  );
}
