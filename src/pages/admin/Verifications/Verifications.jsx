import PageTitle from "../../../components/PageTitle";
import { useEffect, useState, useMemo, useCallback } from "react";
import {
  getPendingVerifications,
  verifyProfile,
} from "../../../services/adminApi";
import { ShieldCheck, Phone, MapPin } from "lucide-react";
import { toast } from "../../../utils/toast";
import { SkeletonRow, Skeleton } from "../../../components/Skeleton";
import Pagination from "../../../components/Pagination/Pagination";
import RefreshButton from "../../../components/RefreshButton";

import ReviewModal from "./ReviewModal/ReviewModal";

export default function Verifications() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [zoomImage, setZoomImage] = useState(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const fetchProfiles = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await getPendingVerifications();
      setProfiles(res.data.data || []);
    } catch (err) {
      console.error(err);
      if (isRefresh) toast.error("Failed to load verifications.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    const status = data.status;
    const payload = {
      Status: status,
      RejectionReason: status === "Rejected" ? data.reason : null,
    };
    try {
      await verifyProfile(selected.id, payload);
      setSelected(null);
      fetchProfiles();
      toast.success(
        `Profile ${status === "Verified" ? "verified" : "rejected"} successfully!`,
      );
    } catch (err) {
      toast.errorFrom(err, "Error verifying profile.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      return "N/A";
    }
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const totalCount = profiles.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageItems = useMemo(
    () => profiles.slice((safePage - 1) * pageSize, safePage * pageSize),
    [profiles, safePage, pageSize],
  );

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-7 w-44" />
        </div>
        <div className="bg-surface rounded-xl border border-border-main shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-text-muted min-w-175">
              <thead className="bg-neutral-50 border-b border-border-main text-text-main">
                <tr>
                  <th className="px-6 py-4 font-medium">Applicant</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Contact</th>
                  <th className="px-6 py-4 font-medium">Submission Date</th>
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
      <PageTitle title="Verifications" />
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-text-main">
              Profile Verifications
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Review and verify the National ID documents submitted by users.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <RefreshButton onClick={() => fetchProfiles(true)} loading={refreshing} />
            <div className="bg-primary-50 text-primary-700 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> {profiles.length} Pending
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border-main shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-text-muted min-w-175">
              <thead className="bg-neutral-50 border-b border-border-main text-text-main">
                <tr>
                  <th className="px-6 py-4 font-medium">Applicant</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Contact</th>
                  <th className="px-6 py-4 font-medium">Submission Date</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main">
                {pageItems.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12">
                      <ShieldCheck className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                      <p className="text-text-muted font-medium">
                        All caught up!
                      </p>
                      <p className="text-neutral-400 text-xs mt-1">
                        No pending verifications at the moment.
                      </p>
                    </td>
                  </tr>
                ) : (
                  pageItems.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-neutral-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-text-main">
                          {p.fullName}
                        </div>
                        <div className="text-xs text-text-muted">
                          ID: #{p.id}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            p.role === "Seller"
                              ? "bg-accent-50 text-accent-700"
                              : "bg-primary-50 text-primary-700"
                          }`}
                        >
                          {p.role || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-neutral-700">
                          <Phone className="w-3.5 h-3.5 text-neutral-400" />
                          <span>{p.phoneNumber || "No phone"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-text-muted mt-1">
                          <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                          <span>{p.city || "No city"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{formatDate(p.createdAt)}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelected(p)}
                          className="inline-flex items-center gap-1.5 text-primary-600 hover:text-primary-800 font-medium bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4" /> Review
                        </button>
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

        <ReviewModal
          selected={selected}
          onClose={() => setSelected(null)}
          onSubmit={onSubmit}
          submitting={submitting}
          zoomImage={zoomImage}
          setZoomImage={setZoomImage}
        />
      </div>
    </>
  );
}
