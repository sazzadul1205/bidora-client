import PageTitle from "../../../components/PageTitle";
import { useEffect, useState, useCallback } from "react";
import {
  getAllDisputes,
  startDisputeReview,
  resolveDispute,
} from "../../../services/adminApi";
import {
  Scale,
  PlayCircle,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Calendar,
  Search,
  Package,
  Eye,
  MessageSquare,
} from "lucide-react";
import { toast } from "../../../utils/toast";
import { SkeletonRow, Skeleton } from "../../../components/Skeleton";
import Pagination from "../../../components/Pagination/Pagination";
import RefreshButton from "../../../components/RefreshButton";

import DetailsModal from "./DetailsModal/DetailsModal";
import ResolveModal from "./ResolveModal/ResolveModal";

export default function Disputes() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState(null);
  const [viewDetailsTarget, setViewDetailsTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Open");
  const [openCount, setOpenCount] = useState(0);
  const [reviewingCount, setReviewingCount] = useState(0);
  const [resolvedCount, setResolvedCount] = useState(0);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);

  const fetchDisputes = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await getAllDisputes({
        page,
        pageSize,
        search: searchTerm,
        filter: activeTab !== "All" ? activeTab : undefined,
      });
      const payload = res.data.data || res.data || [];
      const items = Array.isArray(payload) ? payload : payload.items || [];
      setDisputes(items);
      if (typeof res.data.pagination?.totalCount === "number") {
        setTotalCount(res.data.pagination.totalCount);
      } else if (typeof payload.totalCount === "number") {
        setTotalCount(payload.totalCount);
      }
      if (res.data.summary) {
        setOpenCount(res.data.summary.openCount ?? 0);
        setReviewingCount(res.data.summary.underReviewCount ?? 0);
        setResolvedCount(res.data.summary.resolvedCount ?? 0);
      }
    } catch (err) {
      console.error(err);
      if (isRefresh) toast.errorFrom(err, "Failed to load disputes.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, pageSize, searchTerm, activeTab]);

  useEffect(() => {
    fetchDisputes();
  }, [fetchDisputes]);

  const handleTabChange = (tab) => {
    if (tab === activeTab) {
      return;
    }
    setActiveTab(tab);
    setPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleStartReview = async (id) => {
    try {
      await startDisputeReview(id);
      await fetchDisputes();
      toast.success("Dispute moved to Under Review");
    } catch (err) {
      toast.errorFrom(err, "Failed to start review.");
    }
  };

  const onSubmitResolve = async (data) => {
    setSubmitting(true);
    try {
      await resolveDispute(selected.id, {
        faultType: data.faultType,
        adminDecision: data.adminDecision,
        applyPenalty: data.applyPenalty === "true",
      });
      setSelected(null);
      await fetchDisputes();
      toast.success("Dispute resolved successfully!");
    } catch (err) {
      toast.errorFrom(err, "Failed to resolve dispute.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      return "N/A";
    }
    return new Date(dateString).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageItems = disputes;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-64 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <div className="bg-surface rounded-xl border border-border-main overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-175 text-left text-sm text-text-muted">
              <thead className="bg-neutral-50 border-b border-border-main text-text-main">
                <tr>
                  <th className="px-6 py-4 font-medium">Dispute</th>
                  <th className="px-6 py-4 font-medium">Parties Involved</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main">
                <SkeletonRow cols={4} />
                <SkeletonRow cols={4} />
                <SkeletonRow cols={4} />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageTitle title="Disputes" />
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-main flex items-center gap-2">
              <Scale className="w-6 h-6 text-primary-600" /> Dispute Resolution
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Review complaints, assign fault, and apply penalties.
            </p>
          </div>
          <RefreshButton onClick={() => fetchDisputes(true)} loading={refreshing} className="self-start sm:self-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-surface p-5 rounded-xl border border-border-main shadow-sm flex items-center gap-4">
            <div
              className={`p-3 rounded-lg shrink-0 ${openCount > 0 ? "bg-warning-50 text-warning-600" : "bg-neutral-50 text-neutral-400"}`}
            >
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted">
                Open Disputes
              </p>
              <p className="text-2xl font-bold text-text-main">{openCount}</p>
            </div>
          </div>
          <div className="bg-surface p-5 rounded-xl border border-border-main shadow-sm flex items-center gap-4">
            <div
              className={`p-3 rounded-lg shrink-0 ${reviewingCount > 0 ? "bg-primary-50 text-primary-600" : "bg-neutral-50 text-neutral-400"}`}
            >
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted">
                Under Review
              </p>
              <p className="text-2xl font-bold text-text-main">
                {reviewingCount}
              </p>
            </div>
          </div>
          <div className="bg-surface p-5 rounded-xl border border-border-main shadow-sm flex items-center gap-4">
            <div className="p-3 bg-success-50 text-success-600 rounded-lg shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted">Resolved</p>
              <p className="text-2xl font-bold text-text-main">
                {resolvedCount}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border-main shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border-main bg-neutral-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              {["Open", "UnderReview", "Resolved", "All"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${activeTab === tab
                    ? "bg-primary-600 text-text-inverse shadow-sm"
                    : "bg-surface border border-border-main text-text-muted hover:bg-neutral-100"
                    }`}
                >
                  {tab === "UnderReview" ? "Under Review" : tab}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by name, ID or complaint..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-9 pr-4 py-2 bg-surface border border-border-main rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-text-muted min-w-200">
              <thead className="bg-neutral-50 border-b border-border-main text-text-main">
                <tr>
                  <th className="px-6 py-4 font-medium w-[20%]">Dispute</th>
                  <th className="px-6 py-4 font-medium w-[45%]">
                    Parties Involved
                  </th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main">
                {pageItems.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-16">
                      <Scale className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                      <p className="text-text-muted font-medium">
                        No disputes found.
                      </p>
                    </td>
                  </tr>
                ) : (
                  pageItems.map((d) => (
                    <tr
                      key={d.id}
                      className="hover:bg-neutral-50/80 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-text-main">
                            Dispute #{d.id}
                          </p>
                          <p className="text-xs text-text-muted mt-0.5 flex items-center gap-1">
                            <Package className="w-3 h-3" /> Sale #{d.saleId}
                          </p>
                          <p className="text-[11px] text-neutral-400 mt-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />{" "}
                            {formatDate(d.createdAt)}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2 text-xs">
                              <span className="font-semibold text-neutral-800">
                                {d.raisedByRole || d.raisedByName}
                              </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${d.raisedByRole === "Buyer"
                                ? "bg-primary-100 text-primary-700"
                                : d.raisedByRole === "Seller"
                                  ? "bg-warning-100 text-warning-700"
                                  : "bg-neutral-100 text-neutral-700"
                                }`}
                            >
                              {d.raisedByRole}
                            </span>
                            <span className="text-neutral-400 font-medium">
                              raised against
                            </span>
                              <span className="font-semibold text-neutral-800">
                                {d.againstRole || d.againstName}
                              </span>
                          </div>
                          <p className="text-xs text-text-muted line-clamp-1 italic">
                            "{d.complaint}"
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {d.status === "Open" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-warning-50 text-warning-700 border border-warning-200">
                            <AlertTriangle className="w-3.5 h-3.5" /> Open
                          </span>
                        )}
                        {d.status === "UnderReview" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-primary-50 text-primary-700 border border-primary-200">
                            <ShieldAlert className="w-3.5 h-3.5" /> Under Review
                          </span>
                        )}
                        {d.status === "Resolved" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-success-50 text-success-700 border border-success-200">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {d.status === "Open" && (
                            <button
                              onClick={() => handleStartReview(d.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-warning-700 bg-warning-50 hover:bg-warning-100 border border-warning-200 rounded-lg transition-colors"
                            >
                              <PlayCircle className="w-3.5 h-3.5" /> Start Review
                            </button>
                          )}

                          {/* UPDATED BUTTONS FOR UNDERREVIEW */}
                          {d.status === "UnderReview" && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setViewDetailsTarget(d)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-text-main bg-surface border border-border-main hover:bg-neutral-50 rounded-lg transition-colors"
                              >
                                <MessageSquare className="w-3.5 h-3.5" /> Messages
                              </button>
                              <button
                                onClick={() => setSelected(d)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-text-inverse bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm transition-colors"
                              >
                                <Scale className="w-3.5 h-3.5" /> Resolve
                              </button>
                            </div>
                          )}

                          {d.status === "Resolved" && (
                            <button
                              onClick={() => setViewDetailsTarget(d)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-text-main bg-neutral-100 hover:bg-neutral-200 border border-border-main rounded-lg transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" /> View Details
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            page={safePage}
            pageSize={pageSize}
            totalCount={totalCount}
            onPageChange={setPage}
            onPageSizeChange={(s) => {
              setPageSize(s);
              setPage(1);
            }}
          />
        </div>

        <DetailsModal
          target={viewDetailsTarget}
          onClose={() => setViewDetailsTarget(null)}
        />
        <ResolveModal
          selected={selected}
          onClose={() => setSelected(null)}
          onSubmit={onSubmitResolve}
          submitting={submitting}
        />
      </div>
    </>
  );
}