import PageTitle from "../../../components/PageTitle";
import { useEffect, useState } from "react";
import { getAllTransactions, getAllReservations } from "../../../services/adminApi";
import { formatCurrency as formatMoney } from "../../../utils/currency";
import {
  DollarSign, ArrowUpRight, ArrowDownRight, Lock, Search, ShieldCheck, Wallet, Activity,
} from "lucide-react";
import { SkeletonRow } from "../../../components/Skeleton";
import { toast } from "../../../utils/toast";
import { formatDateTime } from "../../../utils/date";
import Pagination from "../../../components/Pagination/Pagination";

export default function AdminTransactions() {
  const [activeTab, setActiveTab] = useState("transactions");

  const [transactions, setTransactions] = useState([]);
  const [txPage, setTxPage] = useState(1);
  const [txPageSize, setTxPageSize] = useState(20);
  const [txTotal, setTxTotal] = useState(0);
  const [txTypeFilter, setTxTypeFilter] = useState("All");
  const [txSearchTerm, setTxSearchTerm] = useState("");
  const [txDebouncedSearch, setTxDebouncedSearch] = useState("");

  const [reservations, setReservations] = useState([]);
  const [resPage, setResPage] = useState(1);
  const [resPageSize, setResPageSize] = useState(20);
  const [resSearchTerm, setResSearchTerm] = useState("");
  const [resDebouncedSearch, setResDebouncedSearch] = useState("");

  const [stats, setStats] = useState({
    totalVolume: 0,
    totalEscrow: 0,
    totalBuyerDeposits: 0,
    totalSellerDeposits: 0,
    totalActiveReservations: 0,
  });

  const [loading, setLoading] = useState(true);
  const [resTotal, setResTotal] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setTxDebouncedSearch(txSearchTerm.trim()), 300);
    return () => clearTimeout(t);
  }, [txSearchTerm]);

  useEffect(() => {
    const t = setTimeout(() => setResDebouncedSearch(resSearchTerm.trim()), 300);
    return () => clearTimeout(t);
  }, [resSearchTerm]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [txRes, resRes] = await Promise.all([
          getAllTransactions({
            page: txPage,
            pageSize: txPageSize,
            search: txDebouncedSearch || undefined,
            filter: txTypeFilter !== "All" ? txTypeFilter : undefined,
          }),
          getAllReservations({
            page: resPage,
            pageSize: resPageSize,
            search: resDebouncedSearch || undefined,
          }),
        ]);
        if (cancelled) {return;}

        const txData = txRes.data.data || {};
        setTransactions(txData.items || []);
        setTxTotal(txData.totalCount || 0);
        setStats({
          totalVolume: txData.totalVolume ?? 0,
          totalEscrow: txData.totalEscrow ?? 0,
          totalBuyerDeposits: txData.totalBuyerDeposits ?? 0,
          totalSellerDeposits: txData.totalSellerDeposits ?? 0,
          totalActiveReservations: txData.totalActiveReservations ?? 0,
        });

        const resData = resRes.data.data || [];
        setReservations(Array.isArray(resData) ? resData : resData.items || []);
        if (typeof resRes.data.totalCount === "number") {
          setResTotal(resRes.data.totalCount);
        } else if (Array.isArray(resData)) {
          setResTotal(resData.length);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {toast.error("Failed to load financial ledger.");}
      } finally {
        if (!cancelled) {setLoading(false);}
      }
    })();
    return () => { cancelled = true; };
  }, [txPage, txPageSize, txDebouncedSearch, txTypeFilter, resPage, resPageSize, resDebouncedSearch]);

  const goToTxPage = (p) => { if (p === txPage) {return;} setLoading(true); setTxPage(p); };
  const changeTxPageSize = (s) => { if (s === txPageSize) {return;} setLoading(true); setTxPageSize(s); setTxPage(1); };
  const handleTxSearch = (e) => { setTxSearchTerm(e.target.value); setTxPage(1); setLoading(true); };
  const handleTxTypeChange = (e) => { setTxTypeFilter(e.target.value); setTxPage(1); setLoading(true); };
  const handleResSearch = (e) => { setResSearchTerm(e.target.value); setResPage(1); };
  const handleTabChange = (tab) => {
    if (tab === activeTab) {return;}
    setActiveTab(tab);
    if (tab === "reservations") {setResPage(1);}
  };

  const formatDate = (dateString) => {
    if (!dateString) {return "N/A";}
    return formatDateTime(dateString);
  };

  const resTotalPages = Math.max(1, Math.ceil(resTotal / resPageSize));
  const safeResPage = Math.min(resPage, resTotalPages);
  const resPageItems = reservations;

  return (
    <>
      <PageTitle title="Transactions" />
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-main flex items-center gap-2">
              <Activity className="w-6 h-6 text-primary-600" /> Financial Ledger
            </h1>
            <p className="text-sm text-text-muted mt-1">Monitor global transactions, escrow funds, and active reservations.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-surface p-5 rounded-xl border border-border-main shadow-sm flex items-center gap-4">
            <div className="p-3 bg-primary-50 text-primary-600 rounded-lg shrink-0"><DollarSign className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-text-muted">Total Volume</p>
              <p className="text-2xl font-bold text-text-main">{formatMoney(stats.totalVolume)}</p>
            </div>
          </div>
          <div className="bg-surface p-5 rounded-xl border border-border-main shadow-sm flex items-center gap-4">
            <div className="p-3 bg-accent-50 text-accent-600 rounded-lg shrink-0"><ShieldCheck className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-text-muted">Held in Escrow</p>
              <p className="text-2xl font-bold text-text-main">{formatMoney(stats.totalEscrow)}</p>
            </div>
          </div>
          <div className="bg-surface p-5 rounded-xl border border-border-main shadow-sm flex items-center gap-4">
            <div className="p-3 bg-warning-50 text-warning-600 rounded-lg shrink-0"><Lock className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-text-muted">Buyer Deposits</p>
              <p className="text-2xl font-bold text-text-main">{formatMoney(stats.totalBuyerDeposits)}</p>
            </div>
          </div>
          <div className="bg-surface p-5 rounded-xl border border-border-main shadow-sm flex items-center gap-4">
            <div className="p-3 bg-accent-50 text-accent-600 rounded-lg shrink-0"><Wallet className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-text-muted">Seller Deposits</p>
              <p className="text-2xl font-bold text-text-main">{formatMoney(stats.totalSellerDeposits)}</p>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border-main shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border-main bg-neutral-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 bg-neutral-100 p-1 rounded-lg w-fit">
              <button
                onClick={() => handleTabChange("transactions")}
                className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                  activeTab === "transactions"
                    ? "bg-surface text-text-main shadow-sm"
                    : "text-text-muted hover:text-text-main"
                }`}
              >
                Global Transactions
              </button>
              <button
                onClick={() => handleTabChange("reservations")}
                className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                  activeTab === "reservations"
                    ? "bg-surface text-text-main shadow-sm"
                    : "text-text-muted hover:text-text-main"
                }`}
              >
                Active Reservations ({stats.totalActiveReservations})
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
              {activeTab === "transactions" && (
                <select
                  value={txTypeFilter}
                  onChange={handleTxTypeChange}
                  className="px-3 py-2 bg-surface border border-border-main rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="All">All Types</option>
                  <option value="Credit">Credit</option>
                  <option value="Debit">Debit</option>
                  <option value="Release">Release</option>
                  <option value="Penalty">Penalty</option>
                  <option value="Commission">Commission</option>
                </select>
              )}
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder={activeTab === "transactions" ? "Search all transactions..." : "Search reservations..."}
                  value={activeTab === "transactions" ? txSearchTerm : resSearchTerm}
                  onChange={activeTab === "transactions" ? handleTxSearch : handleResSearch}
                  className="w-full pl-9 pr-4 py-2 bg-surface border border-border-main rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
            </div>
          </div>

          {activeTab === "transactions" && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-text-muted min-w-200">
                  <thead className="bg-neutral-50 border-b border-border-main text-text-main">
                    <tr>
                      <th className="px-6 py-4 font-medium">User</th>
                      <th className="px-6 py-4 font-medium">Type</th>
                      <th className="px-6 py-4 font-medium">Amount</th>
                      <th className="px-6 py-4 font-medium">Reference</th>
                      <th className="px-6 py-4 font-medium text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-main">
                    {loading ? (
                      <><SkeletonRow cols={5} /><SkeletonRow cols={5} /><SkeletonRow cols={5} /></>
                    ) : transactions.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-12 text-text-muted">No transactions found.</td>
                      </tr>
                    ) : (
                      transactions.map((t) => {
                        const isPositive = ["Credit", "Release", "Commission"].includes(t.type);
                        return (
                          <tr key={t.id} className="hover:bg-neutral-50/80 transition-colors">
                            <td className="px-6 py-4">
                              <div>
                                <p className="font-semibold text-text-main">{t.userName}</p>
                                <p className="text-xs text-text-muted">{t.userEmail}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${
                                t.type === "Credit" ? "bg-success-50 text-success-700 border-success-200"
                                : t.type === "Debit" ? "bg-danger-50 text-danger-700 border-danger-200"
                                : t.type === "Penalty" ? "bg-warning-50 text-warning-700 border-warning-200"
                                : t.type === "Commission" ? "bg-accent-50 text-accent-700 border-accent-200"
                                : "bg-neutral-100 text-neutral-700 border-border-main"
                              }`}>
                                {isPositive ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                                {t.type}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`font-bold ${isPositive ? "text-success-600" : "text-danger-600"}`}>
                                {isPositive ? "+" : "-"}{formatMoney(t.amount)}
                              </span>
                              <p className="text-[11px] text-neutral-400 mt-0.5">Bal: {formatMoney(t.balanceAfter)}</p>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-xs font-mono bg-neutral-50 px-2 py-1 rounded border border-border-main">
                                {t.reference || "—"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right text-xs text-text-muted">{formatDate(t.createdAt)}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination page={txPage} pageSize={txPageSize} totalCount={txTotal} onPageChange={goToTxPage} onPageSizeChange={changeTxPageSize} />
            </>
          )}

          {activeTab === "reservations" && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-text-muted min-w-200">
                  <thead className="bg-neutral-50 border-b border-border-main text-text-main">
                    <tr>
                      <th className="px-6 py-4 font-medium">User</th>
                      <th className="px-6 py-4 font-medium">Type</th>
                      <th className="px-6 py-4 font-medium">Item</th>
                      <th className="px-6 py-4 font-medium">Amount</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-main">
                    {loading ? (
                      <><SkeletonRow cols={5} /><SkeletonRow cols={5} /><SkeletonRow cols={5} /></>
                    ) : resPageItems.length === 0 ? (
                      <tr><td colSpan="5" className="text-center py-12 text-text-muted">No active reservations found.</td></tr>
                    ) : (
                      resPageItems.map((r) => (
                        <tr key={r.id} className="hover:bg-neutral-50/80 transition-colors">
                          <td className="px-6 py-4"><p className="font-semibold text-text-main">{r.userName}</p></td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${
                              r.type === "SaleEscrow" ? "bg-accent-50 text-accent-700 border-accent-200"
                              : r.type === "BuyerFunds" ? "bg-warning-50 text-warning-700 border-warning-200"
                              : "bg-primary-50 text-primary-700 border-primary-200"
                            }`}>
                              {r.type === "SaleEscrow" ? <ShieldCheck className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                              {r.type}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-text-main line-clamp-1">{r.productTitle || "N/A"}</p>
                            <p className="text-xs text-neutral-400 mt-0.5">
                              {r.auctionId ? `Auction #${r.auctionId}` : ""} {r.saleId ? `Sale #${r.saleId}` : ""}
                            </p>
                          </td>
                          <td className="px-6 py-4"><span className="font-bold text-text-main">{formatMoney(r.amount)}</span></td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                              r.status === "Reserved" ? "bg-warning-100 text-warning-700"
                              : r.status === "Forfeited" ? "bg-danger-100 text-danger-700"
                              : "bg-neutral-100 text-neutral-700"
                            }`}>
                              {r.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination page={safeResPage} pageSize={resPageSize} totalCount={resTotal} onPageChange={setResPage} onPageSizeChange={(s) => { setResPageSize(s); setResPage(1); }} />
            </>
          )}
        </div>
      </div>
    </>
  );
}