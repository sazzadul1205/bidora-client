import PageTitle from "../../../components/PageTitle";
import { useEffect, useState, useCallback } from "react";
import { getDepositRequests, reviewDepositRequest } from "../../../services/adminApi";
import { CheckCircle2, CreditCard, Hash, Receipt, Wallet, Clock, XCircle } from "lucide-react";
import { formatDateTime } from "../../../utils/date";
import { toast } from "../../../utils/toast";
import { formatCurrency as formatMoney } from "../../../utils/currency";
import { SkeletonRow, Skeleton } from "../../../components/Skeleton";
import Pagination from "../../../components/Pagination/Pagination";
import ReviewModal from "./ReviewModal/ReviewModal";

const STATUS_TABS = [
  { key: "PendingVerification", label: "Pending", icon: Clock },
  { key: "Approved", label: "Approved", icon: CheckCircle2 },
  { key: "Rejected", label: "Rejected", icon: XCircle },
  { key: "All", label: "All", icon: Receipt },
];

function StatusBadge({ status }) {
  const map = {
    PendingVerification: "bg-amber-50 text-amber-700 border-amber-200",
    Approved: "bg-green-50 text-green-700 border-green-200",
    Rejected: "bg-red-50 text-red-700 border-red-200",
  };
  const label = status === "PendingVerification" ? "Pending" : status;
  return <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded border ${map[status] || "bg-gray-50 text-gray-700 border-gray-200"}`}>{label}</span>;
}

export default function Deposits() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState("PendingVerification");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);

  const fetchRequests = useCallback(async (p = page, ps = pageSize, s = statusFilter) => {
    setLoading(true);
    try {
      const res = await getDepositRequests({ status: s, page: p, pageSize: ps });
      const payload = res.data;
      setItems(Array.isArray(payload?.data) ? payload.data : []);
      setTotalCount(payload?.pagination?.totalCount ?? payload?.data?.length ?? 0);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load deposit requests.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, statusFilter]);

  useEffect(() => { fetchRequests(page, pageSize, statusFilter); }, [fetchRequests, page, pageSize, statusFilter]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    const status = data.status;
    try {
      await reviewDepositRequest(selected.id, { Status: status, RejectionReason: status === "Rejected" ? data.reason : null });
      setSelected(null);
      fetchRequests(page, pageSize, statusFilter);
      toast.success(`Deposit ${status === "Approved" ? "approved" : "rejected"} successfully!`);
    } catch (err) {
      const serverMsg = err.response?.data?.message;
      const validationErrors = err.response?.data?.errors;
      let detail = serverMsg || "Error reviewing deposit.";
      if (validationErrors) detail = Object.values(validationErrors).flat().join(" ");
      toast.error(detail);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageTitle title="Deposits" />
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Deposit Requests</h1>
            <p className="text-sm text-gray-500 mt-1">Review pending deposits and view approved/rejected history.</p>
          </div>
          <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 self-start sm:self-auto">
            <Wallet className="w-4 h-4" /> {totalCount} {statusFilter === "All" ? "Total" : statusFilter === "PendingVerification" ? "Pending" : statusFilter}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {STATUS_TABS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => { setStatusFilter(key); setPage(1); }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition ${statusFilter === key ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"}`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 min-w-225">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-900">
                <tr>
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Method</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Reference</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <><SkeletonRow cols={7} /><SkeletonRow cols={7} /><SkeletonRow cols={7} /></>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12">
                      <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No deposit requests</p>
                      <p className="text-gray-400 text-xs mt-1">Nothing in “{STATUS_TABS.find(t=>t.key===statusFilter)?.label}”.</p>
                    </td>
                  </tr>
                ) : items.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 truncate max-w-45">{r.userName || r.userEmail || "—"}</div>
                      {r.userEmail && r.userName && <div className="text-xs text-gray-400 truncate max-w-45">{r.userEmail}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-gray-100 rounded-lg"><CreditCard className="w-4 h-4 text-gray-600" /></div>
                        <span className="font-medium text-gray-900">{r.method === "BankTransfer" ? "Bank Transfer" : r.method}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4"><span className="font-bold text-green-600 text-base">{formatMoney(r.amount)}</span></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-gray-600 font-mono text-xs"><Hash className="w-3.5 h-3.5 text-gray-400" />{r.transactionReference}</div>
                      {r.rejectionReason && <div className="text-xs text-red-500 mt-1 max-w-45 truncate" title={r.rejectionReason}>Reason: {r.rejectionReason}</div>}
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={r.status} />{r.reviewedAt && <div className="text-[11px] text-gray-400 mt-1">Reviewed {formatDateTime(r.reviewedAt)}</div>}</td>
                    <td className="px-6 py-4 text-xs text-gray-500">{r.createdAt ? formatDateTime(r.createdAt) : "N/A"}</td>
                    <td className="px-6 py-4 text-right">
                      {r.status === "PendingVerification" ? (
                        <button onClick={() => setSelected(r)} className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                          <CheckCircle2 className="w-4 h-4" /> Review
                        </button>
                      ) : (
                        <button onClick={() => setSelected(r)} className="inline-flex items-center gap-1.5 text-gray-700 hover:text-gray-900 font-medium bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors">
                          <Receipt className="w-4 h-4" /> View
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} pageSize={pageSize} totalCount={totalCount}
            onPageChange={setPage}
            onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} />
        </div>

        <ReviewModal selected={selected} onClose={() => setSelected(null)} onSubmit={onSubmit} submitting={submitting} readOnly={selected?.status !== "PendingVerification"} />
      </div>
    </>
  );
}
