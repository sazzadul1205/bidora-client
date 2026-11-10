import PageTitle from "../../../components/PageTitle";
import { useEffect, useState } from "react";
import { formatCurrency as formatMoney } from "../../../utils/currency";
import {
  Wallet as WalletIcon,
  History,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  CheckCircle2,
  Receipt,
} from "lucide-react";
import adminApi from "../../../services/adminApi";
import { Skeleton } from "../../../components/Skeleton";
import Pagination from "../../../components/Pagination/Pagination";
import { formatDateTime } from "../../../utils/date";

export default function PlatformWallet() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalTx, setTotalTx] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

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
        if (cancelled) {return;}
        const d = res.data.data;
        setData({
          wallet: d.wallet,
          transactions: d.transactions?.items || [],
          sellerBalances: d.sellerBalances || null,
          buyerBalances: d.buyerBalances || null,
        });
        setTotalTx(d.transactions?.totalCount || 0);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) {setLoading(false);}
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [page, pageSize, debouncedSearch, filterType]);

  const goToPage = (p) => {
    if (p === page) {return;}
    setLoading(true);
    setPage(p);
  };
  const changePageSize = (s) => {
    if (s === pageSize) {return;}
    setLoading(true);
    setPageSize(s);
    setPage(1);
  };
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
    setLoading(true);
  };
  const handleTypeChange = (type) => {
    if (type === filterType) {return;}
    setFilterType(type);
    setPage(1);
    setLoading(true);
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
  const seller = data?.sellerBalances || {
    balance: 0,
    reservedBalance: 0,
    total: 0,
  };
  const buyer = data?.buyerBalances || {
    balance: 0,
    reservedBalance: 0,
    total: 0,
  };
  const balance = Math.max(0, wallet?.balance ?? wallet?.Balance ?? 0);
  const tabTypes = ["All", "Penalty", "Commission"];

  const getTxStyle = (type) => {
    switch (type) {
      case "Credit":
      case "Release":
        return {
          color: "text-success-700 bg-success-50 border-success-200",
          icon: ArrowUpRight,
          sign: "+",
        };
      case "Debit":
      case "Penalty":
        return {
          color: "text-danger-700 bg-danger-50 border-danger-200",
          icon: ArrowDownRight,
          sign: "-",
        };
      case "Commission":
        return {
          color: "text-accent-700 bg-accent-50 border-accent-200",
          icon: TrendingUp,
          sign: "+",
        };
      default:
        return {
          color: "text-neutral-700 bg-neutral-50 border-border-main",
          icon: History,
          sign: "",
        };
    }
  };

  return (
    <>
      <PageTitle title="Platform Wallet" />
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-main flex items-center gap-2">
              <WalletIcon className="w-6 h-6 text-primary-600" /> Platform
              System Wallet
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Track all platform revenue, penalties, and commissions.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-linear-to-br from-primary-600 to-primary-700 p-6 rounded-xl shadow-md flex items-center justify-between text-text-inverse">
            <div>
              <p className="text-sm font-medium text-primary-100 mb-1">
                Platform Available Balance
              </p>
              <p className="text-3xl font-bold">{formatMoney(balance)}</p>
              <p className="text-xs text-primary-200 mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ready for withdrawal
              </p>
            </div>
            <div className="p-4 bg-surface/10 rounded-xl">
              <WalletIcon className="w-8 h-8 text-text-inverse" />
            </div>
          </div>
          <div className="bg-surface p-6 rounded-xl border border-border-main shadow-sm">
            <p className="text-sm font-medium text-text-muted mb-1">
              Total Held by Sellers
            </p>
            <p className="text-2xl font-bold text-text-main">
              {formatMoney(seller.total)}
            </p>
            <p className="text-xs text-text-muted mt-2">
              Available: {formatMoney(seller.balance)} · Reserved:{" "}
              {formatMoney(seller.reservedBalance)}
            </p>
          </div>
          <div className="bg-surface p-6 rounded-xl border border-border-main shadow-sm">
            <p className="text-sm font-medium text-text-muted mb-1">
              Total Held by Buyers
            </p>
            <p className="text-2xl font-bold text-text-main">
              {formatMoney(buyer.total)}
            </p>
            <p className="text-xs text-text-muted mt-2">
              Available: {formatMoney(buyer.balance)} · Reserved:{" "}
              {formatMoney(buyer.reservedBalance)}
            </p>
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border-main shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border-main bg-neutral-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
              {tabTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => handleTypeChange(type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                    filterType === type
                      ? "bg-primary-600 text-text-inverse shadow-sm"
                      : "bg-surface border border-border-main text-text-muted hover:bg-neutral-100"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search all transactions..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-9 pr-4 py-2 bg-surface border border-border-main rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-text-muted min-w-225">
              <thead className="bg-neutral-50 border-b border-border-main text-text-main">
                <tr>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Balance After</th>
                  <th className="px-6 py-4 font-medium">Reference</th>
                  <th className="px-6 py-4 font-medium text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main">
                {txs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-16">
                      <Receipt className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                      <p className="text-text-muted font-medium">
                        No transactions found.
                      </p>
                      <p className="text-neutral-400 text-xs mt-1">
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
                        className="hover:bg-neutral-50/80 transition-colors group"
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
                            className={`font-bold text-base ${isPositive ? "text-success-600" : "text-danger-600"}`}
                          >
                            {style.sign}
                            {formatMoney(t.amount)}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-text-main">
                          {formatMoney(t.balanceAfter)}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs text-text-muted font-mono bg-neutral-50 px-2 py-1 rounded border border-border-main inline-block max-w-60 truncate">
                            {t.reference || "—"}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-right text-xs text-text-muted">
                          {formatDateTime(t.createdAt)}
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
    </>
  );
}
