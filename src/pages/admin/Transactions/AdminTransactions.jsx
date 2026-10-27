import { useEffect, useState } from "react";
import { getAllTransactions, getAllReservations } from "../../../services/adminApi";
import {
  DollarSign, ArrowUpRight, ArrowDownRight, Lock, Search,
  ShieldCheck, Wallet, Activity
} from "lucide-react";
import { Skeleton } from "../../../components/Skeleton";
import { toast } from "../../../utils/toast";

export default function AdminTransactions() {
  const [activeTab, setActiveTab] = useState("transactions");
  const [transactions, setTransactions] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [txRes, resRes] = await Promise.all([
          getAllTransactions(),
          getAllReservations(),
        ]);
        if (mounted) {
          setTransactions(txRes.data.data || []);
          setReservations(resRes.data.data || []);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load financial ledger.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const formatMoney = (num) =>
    `$${Number(num || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  };

  // --- CALCULATE STATS (Fixed to camelCase) ---
  const activeReservations = reservations.filter((r) => r.status === "Reserved");

  const totalEscrow = activeReservations
    .filter((r) => r.type === "SaleEscrow")
    .reduce((sum, r) => sum + r.amount, 0);

  const totalBuyerDeposits = activeReservations
    .filter((r) => r.type === "BuyerFunds")
    .reduce((sum, r) => sum + r.amount, 0);

  const totalSellerDeposits = activeReservations
    .filter((r) => r.type === "SellerDeposit")
    .reduce((sum, r) => sum + r.amount, 0);

  const totalVolume = transactions
    .filter((t) => t.type === "Credit" || t.type === "Debit")
    .reduce((sum, t) => sum + t.amount, 0);

  // --- FILTERING (Fixed to camelCase) ---
  const filteredTransactions = transactions.filter(
    (t) =>
      t.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.reference?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredReservations = reservations.filter(
    (r) =>
      r.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.productTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-64 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-600" /> Financial Ledger
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor global transactions, escrow funds, and active reservations.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Volume</p>
            <p className="text-2xl font-bold text-gray-900">{formatMoney(totalVolume)}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Held in Escrow</p>
            <p className="text-2xl font-bold text-gray-900">{formatMoney(totalEscrow)}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-lg shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Buyer Deposits</p>
            <p className="text-2xl font-bold text-gray-900">{formatMoney(totalBuyerDeposits)}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Seller Deposits</p>
            <p className="text-2xl font-bold text-gray-900">{formatMoney(totalSellerDeposits)}</p>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

        {/* Toolbar & Tabs */}
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab("transactions")}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${activeTab === "transactions"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
                }`}
            >
              Global Transactions
            </button>
            <button
              onClick={() => setActiveTab("reservations")}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${activeTab === "reservations"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
                }`}
            >
              Active Reservations ({activeReservations.length})
            </button>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or ref..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Transactions Table */}
        {activeTab === "transactions" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 min-w-200">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-900">
                <tr>
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Reference</th>
                  <th className="px-6 py-4 font-medium text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-gray-500">
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((t) => {
                    const isPositive = ["Credit", "Release", "Commission"].includes(t.type);
                    return (
                      <tr key={t.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-gray-900">{t.userName}</p>
                            <p className="text-xs text-gray-500">{t.userEmail}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${t.type === "Credit" ? "bg-green-50 text-green-700 border-green-200" :
                              t.type === "Debit" ? "bg-red-50 text-red-700 border-red-200" :
                                t.type === "Penalty" ? "bg-orange-50 text-orange-700 border-orange-200" :
                                  t.type === "Commission" ? "bg-purple-50 text-purple-700 border-purple-200" :
                                    "bg-gray-100 text-gray-700 border-gray-200"
                            }`}>
                            {isPositive ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                            {t.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-bold ${isPositive ? "text-green-600" : "text-red-600"}`}>
                            {isPositive ? "+" : "-"}{formatMoney(t.amount)}
                          </span>
                          <p className="text-[11px] text-gray-400 mt-0.5">Bal: {formatMoney(t.balanceAfter)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-mono bg-gray-50 px-2 py-1 rounded border border-gray-200">
                            {t.reference || "—"}
                          </span>
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
        )}

        {/* Reservations Table */}
        {activeTab === "reservations" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 min-w-200">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-900">
                <tr>
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Item</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredReservations.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-gray-500">
                      No active reservations found.
                    </td>
                  </tr>
                ) : (
                  filteredReservations.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">{r.userName}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${r.type === "SaleEscrow" ? "bg-indigo-50 text-indigo-700 border-indigo-200" :
                            r.type === "BuyerFunds" ? "bg-orange-50 text-orange-700 border-orange-200" :
                              "bg-purple-50 text-purple-700 border-purple-200"
                          }`}>
                          {r.type === "SaleEscrow" ? <ShieldCheck className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          {r.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900 line-clamp-1">{r.productTitle || "N/A"}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {r.auctionId ? `Auction #${r.auctionId}` : ""} {r.saleId ? `Sale #${r.saleId}` : ""}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-900">{formatMoney(r.amount)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${r.status === "Reserved" ? "bg-amber-100 text-amber-700" :
                            r.status === "Forfeited" ? "bg-red-100 text-red-700" :
                              "bg-gray-100 text-gray-700"
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
        )}
      </div>
    </div>
  );
}